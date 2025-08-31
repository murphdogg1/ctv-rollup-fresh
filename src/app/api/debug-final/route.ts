import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    
    console.log("=== FINAL DEBUG COMPARISON ===")
    console.log("Campaign ID:", campaignId)
    
    // Approach 1: Step-by-step (working)
    console.log("--- APPROACH 1: STEP-BY-STEP ---")
    const supabase = createServiceClient()
    
    let query = supabase
      .from("campaign_content_raw")
      .select("*")
      .eq("campaign_id", campaignId)
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: `Query failed: ${error.message}`
      })
    }
    
    const rollupMap = new Map<string, any>()
    
    for (const item of data || []) {
      const key = `${item.campaign_id}-${item.content_network_name}`
      
      if (!rollupMap.has(key)) {
        rollupMap.set(key, {
          campaign_id: item.campaign_id,
          app_name: item.content_network_name,
          impressions: 0,
          completes: 0,
          avg_vcr: 0,
          content_count: 0
        })
      }
      
      const rollup = rollupMap.get(key)!
      rollup.impressions += item.impression || 0
      rollup.completes += item.quartile100 || 0
      rollup.content_count += 1
    }
    
    for (const rollup of rollupMap.values()) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0
    }
    
    const stepByStepResult = Array.from(rollupMap.values()).sort((a, b) => b.impressions - a.impressions)
    console.log("Step-by-step result:", stepByStepResult)
    
    // Approach 2: DatabaseService (failing)
    console.log("--- APPROACH 2: DATABASE SERVICE ---")
    const dbServiceResult = await DatabaseService.getAppRollup(campaignId)
    console.log("DatabaseService result:", dbServiceResult)
    
    // Compare results
    const stepByStepJson = JSON.stringify(stepByStepResult)
    const dbServiceJson = JSON.stringify(dbServiceResult)
    const areEqual = stepByStepJson === dbServiceJson
    
    console.log("Results equal:", areEqual)
    console.log("Step-by-step JSON:", stepByStepJson)
    console.log("DatabaseService JSON:", dbServiceJson)
    
    return NextResponse.json({
      success: true,
      campaignId,
      comparison: {
        stepByStep: {
          count: stepByStepResult.length,
          data: stepByStepResult
        },
        databaseService: {
          count: dbServiceResult.length,
          data: dbServiceResult
        },
        areEqual,
        stepByStepJson,
        dbServiceJson
      }
    })
    
  } catch (error) {
    console.error("Final debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
