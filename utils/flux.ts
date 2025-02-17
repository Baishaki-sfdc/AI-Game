"use server"

import { fal } from "@fal-ai/client"

if (!process.env.FLUX_API_KEY) {
  console.error("FLUX_API_KEY is not set. Please set this environment variable in your Vercel project settings.")
}

fal.config({
  credentials: process.env.FLUX_API_KEY,
})

const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds

export async function generateImage(prompt: string): Promise<string> {
  console.log("Generating image with Flux API")
  console.log("Prompt:", prompt)
  console.log("FLUX_API_KEY is set:", !!process.env.FLUX_API_KEY)
  console.log("Generating image for prompt:", prompt)
  console.log("FLUX_API_KEY is set:", !!process.env.FLUX_API_KEY)
  console.log("Calling Flux API with prompt:", prompt)

  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Attempt ${retries + 1} to generate image`)
      const result = await fal.run("fal-ai/fast-sdxl", {
        prompt: prompt,
        image_size: "square_hd",
        steps: 50,
        seed: Math.floor(Math.random() * 1000000),
      })

      console.log("Flux API response:", JSON.stringify(result, null, 2))

      if (result && result.images && result.images[0] && result.images[0].url) {
        console.log("Image generated successfully:", result.images[0].url)
        return result.images[0].url
      } else {
        throw new Error("Unexpected response format from Flux API")
      }
    } catch (error) {
      console.error(`Error in generateImage (attempt ${retries + 1}):`, error)
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      } else {
        console.error("Unknown error:", error)
      }
      retries++
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`)
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      } else {
        throw new Error(
          "Failed to generate image after multiple attempts: " +
            (error instanceof Error ? error.message : "Unknown error"),
        )
      }
    }
  }

  throw new Error("Failed to generate image after maximum retries")
}

