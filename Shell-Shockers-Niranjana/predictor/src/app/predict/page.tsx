'use client'

import { useState, useEffect } from "react"
import { toast } from "sonner"
import Button from "@/components/ui/button/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Input } from "@/components/ui/input/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab/tab"
import { Upload, Download, Loader2 } from "lucide-react"

export default function InputPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [predictedFileUrl, setPredictedFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)

  const checkBackendHealth = async () => {
    try {
      const response = await fetch("/api/predict_from_csv", { method: "GET" })
      setIsHealthy(response.ok)
    } catch {
      setIsHealthy(false)
    }
  }

  // Check backend health on component mount
  useEffect(() => {
    checkBackendHealth()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
      // Reset previous prediction
      setPredictedFileUrl(null)
    } else {
      toast.error("Invalid File", {
        description: "Please upload a valid CSV file.",
      })
    }
  }

  const handlePrediction = async () => {
    if (!csvFile) {
      toast.error("No File Selected", {
        description: "Please upload a CSV file first.",
      })
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", csvFile)

    try {
      const response = await fetch("/api/predict_from_csv", { 
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Prediction failed: ${errorData.detail || errorData.error || response.statusText}`)
      }

      const result = await response.json()
      
      if (result.predictions && result.predictions.length > 0) {
        // Create CSV content
        const headers = ['id', 'predicted_properties']
        const csvRows = result.predictions.map(pred => {
          const properties = Array.isArray(pred.predicted_properties) 
            ? `"${pred.predicted_properties.join(',')}"` 
            : pred.predicted_properties
          return `${pred.id},${properties}`
        })
        
        const csvData = [headers.join(','), ...csvRows].join('\n')

        const blob = new Blob([csvData], { type: "text/csv" })
        const downloadUrl = URL.createObjectURL(blob)
        setPredictedFileUrl(downloadUrl)
        
        toast.success("Prediction Successful", {
          description: `Processed ${result.predictions.length} rows. Download the results using the button below.`,
        })
      } else {
        throw new Error("Invalid response format or no predictions returned from server.")
      }
    } catch (error) {
      console.error("Prediction error:", error)
      toast.error("Prediction Failed", {
        description: `Failed to get prediction from the server. Details: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = () => {
    // Create a proper template CSV with the required 55 features + id column
    const headers = [
      'id',
      'Component1_fraction', 'Component2_fraction', 'Component3_fraction', 'Component4_fraction', 'Component5_fraction',
      // Component 1 properties
      'Component1_Property1', 'Component1_Property2', 'Component1_Property3', 'Component1_Property4', 'Component1_Property5',
      'Component1_Property6', 'Component1_Property7', 'Component1_Property8', 'Component1_Property9', 'Component1_Property10',
      // Component 2 properties
      'Component2_Property1', 'Component2_Property2', 'Component2_Property3', 'Component2_Property4', 'Component2_Property5',
      'Component2_Property6', 'Component2_Property7', 'Component2_Property8', 'Component2_Property9', 'Component2_Property10',
      // Component 3 properties
      'Component3_Property1', 'Component3_Property2', 'Component3_Property3', 'Component3_Property4', 'Component3_Property5',
      'Component3_Property6', 'Component3_Property7', 'Component3_Property8', 'Component3_Property9', 'Component3_Property10',
      // Component 4 properties
      'Component4_Property1', 'Component4_Property2', 'Component4_Property3', 'Component4_Property4', 'Component4_Property5',
      'Component4_Property6', 'Component4_Property7', 'Component4_Property8', 'Component4_Property9', 'Component4_Property10',
      // Component 5 properties
      'Component5_Property1', 'Component5_Property2', 'Component5_Property3', 'Component5_Property4', 'Component5_Property5',
      'Component5_Property6', 'Component5_Property7', 'Component5_Property8', 'Component5_Property9', 'Component5_Property10'
    ]
    
    // Sample data row
    const sampleRow = [
      'sample_1',
      '0.2', '0.2', '0.2', '0.2', '0.2', // fractions sum to 1.0
      // Sample values for all 50 properties (10 properties × 5 components)
      ...Array(50).fill(0).map((_, i) => (1.0 + Math.random()).toFixed(2))
    ]
    
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n')
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "blend_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Upload Blend Data</h1>
        <p className="text-muted-foreground">Upload your fuel blend composition in CSV format</p>
        
        {/* Backend status indicator */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            isHealthy === null ? 'bg-gray-400' : 
            isHealthy ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-muted-foreground">
            Backend: {isHealthy === null ? 'Checking...' : isHealthy ? 'Online' : 'Offline'}
          </span>
          {isHealthy === false && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={checkBackendHealth}
              className="h-6 px-2 text-xs"
            >
              Retry
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="upload" className="w-full">CSV Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV File Upload</CardTitle>
              <CardDescription>
                Upload a CSV file with your blend data. Download the template to see the required format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <Input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {csvFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <Button variant="secondary" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>

                <Button
                  onClick={handlePrediction}
                  disabled={!csvFile || isLoading || isHealthy === false}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Predict from CSV'
                  )}
                </Button>

                {predictedFileUrl && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const a = document.createElement("a")
                      a.href = predictedFileUrl
                      a.download = "predicted_results.csv"
                      a.click()
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Results
                  </Button>
                )}
              </div>

              <div className="bg-secondary/10 p-4 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Must include 'id' column as first column</li>
                  <li>• Requires exactly 55 feature columns (5 fractions + 50 properties)</li>
                  <li>• Component fractions should sum to 1.0</li>
                  <li>• All numeric values must be positive</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}