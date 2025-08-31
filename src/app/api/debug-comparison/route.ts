import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    const supabase = createServiceClient()
    
    console.log("=== COMPARISON DEBUG ===")
    console.log("Campaign ID:", campaignId)
    
    // Step 1: Get raw data
    const { data: rawData, error: rawError } = await supabase
      .from("campaign_content_raw")
      .select("*")
      .eq("campaign_id", campaignId)
    
    console.log("Raw data count:", rawData?.length || 0)
    console.log("Raw data sample:", rawData?.[0])
    
    if (rawError) {
      return NextResponse.json({
        success: false,
        error: `Raw data query failed: ${rawError.message}`
      })
    }
    
    // Step 2: Manual calculation (working)
    const manualRollupMap = new Map()
    
    for (const item of rawData || []) {
      const key = `${item.campaign_id}-${item.content_network_name}`
      
      if (!manualRollupMap.has(key)) {
        manualRollupMap.set(key, {
          campaign_id: item.campaign_id,
          app_name: item.content_network_name,
          impressions: 0,
          completes: 0,
          avg_vcr: 0,
          content_count: 0
        })
      }
      
      const rollup = manualRollupMap.get(key)
      rollup.impressions += item.impression || 0
      rollup.completes += item.quartile100 || 0
      rollup.content_count += 1
    }
    
    // Calculate VCR
    for (const rollup of manualRollupMap.values()) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0
    }
    
    const manualResult = Array.from(manualRollupMap.values())
    console.log("Manual calculation result:", manualResult)
    
    // Step 3: DatabaseService calculation (failing)
    console.log("Calling DatabaseService.getAppRollup...")
    const dbServiceResult = await DatabaseService.getAppRollup(campaignId)
    console.log("DatabaseService result:", dbServiceResult)
    
    return NextResponse.json({
      success: true,
      campaignId,
      rawData: {
        count: rawData?.length || 0,
        sample: rawData?.[0]
      },
      manualCalculation: {
        count: manualResult.length,
        data: manualResult
      },
      databaseService: {
        count: dbServiceResult.length,
        data: dbServiceResult
      },
      comparison: {
        manualWorks: manualResult.length > 0,
        dbServiceWorks: dbServiceResult.length > 0,
        sameResult: JSON.stringify(manualResult) === JSON.stringify(dbServiceResult)
      }
    })
    
  } catch (error) {
    console.error("Comparison debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
