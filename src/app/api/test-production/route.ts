import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    console.log("=== TESTING PRODUCTION ENVIRONMENT ===")
    
    // Test environment variables
    const envCheck = {
      dbEngine: process.env.DB_ENGINE,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
    
    console.log("Environment check:", envCheck)
    
    // Test campaign creation
    console.log("Testing campaign creation...")
    const campaign = await DatabaseService.createCampaign("Production Test Campaign")
    console.log("Campaign created:", campaign)
    
    // Test getting campaigns
    console.log("Testing get campaigns...")
    const campaigns = await DatabaseService.getCampaigns()
    console.log("Campaigns retrieved:", campaigns.length)
    
    // Test getting specific campaign
    console.log("Testing get campaign by ID...")
    const retrievedCampaign = await DatabaseService.getCampaignById(campaign.campaign_id)
    console.log("Retrieved campaign:", retrievedCampaign)
    
    return NextResponse.json({
      success: true,
      envCheck,
      campaign,
      campaignsCount: campaigns.length,
      retrievedCampaign: !!retrievedCampaign
    })
    
  } catch (error) {
    console.error("Production test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
