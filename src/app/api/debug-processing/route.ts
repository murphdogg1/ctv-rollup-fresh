import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    
    console.log("=== PROCESSING DEBUG ===")
    console.log("Campaign ID:", campaignId)
    
    const supabase = createServiceClient()
    
    // Step 1: Get raw data (we know this works)
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
    
    console.log("Step 1 - Raw data count:", data?.length || 0)
    console.log("Step 1 - Raw data sample:", data?.[0])
    
    // Step 2: Initialize rollup map (exactly like DatabaseService)
    const rollupMap = new Map<string, any>()
    console.log("Step 2 - Rollup map initialized")
    
    // Step 3: Process each item (exactly like DatabaseService)
    console.log("Step 3 - Starting to process", data?.length || 0, "items")
    
    for (const item of data || []) {
      const key = `${item.campaign_id}-${item.content_network_name}`
      console.log("Step 3 - Processing item:", item)
      console.log("Step 3 - Generated key:", key)
      
      if (!rollupMap.has(key)) {
        console.log("Step 3 - Creating new rollup for key:", key)
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
      console.log("Step 3 - Current rollup before update:", { ...rollup })
      
      rollup.impressions += item.impression || 0
      rollup.completes += item.quartile100 || 0
      rollup.content_count += 1
      
      console.log("Step 3 - Updated rollup:", rollup)
    }
    
    // Step 4: Calculate VCR (exactly like DatabaseService)
    console.log("Step 4 - Calculating VCR for", rollupMap.size, "rollups")
    
    for (const rollup of rollupMap.values()) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0
      console.log("Step 4 - VCR calculated for rollup:", rollup)
    }
    
    // Step 5: Convert to array and sort (exactly like DatabaseService)
    const result = Array.from(rollupMap.values()).sort((a, b) => b.impressions - a.impressions)
    console.log("Step 5 - Final result count:", result.length)
    console.log("Step 5 - Final result:", result)
    
    return NextResponse.json({
      success: true,
      campaignId,
      steps: {
        rawDataCount: data?.length || 0,
        rollupMapSize: rollupMap.size,
        finalResultCount: result.length
      },
      result: {
        count: result.length,
        data: result
      }
    })
    
  } catch (error) {
    console.error("Processing debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
