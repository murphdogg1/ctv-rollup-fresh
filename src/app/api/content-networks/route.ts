import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    // Get all unique content network names
    const networkNames = await DatabaseService.getContentNetworkNames(campaignId)
    
    // Get existing aliases
    const aliases = await DatabaseService.getContentNetworkAliases()

    return NextResponse.json({
      success: true,
      networkNames,
      aliases
    })
  } catch (error) {
    console.error('Failed to fetch content network names:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content network names' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { alias, networkNames } = body

    if (!alias || !networkNames || !Array.isArray(networkNames)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: alias and networkNames array required' },
        { status: 400 }
      )
    }

    // Create or update content network alias
    await DatabaseService.createContentNetworkAlias(alias, networkNames)

    return NextResponse.json({
      success: true,
      message: `Created alias "${alias}" for ${networkNames.length} network names`
    })
  } catch (error) {
    console.error('Failed to create content network alias:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create content network alias' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alias = searchParams.get('alias')

    if (!alias) {
      return NextResponse.json(
        { success: false, error: 'Alias parameter required' },
        { status: 400 }
      )
    }

    await DatabaseService.deleteContentNetworkAlias(alias)

    return NextResponse.json({
      success: true,
      message: `Deleted alias "${alias}"`
    })
  } catch (error) {
    console.error('Failed to delete content network alias:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete content network alias' },
      { status: 500 }
    )
  }
}
