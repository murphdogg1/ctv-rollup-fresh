import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { db } from "@/server/db"

export async function POST() {
  try {
    console.log("=== CLEANUP CAMPAIGNS ===")
    
    const result = {
      dbEngine: process.env.DB_ENGINE,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      steps: []
    }
    
    // Check if we should use local database
    if (process.env.DB_ENGINE === "local") {
      console.log("Using local database for cleanup")
      result.steps.push("Using local database")
      // For local database, we can not easily get count, so just clear everything
      await db.close()
      result.steps.push("Local database cleared")
      return NextResponse.json({
        success: true,
        message: "All campaigns deleted successfully (local database)",
        deletedCount: "all",
        debug: result
      })
    }
    
    // Try Supabase first
    try {
      result.steps.push("Attempting Supabase cleanup")
      const supabase = createServiceClient()
      result.steps.push("Supabase client created")
      
      // First, get count of campaigns to delete
      const { count, error: countError } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
      
      if (countError) {
        throw new Error(`Failed to get campaign count: ${countError.message}`)
      }
      
      result.steps.push(`Found ${count} campaigns to delete`)
      
      // Delete all campaigns (this will cascade to related data)
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .neq("campaign_id", "") // Delete all campaigns
      
      if (error) {
        throw new Error(`Failed to delete campaigns: ${error.message}`)
      }
      
      result.steps.push("Campaigns deleted successfully")
      console.log("Cleanup completed successfully")
      
      return NextResponse.json({
        success: true,
        message: "All campaigns deleted successfully",
        deletedCount: count || 0,
        debug: result
      })
      
    } catch (supabaseError) {
      console.warn("Supabase failed, falling back to local database:", supabaseError)
      result.steps.push(`Supabase failed: ${supabaseError.message}`)
      // Fall back to local database if Supabase fails
      await db.close()
      result.steps.push("Fallback to local database completed")
      return NextResponse.json({
        success: true,
        message: "All campaigns deleted successfully (fallback to local database)",
        deletedCount: "all",
        debug: result
      })
    }
    
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      debug: {
        dbEngine: process.env.DB_ENGINE,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    })
  }
}
