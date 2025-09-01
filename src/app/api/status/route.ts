import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET() {
  try {
    const rowCounts = await DatabaseService.getRowCounts()
    const engine = process.env.DB_ENGINE === 'local' ? 'local' : 'supabase'
    
    return NextResponse.json({
      connected: true,
      engine,
      rowCounts
    })
  } catch (error) {
    console.error('Status check failed:', error)
    const engine = process.env.DB_ENGINE === 'local' ? 'local' : 'supabase'
    return NextResponse.json(
      { 
        connected: false, 
        engine,
        error: 'Database connection failed' 
      },
      { status: 500 }
    )
  }
}
