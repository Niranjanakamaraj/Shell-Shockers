import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    
    // Forward the request to FastAPI backend
    const response = await fetch(`${FASTAPI_BASE_URL}/predict_from_csv`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let fetch set it automatically for FormData
    })

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text()
      console.error('FastAPI Error:', errorText)
      return NextResponse.json(
        { error: 'Prediction failed', detail: errorText },
        { status: response.status }
      )
    }

    // Parse and return the JSON response
    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    )
  }
}

// Optional: Add health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/health`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Backend unavailable', detail: error.message },
      { status: 503 }
    )
  }
}