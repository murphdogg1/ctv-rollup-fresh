import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServiceClient()
    
    // Test if we can create views by checking if they exist
    const { data: existingViews, error: viewError } = await supabase
      .from("information_schema.views")
      .select("view_name")
      .eq("table_schema", "public")
      .in("view_name", ["rr_rollup_app", "rr_rollup_genre", "rr_rollup_content"])
    
    if (viewError) {
      return NextResponse.json({
        success: false,
        error: `Cannot check existing views: ${viewError.message}`,
        suggestion: "Views may need to be created manually in Supabase dashboard"
      })
    }
    
    const existingViewNames = existingViews?.map(v => v.view_name) || []
    
    return NextResponse.json({
      success: true,
      message: "View status checked",
      existingViews: existingViewNames,
      missingViews: ["rr_rollup_app", "rr_rollup_genre", "rr_rollup_content"].filter(v => !existingViewNames.includes(v)),
      instructions: "Create missing views manually in Supabase SQL editor using the provided SQL"
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
