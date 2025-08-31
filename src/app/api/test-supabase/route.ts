import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      dbEngine: process.env.DB_ENGINE,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + "...",
    }

    console.log("Environment check:", envCheck)

    // Try to create Supabase client
    const supabase = createServiceClient()
    console.log("Supabase client created successfully")

    // Test a simple query
    const { data, error } = await supabase
      .from("campaigns")
      .select("count", { count: "exact", head: true })

    if (error) {
      console.error("Supabase query error:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        envCheck,
        step: "query_failed"
      })
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      count: data?.[0]?.count || 0,
      envCheck,
      step: "success"
    })

  } catch (error) {
    console.error("Supabase test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      envCheck: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        dbEngine: process.env.DB_ENGINE,
      },
      step: "client_creation_failed"
    })
  }
}
