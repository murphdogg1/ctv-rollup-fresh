import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    // Check campaigns table
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("*")
    
    if (campaignsError) {
      return NextResponse.json({
        success: false,
        error: `Campaigns query failed: ${campaignsError.message}`
      })
    }

    // Check campaign_uploads table
    const { data: uploads, error: uploadsError } = await supabase
      .from("campaign_uploads")
      .select("*")
    
    if (uploadsError) {
      return NextResponse.json({
        success: false,
        error: `Uploads query failed: ${uploadsError.message}`
      })
    }

    // Check campaign_content_raw table
    const { data: content, error: contentError } = await supabase
      .from("campaign_content_raw")
      .select("*")
    
    if (contentError) {
      return NextResponse.json({
        success: false,
        error: `Content query failed: ${contentError.message}`
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaigns?.length || 0,
        uploads: uploads?.length || 0,
        content: content?.length || 0,
        sampleCampaign: campaigns?.[0],
        sampleUpload: uploads?.[0],
        sampleContent: content?.[0]
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
    }
}
