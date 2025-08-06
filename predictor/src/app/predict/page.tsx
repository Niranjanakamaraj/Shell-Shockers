'use client'

import { useState } from "react"
import { toast } from "sonner"
import Button from "@/components/ui/button/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Input } from "@/components/ui/input/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab/tab"
import { Upload, Download } from "lucide-react"

export default function InputPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [predictedFileUrl, setPredictedFileUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
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

    const formData = new FormData()
    formData.append("file", csvFile)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Prediction failed")

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      setPredictedFileUrl(downloadUrl)

      toast.success("Prediction Successful", {
        description: "Download the result using the button below.",
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to get prediction from the server.",
      })
    }
  }

  const downloadTemplate = () => {
    const csvContent =
      "Component Name,Fraction (%),Density (kg/m³),Viscosity (cSt),Sulfur (ppm)\nComponent 1,50,850,2.5,10\nComponent 2,30,820,1.8,15\nComponent 3,20,880,3.2,5"
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
                <Input type="file" accept=".csv" onChange={handleFileChange} />
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <Button variant="secondary" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>

                <Button
                  onClick={handlePrediction}
                  disabled={!csvFile}
                  className="bg-primary hover:bg-primary/90"
                >
                  Predict from CSV
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
                    Download Prediction
                  </Button>
                )}
              </div>

              <div className="bg-secondary/10 p-4 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• First row must contain headers</li>
                  <li>• Component fractions must sum to 100%</li>
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