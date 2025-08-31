import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    // Try to insert a simple test campaign
    const { data, error } = await supabase
      .from("campaigns")
      .insert({ 
        campaign_id: "test-" + Date.now(),
        campaign_name: "Test Campaign " + new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        errorCode: error.code,
        details: error.details,
        hint: error.hint
      })
    }

    return NextResponse.json({
      success: true,
      message: "Test campaign inserted successfully",
      data: data
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      step: "insert_failed"
    })
  }
}
