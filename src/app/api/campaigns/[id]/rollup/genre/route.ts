import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const rollup = await DatabaseService.getGenreRollup(campaignId)

    return NextResponse.json({
      success: true,
      rollup
    })
  } catch (error) {
    console.error('Failed to fetch genre rollup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch genre rollup' },
      { status: 500 }
    )
  }
}
