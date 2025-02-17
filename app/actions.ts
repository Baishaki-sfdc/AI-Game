"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { wordCategories, updateWordCategoryImage } from "@/utils/wordCategories"
import { cache } from "react"
import { generateImage } from "../utils/flux"
import { searchGoogleImages } from "../utils/googleImages"

interface StoryContent {
  title: string
  story: string
  questions: Array<{
    id: number
    question: string
    answer: number
  }>
  imagePrompt: string
}

interface WordScrambleSet {
  category: string
  images: Array<{ word: string; imageUrl: string | null }>
  scrambledWords: Array<{ word: string; scrambledWord: string }>
}

const storyCache: Record<string, StoryContent> = {}

function getCachedStory(grade: string, subject: string, difficulty: string | null): StoryContent | null {
  const key = `${grade}-${subject}-${difficulty}`
  return storyCache[key] || null
}

function cacheStory(grade: string, subject: string, difficulty: string | null, content: StoryContent): void {
  const key = `${grade}-${subject}-${difficulty}`
  storyCache[key] = content
}

export async function generateStoryContent(
  grade: string,
  subject: string,
  difficulty?: string | null,
): Promise<StoryContent> {
  const cachedStory = getCachedStory(grade, subject, difficulty)
  if (cachedStory) {
    return cachedStory
  }

  try {
    let prompt = `Create an educational story for ${grade} students about ${subject}. 
      Include a title, a short story (2-3 paragraphs), and EXACTLY 4 math word problems with numerical answers.
      Also, provide a brief image prompt that describes a scene from the story.`

    if (subject === "Math") {
      prompt += ` The difficulty level is ${difficulty}.
      For ${difficulty} questions, focus on the following math concepts:
      - Multiplication
      - Time and distance
      - Algebra
      - Fractions
      - Area and perimeter
      - Volume
      
      ${difficulty === "Easy" ? "For easy questions, use simpler numbers and straightforward calculations." : ""}
      ${difficulty === "Hard" ? "For hard questions, include more complex calculations and multi-step problems." : ""}`
    }

    prompt += `
      Format the response as JSON with the following structure:
      {
        "title": "Story Title",
        "story": "Story text...",
        "questions": [
          {"id": 1, "question": "Question text...", "answer": numerical_answer},
          {"id": 2, "question": "Question text...", "answer": numerical_answer},
          {"id": 3, "question": "Question text...", "answer": numerical_answer},
          {"id": 4, "question": "Question text...", "answer": numerical_answer}
        ],
        "imagePrompt": "Brief description of a scene from the story for image generation"
      }
      Ensure that the JSON is properly formatted, all fields are present, and there are EXACTLY 4 questions.`

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt,
    })

    let content: StoryContent
    try {
      content = JSON.parse(text) as StoryContent
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      console.error("Received text:", text)
      throw new Error(`Failed to parse the generated content. Error: ${parseError.message}`)
    }

    // Validate content structure
    if (!content.title || typeof content.title !== "string") {
      throw new Error("Invalid or missing title in the generated content")
    }
    if (!content.story || typeof content.story !== "string") {
      throw new Error("Invalid or missing story in the generated content")
    }
    if (!Array.isArray(content.questions) || content.questions.length !== 4) {
      console.error("Invalid questions structure:", content.questions)
      throw new Error(
        `Invalid or missing questions in the generated content. Expected 4 questions, got ${
          Array.isArray(content.questions) ? content.questions.length : 0
        }`,
      )
    }
    for (let i = 0; i < content.questions.length; i++) {
      const question = content.questions[i]
      if (!question.id || !question.question || typeof question.answer !== "number") {
        console.error(`Invalid question structure for question ${i + 1}:`, question)
        throw new Error(`Invalid question structure for question ${i + 1}`)
      }
    }
    if (!content.imagePrompt || typeof content.imagePrompt !== "string") {
      throw new Error("Invalid or missing image prompt in the generated content")
    }

    cacheStory(grade, subject, difficulty, content)

    return content
  } catch (error) {
    console.error("Error in generateStoryContent:", error)
    if (error instanceof Error) {
      throw new Error(`Error generating content: ${error.message}`)
    } else {
      throw new Error(`Error generating content: ${JSON.stringify(error)}`)
    }
  }
}

