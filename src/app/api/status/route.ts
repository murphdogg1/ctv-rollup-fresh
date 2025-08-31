import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET() {
  try {
    const rowCounts = await DatabaseService.getRowCounts()
    
    return NextResponse.json({
      connected: true,
      engine: 'supabase',
      rowCounts
    })
  } catch (error) {
    console.error('Status check failed:', error)
    return NextResponse.json(
      { 
        connected: false, 
        engine: 'supabase',
        error: 'Database connection failed' 
      },
      { status: 500 }
    )
  }
}
