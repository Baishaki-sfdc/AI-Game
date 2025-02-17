import { google } from "googleapis"

const customSearch = google.customsearch("v1")

export async function searchGoogleImages(query: string): Promise<string | null> {
  const API_KEY = process.env.GOOGLE_API_KEY
  const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID

  if (!API_KEY || !SEARCH_ENGINE_ID) {
    console.error("Google API key or Search Engine ID is missing")
    console.log("API Key present:", !!API_KEY)
    console.log("Search Engine ID present:", !!SEARCH_ENGINE_ID)
    return null
  }

  try {
    console.log("Initiating Google Custom Search with query:", query)
    const res = await customSearch.cse.list({
      auth: API_KEY,
      cx: SEARCH_ENGINE_ID,
      q: query,
      searchType: "image",
      num: 1,
      imgSize: "medium",
      safe: "high",
    })

    console.log("Search response received:", !!res.data)
    const items = res.data.items
    if (items && items.length > 0 && items[0].link) {
      console.log("Image found:", items[0].link)
      return items[0].link
    } else {
      console.log("No images found in search results")
      return null
    }
  } catch (error) {
    console.error("Error searching Google Images:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return null
  }
}