export async function generateStoryImage(imagePrompt: string): Promise<string> {
  try {
    const imageUrl = await generateImage(imagePrompt)
    return imageUrl
  } catch (error) {
    console.error("Error generating image:", error)
    throw new Error("Failed to generate image for the story")
  }
}

const wordScrambleCache: Record<string, WordScrambleSet> = {}

export const generateWordScrambleSet = cache(async (difficulty: "easy" | "hard", setNumber: number) => {
  console.log(`Generating word scramble set for difficulty: ${difficulty}, set number: ${setNumber}`)
  const cacheKey = `${difficulty}-${setNumber}`

  if (wordScrambleCache[cacheKey]) {
    console.log("Returning cached result for:", cacheKey)
    return wordScrambleCache[cacheKey]
  }

  try {
    const categories = Object.keys(wordCategories[difficulty])
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)]
    console.log("Selected category:", selectedCategory)
    const words = wordCategories[difficulty][selectedCategory as keyof (typeof wordCategories)[typeof difficulty]]
    console.log("Words before image generation:", words)

    const useGoogleImages = process.env.USE_GOOGLE_IMAGES === "true"

    const imagePromises = words.map(async (word) => {
      if (!word.imageUrl) {
        try {
          console.log(`Generating image for word: ${word.word}`)
          let imageUrl: string | null = null

          if (process.env.USE_GOOGLE_IMAGES === "true") {
            imageUrl = await searchGoogleImages(`cartoon ${word.word} for children`)
            // Add a proxy or CORS-enabled URL if needed
            if (imageUrl) {
              // You might want to proxy the image through your own server
              // or use a CORS-enabled image service
              console.log(`Found Google image for ${word.word}:`, imageUrl)
            }
          }

          if (!imageUrl) {
            const imagePrompt = `A simple, cartoon-style drawing of a ${word.word} on a white background, suitable for children.`
            imageUrl = await generateImage(imagePrompt)
          }

          if (imageUrl) {
            await updateWordCategoryImage(difficulty, selectedCategory, word.word, imageUrl)
          }
          return { word: word.word, imageUrl }
        } catch (error) {
          console.error(`Failed to generate image for word "${word.word}":`, error)
          return { word: word.word, imageUrl: null }
        }
      }
      return { word: word.word, imageUrl: word.imageUrl }
    })

    const updatedWords = await Promise.all(imagePromises)
    console.log("Updated words with images:", updatedWords)

    const result = {
      category: selectedCategory,
      images: updatedWords,
      scrambledWords: updatedWords.map((img) => ({
        word: img.word,
        scrambledWord: img.word
          .split("")
          .sort(() => 0.5 - Math.random())
          .join(""),
      })),
    }

    console.log("Final result structure:", JSON.stringify(result, null, 2))

    if (!result.category || !Array.isArray(result.images) || !Array.isArray(result.scrambledWords)) {
      throw new Error("Invalid result structure")
    }

    wordScrambleCache[cacheKey] = result
    return result
  } catch (error) {
    console.error("Error in generateWordScrambleSet:", error)
    throw error
  }
})

export async function preloadWordScrambleSets() {
  const difficulties: ("easy" | "hard")[] = ["easy", "hard"]
  const setNumbers = [1, 2, 3, 4, 5]

  const preloadPromises = difficulties.flatMap((difficulty) =>
    setNumbers.map((setNumber) => generateWordScrambleSet(difficulty, setNumber)),
  )

  await Promise.all(preloadPromises)
}

export async function generatePerimeterBackground(): Promise<string> {
  try {
    const useGoogleImages = process.env.USE_GOOGLE_IMAGES === "true"
    let imageUrl: string | null = null

    if (useGoogleImages) {
      imageUrl = await searchGoogleImages("cartoon mountain climbing scene for kids math game")
    }

    if (!imageUrl) {
      const imagePrompt =
        "A cartoon-style mountain climbing scene with a ladder going up the mountain, colorful geometric shapes scattered around, perfect for a kids' math game about perimeters. Bright, cheerful colors, safe for children, no people. Simple, clean design with pastel colors."
      imageUrl = await generateImage(imagePrompt)
    }

    if (!imageUrl) {
      throw new Error("Failed to generate or find a suitable background image")
    }

    return imageUrl
  } catch (error) {
    console.error("Error generating perimeter game background:", error)
    throw new Error("Failed to generate background image")
  }
}

