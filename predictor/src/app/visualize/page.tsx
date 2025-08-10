'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card/card'
import Button from '@/components/ui/button/button'
import { Input }  from '@/components/ui/input/input'
import { Badge}  from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, Download, FileText, Grid3X3 } from 'lucide-react'
<<<<<<< HEAD
=======
import "./page.css";
>>>>>>> stephanus
import VisualizationSelector from '@/components/visualization-selector'
import DataTable from '@/components/data-table'
import {parseCSV }  from '@/lib/csv-parser'

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
        setSelectedVisualization(null) // Reset visualization selection
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
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Input Data Visualization</h1>
          <p className="text-lg text-slate-600">
            Interactive exploration of uploaded input files
          </p>
        </div>

        {/* File Upload Section */}
        <Card className="border-2 border-dashed border-slate-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Data File
            </CardTitle>
            <CardDescription>
              Upload your CSV file to start visualizing your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="cursor-pointer"
                disabled={isLoading}
              />
              
              {isLoading && (
                <div className="text-center text-slate-600">
                  Processing file...
                </div>
              )}

              {uploadedFile && data.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {uploadedFile.name}
                  </Badge>
                  <span className="text-sm text-slate-600">
                    {data.length} rows, {Object.keys(data[0]).length} columns loaded
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Visualization Selector */}
        {data.length > 0 && (
          <>
            <Separator />
=======
    <div className="visualize-container">
      {/* Header */}
      <div className="visualize-title">Input Data Visualization</div>
      <div className="visualize-subtitle">Interactive exploration of uploaded input files</div>

      {/* File Upload Section */}
      <Card className="visualize-upload-box">
        <CardHeader>
          <CardTitle className="visualize-card-title visualize-card-title-center">
            <Upload className="h-5 w-5" />
            Upload Data File
          </CardTitle>
          <CardDescription className="visualize-card-desc visualize-card-desc-center">
            Upload your CSV file to start visualizing your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="cursor-pointer"
              style={{ margin: '0 auto', display: 'block' }}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="visualize-file-info">Processing file...</div>
            )}
            {uploadedFile && data.length > 0 && (
              <div className="visualize-file-info">
                <Badge className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {uploadedFile.name}
                </Badge>
                <span>
                  {data.length} rows, {Object.keys(data[0]).length} columns loaded
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visualization Selector */}
      {data.length > 0 && (
        <>
          <Separator />
          <div className="visualize-visualizations">
>>>>>>> stephanus
            <VisualizationSelector
              selectedVisualization={selectedVisualization}
              onVisualizationToggle={handleVisualizationToggle}
              data={data}
<<<<<<< HEAD
            />
          </>
        )}

        {/* Data Table */}
        {data.length > 0 && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-5 w-5" />
                    Complete Data Table
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={handleExportData}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </CardTitle>
                <CardDescription>
                  Full tabular view of your input data with all {data.length} rows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={data} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
=======
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
>>>>>>> stephanus
    </div>
  )
}