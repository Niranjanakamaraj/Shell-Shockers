// app/api/predict_from_csv/route.ts
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const backendURL = "http://localhost:8000/predict_from_csv"

  try {
    // Forward the request body & headers directly
    const backendRes = await fetch(backendURL, {
      method: "POST",
      headers: {
        // Forward content-type so FastAPI knows it's multipart/form-data
        "content-type": req.headers.get("content-type") || "",
      },
      body: req.body, // raw stream
      duplex: "half" as any, // required in Node fetch for streaming
    })

    console.log(`Backend response status: ${backendRes.status}`)
    console.log(`Backend response headers:`, backendRes.headers)

    // Check if the response is ok
    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error(`Backend error (${backendRes.status}):`, errorText)
      
      return new Response(JSON.stringify({
        error: `Backend error: ${backendRes.status}`,
        details: errorText
      }), {
        status: backendRes.status,
        headers: { "content-type": "application/json" },
      })
    }

    // Always return JSON, even for errors
    const contentType = backendRes.headers.get("content-type") || ""
    
    if (contentType.includes("application/json")) {
      const data = await backendRes.json()
      return new Response(JSON.stringify(data), {
        status: backendRes.status,
        headers: { "content-type": "application/json" },
      })
    } else {
      // Backend returned non-JSON (HTML error page, plain text, etc.)
      const text = await backendRes.text()
      console.log("Non-JSON response from backend:", text)
      
      // Try to extract error details from HTML if it's an error page
      let errorMessage = text
      if (text.includes("<!DOCTYPE")) {
        errorMessage = "Backend returned HTML error page instead of JSON"
      }
      
      return new Response(JSON.stringify({
        error: "Invalid response format from backend",
        details: errorMessage.substring(0, 500) // Limit length
      }), {
        status: backendRes.status,
        headers: { "content-type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Error connecting to backend:", error)
    
    return new Response(JSON.stringify({
      error: "Failed to connect to backend",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
}