import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    
    console.log("=== STEP BY STEP DEBUG ===")
    console.log("Campaign ID:", campaignId)
    
    // Step 1: Check environment
    console.log("DB_ENGINE:", process.env.DB_ENGINE)
    
    // Step 2: Create Supabase client
    const supabase = createServiceClient()
    console.log("Supabase client created")
    
    // Step 3: Build query (exactly like DatabaseService)
    let query = supabase
      .from("campaign_content_raw")
      .select("*")
    
    if (campaignId) {
      query = query.eq("campaign_id", campaignId)
    }
    
    console.log("Query built with campaignId filter")
    
    // Step 4: Execute query
    const { data, error } = await query
    console.log("Query executed")
    console.log("Error:", error)
    console.log("Data count:", data?.length || 0)
    console.log("Data sample:", data?.[0])
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: `Query failed: ${error.message}`
      })
    }
    
    // Step 5: Initialize rollup map
    const rollupMap = new Map<string, any>()
    console.log("Rollup map initialized")
    
    // Step 6: Process each item
    console.log("Starting to process", data?.length || 0, "items")
    
    for (const item of data || []) {
      const key = `${item.campaign_id}-${item.content_network_name}`
      console.log("Processing item:", item)
      console.log("Generated key:", key)
      
      if (!rollupMap.has(key)) {
        console.log("Creating new rollup for key:", key)
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
      console.log("Current rollup before update:", { ...rollup })
      
      rollup.impressions += item.impression || 0
      rollup.completes += item.quartile100 || 0
      rollup.content_count += 1
      
      console.log("Updated rollup:", rollup)
    }
    
    // Step 7: Calculate VCR
    console.log("Calculating VCR for", rollupMap.size, "rollups")
    
    for (const rollup of rollupMap.values()) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0
      console.log("VCR calculated for rollup:", rollup)
    }
    
    // Step 8: Convert to array and sort
    const result = Array.from(rollupMap.values()).sort((a, b) => b.impressions - a.impressions)
    console.log("Final result count:", result.length)
    console.log("Final result:", result)
    
    return NextResponse.json({
      success: true,
      campaignId,
      steps: {
        dbEngine: process.env.DB_ENGINE,
        queryBuilt: true,
        queryExecuted: true,
        dataCount: data?.length || 0,
        dataSample: data?.[0],
        rollupMapSize: rollupMap.size,
        finalResultCount: result.length
      },
      result: {
        count: result.length,
        data: result
      }
    })
    
  } catch (error) {
    console.error("Step by step debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
