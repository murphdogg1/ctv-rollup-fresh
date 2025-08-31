import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting campaign ingestion...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const campaignNameOverride = formData.get('campaignName') as string

    console.log('Form data received:', { 
      filename: file?.name, 
      campaignName: campaignNameOverride 
    })

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Only CSV files are allowed' },
        { status: 400 }
      )
    }

    // Generate campaign name
    const filename = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
    const campaignName = campaignNameOverride || filename
    
    console.log('Campaign name generated:', campaignName)

    // Create campaign in database
    console.log('Creating campaign in database...')
    const campaign = await DatabaseService.createCampaign(campaignName)
    console.log('Campaign created successfully:', campaign)

    // In Vercel/serverless environment, we don't save files locally
    // Instead, we process the data directly and store in database
    const storedPath = `virtual://${campaign.campaign_id}/${file.name}`
    console.log('Stored path generated:', storedPath)

    // Record upload in database
    console.log('Creating upload record...')
    const upload = await DatabaseService.createCampaignUpload(
      campaign.campaign_id,
      file.name,
      storedPath
    )
    console.log('Upload record created successfully:', upload)

    // Parse CSV and insert data
    console.log('Parsing CSV file...')
    const csvText = await file.text()
    const { data: csvData, errors } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase()
    })
    
    console.log('CSV parsed:', { 
      rows: csvData.length, 
      errors: errors.length 
    })

    if (errors.length > 0) {
      console.warn('CSV parsing warnings:', errors)
    }

    // Transform CSV data for database
    console.log('Transforming CSV data...')
    const contentData = csvData.map((row: any) => ({
      campaign_id: campaign.campaign_id,
      campaign_name_src: row['campaign name'] || null,
      content_title: row['content title'] || '',
      content_network_name: row['content network name'] || '',
      impression: parseInt(row['impression']) || 0,
      quartile100: parseInt(row['quartile100']) || 0
    }))
    
    console.log('Content data transformed:', contentData.length, 'rows')

    // Insert content data
    console.log('Inserting content data into database...')
    await DatabaseService.insertContentData(contentData)
    console.log('Content data inserted successfully')

    console.log('Campaign ingestion completed successfully')
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.campaign_id,
        name: campaign.campaign_name
      },
      upload: {
        filename: file.name,
        storedPath: storedPath
      },
      content: {
        rowsProcessed: csvData.length,
        rowsInserted: contentData.length,
        errors: errors.length
      }
    })

  } catch (error) {
    console.error('Campaign ingestion failed:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Return more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Detailed error message:', errorMessage)
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Campaign ingestion failed: ${errorMessage}`,
        details: error instanceof Error ? error.stack : 'No stack trace',
        debug: 'Enhanced error handling active'
      },
      { status: 500 }
    )
  }
}
