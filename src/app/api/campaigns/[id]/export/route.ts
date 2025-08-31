import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'app'

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'app':
        data = await DatabaseService.getAppRollup(campaignId)
        filename = `app-rollup.csv`
        break
      case 'genre':
        data = await DatabaseService.getGenreRollup(campaignId)
        filename = `genre-rollup.csv`
        break
      case 'content':
        data = await DatabaseService.getContentRollup(campaignId)
        filename = `content-rollup.csv`
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid export type' },
          { status: 400 }
        )
    }

    if (data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data to export' },
        { status: 404 }
      )
    }

    // Convert to CSV
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    // Return CSV response
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Export failed:', error)
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 }
    )
  }
}
