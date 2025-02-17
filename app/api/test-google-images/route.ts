import { NextResponse } from "next/server"
import { searchGoogleImages } from "@/utils/googleImages"

export async function GET() {
  try {
    // Log environment variables status (without exposing actual values)
    console.log("Environment Check:")
    console.log("GOOGLE_API_KEY present:", !!process.env.GOOGLE_API_KEY)
    console.log("GOOGLE_SEARCH_ENGINE_ID present:", !!process.env.GOOGLE_SEARCH_ENGINE_ID)
    console.log("USE_GOOGLE_IMAGES value:", process.env.USE_GOOGLE_IMAGES)

    // Test image search
    console.log("Attempting to search for image...")
    const imageUrl = await searchGoogleImages("cartoon apple for children")

    if (imageUrl) {
      console.log("Successfully retrieved image URL:", imageUrl)
      return NextResponse.json({
        success: true,
        imageUrl,
        message: "Image URL successfully retrieved",
      })
    } else {
      console.log("No image URL returned from search")
      return NextResponse.json(
        {
          success: false,
          message: "No image found",
          debug: {
            apiKeyPresent: !!process.env.GOOGLE_API_KEY,
            searchEngineIdPresent: !!process.env.GOOGLE_SEARCH_ENGINE_ID,
            useGoogleImages: process.env.USE_GOOGLE_IMAGES,
          },
        },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error("Detailed error in test-google-images:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching image",
        error: error instanceof Error ? error.message : "Unknown error",
        debug: {
          apiKeyPresent: !!process.env.GOOGLE_API_KEY,
          searchEngineIdPresent: !!process.env.GOOGLE_SEARCH_ENGINE_ID,
          useGoogleImages: process.env.USE_GOOGLE_IMAGES,
        },
      },
      { status: 500 },
    )
  }
}

