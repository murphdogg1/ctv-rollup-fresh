import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const campaigns = await DatabaseService.getCampaigns()
    
    return NextResponse.json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns,
      sample: campaigns[0] || null
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
