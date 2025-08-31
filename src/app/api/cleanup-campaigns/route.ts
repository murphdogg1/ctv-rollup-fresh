import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function POST() {
  try {
    console.log("=== CLEANUP CAMPAIGNS ===")
    
    const supabase = createServiceClient()
    
    // Delete all campaigns (this will cascade to related data)
    const { data, error } = await supabase
      .from("campaigns")
      .delete()
      .neq("campaign_id", "") // Delete all campaigns
    
    if (error) {
      console.error("Cleanup error:", error)
      return NextResponse.json({
        success: false,
        error: error.message
      })
    }
    
    console.log("Cleanup completed successfully")
    
    return NextResponse.json({
      success: true,
      message: "All campaigns deleted successfully",
      deletedCount: data?.length || 0
    })
    
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
