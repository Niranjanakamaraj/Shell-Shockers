'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card/card'
import Button from '@/components/ui/button/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, Download, FileText, Grid3X3 } from 'lucide-react'
import "./page.css";
import VisualizationSelector from '@/components/visualization-selector'
import DataTable from '@/components/data-table'
import { parseCSV } from '@/lib/csv-parser'

export default function InputDataVisualizationPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [data, setData] = useState<any[]>([])
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      try {
        setUploadedFile(file)
        const parsedData = await parseCSV(file)
        setData(parsedData)
        setSelectedVisualization(null)
      } catch (error) {
        console.error('Error parsing file:', error)
        alert('Error parsing file. Please ensure it\'s a valid CSV file.')
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const handleVisualizationToggle = useCallback((vizType: string) => {
    setSelectedVisualization(prev => prev === vizType ? null : vizType)
  }, [])

  const handleExportData = useCallback(() => {
    if (data.length === 0) return

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${uploadedFile?.name || 'data'}_export.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [data, uploadedFile])

  return (
    <div className="visualize-container">
      {/* Header */}
      <div className="visualize-title">Input Data Visualization</div>
      <div className="visualize-subtitle">Interactive exploration of uploaded input files</div>

      {/* File Upload Section */}
      <Card className="visualize-upload-box">
        <CardHeader>
          <CardTitle className="text-center flex flex-col items-center gap-2">
            <Upload className="upload-icon-large" />
            Upload your CSV file to start visualizing
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <label className="fancy-upload-label">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="fancy-upload-input"
              disabled={isLoading}
            />
            <span className="fancy-upload-btn">Choose File</span>
            <div className="visualize-file-info">
            <FileText className="h-3 w-3" />
            {uploadedFile ? uploadedFile.name : "No file chosen"}
          </div>
          </label>
          {isLoading && (
            <div className="visualize-file-info">Processing file...</div>
          )}
          {uploadedFile && data.length > 0 && (
            <div className="visualize-file-info flex flex-col items-center gap-1">
              <span>
                {data.length} rows, {Object.keys(data[0]).length} columns loaded
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visualization Selector */}
      {data.length > 0 && (
        <>
          <Separator />
          <div className="visualize-visualizations">
            <VisualizationSelector
              selectedVisualization={selectedVisualization}
              onVisualizationToggle={handleVisualizationToggle}
              data={data}
              centerButtons={true}
            />
          </div>
        </>
      )}

      {/* Data Table */}
      {data.length > 0 && (
        <>
          <Separator />
          <Card className="visualize-table-section">
            <CardHeader>
              <CardTitle className="visualize-table-title visualize-table-title-center">
                <div className="flex items-center gap-2 visualize-table-title-center">
                  <Grid3X3 className="h-5 w-5" />
                  Complete Data Table
                  <span className="visualize-table-export-center">
                    <button
                      className="visualize-export-btn"
                      onClick={handleExportData}
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </span>
                </div>
              </CardTitle>
              <CardDescription className="visualize-table-desc visualize-table-desc-center">
                Full tabular view of your input data with all {data.length} rows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <DataTable data={data} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
