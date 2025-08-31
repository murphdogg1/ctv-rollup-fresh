import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    const supabase = createServiceClient()
    
    console.log("=== DETAILED ROLLUP DEBUG ===")
    console.log("Campaign ID:", campaignId)
    
    // Step 1: Get raw content data
    const { data: rawData, error: rawError } = await supabase
      .from("campaign_content_raw")
      .select("*")
      .eq("campaign_id", campaignId)
    
    console.log("Raw data query result:", { data: rawData, error: rawError })
    console.log("Raw data count:", rawData?.length || 0)
    console.log("Sample raw data:", rawData?.[0])
    
    if (rawError) {
      return NextResponse.json({
        success: false,
        error: `Raw data query failed: ${rawError.message}`
      })
    }
    
    if (!rawData || rawData.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No raw content data found for this campaign"
      })
    }
    
    // Step 2: Test app rollup calculation manually
    const appRollupMap = new Map()
    
    for (const item of rawData) {
      const key = `${item.campaign_id}-${item.content_network_name}`
      console.log("Processing item:", item)
      console.log("Generated key:", key)
      
      if (!appRollupMap.has(key)) {
        appRollupMap.set(key, {
          campaign_id: item.campaign_id,
          app_name: item.content_network_name,
          impressions: 0,
          completes: 0,
          avg_vcr: 0,
          content_count: 0
        })
      }
      
      const rollup = appRollupMap.get(key)
      rollup.impressions += item.impression || 0
      rollup.completes += item.quartile100 || 0
      rollup.content_count += 1
      
      console.log("Updated rollup:", rollup)
    }
    
    // Calculate VCR
    for (const rollup of appRollupMap.values()) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0
    }
    
    const appRollupResult = Array.from(appRollupMap.values())
    console.log("Final app rollup result:", appRollupResult)
    
    return NextResponse.json({
      success: true,
      campaignId,
      rawData: {
        count: rawData.length,
        sample: rawData[0]
      },
      appRollup: {
        count: appRollupResult.length,
        data: appRollupResult
      },
      debug: {
        mapSize: appRollupMap.size,
        keys: Array.from(appRollupMap.keys())
      }
    })
    
  } catch (error) {
    console.error("Detailed rollup debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
