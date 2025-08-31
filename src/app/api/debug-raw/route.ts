import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    
    console.log("=== RAW DATA DEBUG ===")
    console.log("Campaign ID:", campaignId)
    
    const supabase = createServiceClient()
    
    // Query raw data exactly like DatabaseService
    let query = supabase
      .from("campaign_content_raw")
      .select("*")

    if (campaignId) {
      query = query.eq("campaign_id", campaignId)
    }

    const { data, error } = await query
    
    console.log("Raw query result:", { data, error })
    
    return NextResponse.json({
      success: true,
      campaignId,
      query: {
        table: "campaign_content_raw",
        filter: `campaign_id = "${campaignId}"`,
        select: "*"
      },
      result: {
        error: error?.message || null,
        dataCount: data?.length || 0,
        data: data || [],
        sample: data?.[0] || null
      }
    })
    
  } catch (error) {
    console.error("Raw data debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
