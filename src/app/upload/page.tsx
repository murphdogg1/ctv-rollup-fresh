'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { IngestResponse } from '@/types/events'

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<IngestResponse | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleUpload(files)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleUpload(files)
    }
  }

  const handleUpload = async (files: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      const formData = new FormData()
      // For campaigns ingest, we need file and campaignName
      files.forEach(file => {
        formData.append('file', file)
        // Generate campaign name from filename
        const campaignName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
        formData.append('campaignName', campaignName)
      })

      const response = await fetch('/api/campaigns/ingest', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      setUploadResult(result)
      
      if (result.success) {
        toast.success(`Successfully created campaign: ${result.campaign.name}`)
        if (result.content) {
          toast.success(`Processed ${result.content.rowsProcessed} rows`)
        }
      } else {
        toast.error(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(100)
    }
  }

  const handleRebuild = async () => {
    try {
      const response = await fetch('/api/rebuild', { method: 'POST' })
      if (response.ok) {
        toast.success('Views rebuilt successfully')
      } else {
        toast.error('Failed to rebuild views')
      }
    } catch (error) {
      console.error('Rebuild error:', error)
      toast.error('Failed to rebuild views')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-muted-foreground">
          Upload CSV or Parquet files containing CTV delivery logs for ingestion and analysis.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Drag and drop files or click to select. Supports CSV and Parquet formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
          >
            <div className="space-y-4">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop files here or click to select
                </p>
                <p className="text-sm text-gray-500">
                  CSV and Parquet files supported
                </p>
              </div>
              <input
                type="file"
                multiple
                accept=".csv,.parquet"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>Select Files</span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {isUploading && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">Processing files...</p>
          </CardContent>
        </Card>
      )}

      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Rows Inserted</p>
                <p className="text-2xl font-bold">{uploadResult.rowsInserted}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Detected Columns</p>
                <p className="text-2xl font-bold">{uploadResult.detectedColumns.length}</p>
              </div>
            </div>

            {uploadResult.detectedColumns.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Detected Columns</p>
                <div className="flex flex-wrap gap-2">
                  {uploadResult.detectedColumns.map((column, index) => (
                    <Badge key={index} variant="outline">{column}</Badge>
                  ))}
                </div>
              </div>
            )}

            {uploadResult.sampleRows.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Sample Data</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(uploadResult.sampleRows, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={handleRebuild} variant="outline">
                Rebuild Views
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
