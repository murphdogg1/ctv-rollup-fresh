import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET() {
  try {
    // Get rollup across all campaigns
    const rollups = await DatabaseService.getAppRollup()

    // Aggregate by app_name
    const map = new Map<string, { impressions: number; completes: number; content_count: number }>()
    for (const r of rollups) {
      const key = r.app_name || 'Unknown'
      const prev = map.get(key) || { impressions: 0, completes: 0, content_count: 0 }
      prev.impressions += r.impressions || 0
      prev.completes += r.completes || 0
      prev.content_count += r.content_count || 0
      map.set(key, prev)
    }

    const items = Array.from(map.entries()).map(([app_name, v]) => ({
      app_name,
      impressions: v.impressions,
      completes: v.completes,
      content_count: v.content_count
    }))

    const total = items.reduce((s, i) => s + i.impressions, 0)

    return NextResponse.json({ success: true, total, items })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to load inventory' }, { status: 500 })
  }
}
