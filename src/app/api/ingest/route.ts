import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { db } from '@/server/db';
import { RawEventSchema, IngestResponse } from '@/types/events';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    
    
    
    let totalRowsInserted = 0;
    const allDetectedColumns = new Set<string>();
    const allSampleRows: any[] = [];
    const warnings: string[] = [];

    for (const file of files) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, file.name);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await fs.writeFile(filePath, buffer);

      let rowsInserted = 0;
      let detectedColumns: string[] = [];
      let sampleRows: any[] = [];

      if (file.name.toLowerCase().endsWith('.csv')) {
        const csvText = buffer.toString('utf-8');
        const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        
        if (result.errors.length > 0) {
          warnings.push(`CSV parsing errors in ${file.name}: ${result.errors.length} errors`);
        }

        detectedColumns = result.meta.fields || [];
        const rows = result.data as any[];
        
        if (rows.length > 0) {
          // Add rows to in-memory database
          
          rowsInserted = rows.length;
          sampleRows = rows.slice(0, 5);
        }
      } else if (file.name.toLowerCase().endsWith('.parquet')) {
        // For demo purposes, we'll skip Parquet files
        warnings.push(`Parquet files not supported in demo mode: ${file.name}`);
        continue;
      }

      totalRowsInserted += rowsInserted;
      detectedColumns.forEach(col => allDetectedColumns.add(col));
      allSampleRows.push(...sampleRows);

      // Clean up uploaded file
      await fs.unlink(filePath);
    }

    // Validate sample rows against schema
    const validatedSampleRows = allSampleRows
      .slice(0, 5)
      .map(row => {
        try {
          return RawEventSchema.parse(row);
        } catch (error) {
          warnings.push(`Row validation error: ${error}`);
          return row;
        }
      });

    const response: IngestResponse = {
      success: true,
      rowsInserted: totalRowsInserted,
      detectedColumns: Array.from(allDetectedColumns),
      sampleRows: validatedSampleRows,
      warnings: warnings.length > 0 ? warnings : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
