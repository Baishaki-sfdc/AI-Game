import { NextResponse } from "next/server"

export async function GET() {
  // Create detailed environment check
  const envCheck = {
    googleApiKey: {
      present: !!process.env.GOOGLE_API_KEY,
      length: process.env.GOOGLE_API_KEY?.length || 0,
    },
    searchEngineId: {
      present: !!process.env.GOOGLE_SEARCH_ENGINE_ID,
      value: process.env.GOOGLE_SEARCH_ENGINE_ID,
      matches: process.env.GOOGLE_SEARCH_ENGINE_ID === "244fcbe7f20a841f8",
    },
    useGoogleImages: {
      present: !!process.env.USE_GOOGLE_IMAGES,
      value: process.env.USE_GOOGLE_IMAGES,
      isTrue: process.env.USE_GOOGLE_IMAGES === "true",
    },
  }

  // Log the check results
  console.log("Detailed Environment Check:", JSON.stringify(envCheck, null, 2))

  return NextResponse.json({
    message: "Environment check complete",
    check: envCheck,
  })
}

