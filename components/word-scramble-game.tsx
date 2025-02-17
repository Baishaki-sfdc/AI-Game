"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import confetti from "canvas-confetti"
import { generateWordScrambleSet, preloadWordScrambleSets } from "@/app/actions"
import Image from "next/image"

interface WordScrambleGameProps {
  grade: string
  onQuit: () => void
}

interface WordImage {
  word: string
  imageUrl: string | null
}

interface ScrambledWord {
  word: string
  scrambledWord: string
}

export function WordScrambleGame({ grade, onQuit }: WordScrambleGameProps) {
  const [difficulty, setDifficulty] = useState<"easy" | "hard" | null>(null)
  const [setNumber, setSetNumber] = useState<number | null>(null)
  const [category, setCategory] = useState("")
  const [images, setImages] = useState<WordImage[]>([])
  const [scrambledWords, setScrambledWords] = useState<ScrambledWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showResult, setShowResult] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [coins, setCoins] = useState(0)
  const [badges, setBadges] = useState<string[]>([])

  useEffect(() => {
    preloadWordScrambleSets()
  }, [])

  useEffect(() => {
    if (difficulty && setNumber !== null) {
      loadNewSet()
    }
  }, [difficulty, setNumber])

  const loadNewSet = async () => {
    if (!difficulty || setNumber === null) return

    setLoading(true)
    setShowResult(false)
    setError(null)
    setSelectedWord(null)

    try {
      const result = await generateWordScrambleSet(difficulty, setNumber)
      console.log("Received data:", JSON.stringify(result, null, 2))

      if (!result || !result.category || !Array.isArray(result.images) || !Array.isArray(result.scrambledWords)) {
        throw new Error("Invalid data structure received from server")
      }

      if (result.images.length === 0 || result.scrambledWords.length === 0) {
        throw new Error("No words or images received from the server")
      }

      setCategory(result.category)
      setImages(result.images)
      console.log("Images set in state:", images)
      setScrambledWords(result.scrambledWords)
      setCurrentIndex(0)
    } catch (error) {
      console.error("Error loading new set:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleImageClick = (word: string) => {
    const currentWord = scrambledWords[currentIndex]
    if (!currentWord) {
      console.error("Current word is undefined")
      setError("An error occurred. Please try again.")
      return
    }

    setShowResult(true)
    setSelectedWord(word)
    const correct = word === currentWord.word
    setIsCorrect(correct)

    if (correct) {
      setCoins(coins + 10)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      const utterance = new SpeechSynthesisUtterance(`Correct! The word is ${word}`)
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }

    setTimeout(() => {
      if (currentIndex < scrambledWords.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1)
        setShowResult(false)
        setSelectedWord(null)
      } else {
        if (coins >= 50 && !badges.includes("Word Master")) {
          setBadges([...badges, "Word Master"])
        }
      }
    }, 2000)
  }

  const handleImageError = (word: string) => {
    console.error(`Failed to load image for word: ${word}`)
    return "/placeholder.svg"
  }

  if (!difficulty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-3xl font-bubble text-purple-600 mb-8">Choose Difficulty</h2>
        <div className="flex gap-4">
          <Button
            onClick={() => setDifficulty("easy")}
            className="px-8 py-4 text-xl font-bubble bg-green-500 hover:bg-green-600 text-white rounded-full"
          >
            Easy
          </Button>
          <Button
            onClick={() => setDifficulty("hard")}
            className="px-8 py-4 text-xl font-bubble bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            Hard
          </Button>
        </div>
      </div>
    )
  }

  if (setNumber === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-3xl font-bubble text-purple-600 mb-8">Choose a Set</h2>
        <div className="flex gap-4 flex-wrap justify-center">
          {[1, 2, 3, 4, 5].map((num) => (
            <Button
              key={num}
              onClick={() => setSetNumber(num)}
              className="px-8 py-4 text-xl font-bubble bg-blue-500 hover:bg-blue-600 text-white rounded-full"
            >
              Set {num}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bubble text-purple-600 animate-bounce">Loading game...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-2xl font-bubble text-red-600 mb-4">{error}</div>
        <Button onClick={loadNewSet} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
          Try Again
        </Button>
      </div>
    )
  }

  if (!images || images.length === 0 || !scrambledWords || scrambledWords.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bubble text-purple-600">No words available. Please try again.</div>
      </div>
    )
  }

  const currentWord = scrambledWords[currentIndex]

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bubble text-purple-600">An error occurred. Please try again.</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      <Card className="p-6 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bubble text-purple-600 mb-4">
            Category: {category} ({difficulty}) - Set {setNumber}
          </h2>
          <p className="text-xl font-bubble mb-4">
            Word {currentIndex + 1} of {scrambledWords.length}
          </p>
          {scrambledWords && scrambledWords.length > 0 ? (
            <div>
              <h3 className="text-2xl font-bubble text-purple-600 mb-4">Can you unscramble this word?</h3>
              <p className="text-4xl font-bold tracking-wider">{currentWord.scrambledWord}</p>
            </div>
          ) : (
            <div className="text-center text-red-500">No words available</div>
          )}
        </div>

        {images && images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {images.map((img, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-500 transition-colors"
                onClick={() => handleImageClick(img.word)}
                disabled={showResult}
              >
                {img.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={img.imageUrl || "/placeholder.svg"}
                      alt={showResult ? img.word : "Mystery image"}
                      layout="fill"
                      objectFit="cover"
                      priority={index < 2}
                      loading={index < 2 ? "eager" : "lazy"}
                      onError={() => handleImageError(img.word)}
                      className="bg-gray-50"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    {showResult ? img.word : "?"}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center text-red-500">No images available</div>
        )}

        {showResult && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            {isCorrect ? (
              <ThumbsUp className="w-12 h-12 mx-auto text-green-500" />
            ) : (
              <ThumbsDown className="w-12 h-12 mx-auto text-red-500" />
            )}
            <p className="mt-4 text-xl font-bubble">
              {isCorrect
                ? `Correct! The word is "${currentWord.word}"`
                : `Wrong! You selected "${selectedWord}". The correct word is "${currentWord.word}"`}
            </p>
          </motion.div>
        )}

        <div className="flex justify-between mt-8">
          <Button onClick={onQuit} className="bg-red-500 hover:bg-red-600 text-white">
            Quit Game
          </Button>
          {currentIndex === scrambledWords.length - 1 && showResult && (
            <Button onClick={() => setSetNumber(null)} className="bg-green-500 hover:bg-green-600 text-white">
              Choose New Set
            </Button>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xl font-bubble text-purple-600">Coins: {coins}</p>
          {badges.length > 0 && (
            <div className="mt-2">
              <p className="text-lg font-bubble text-purple-600">Badges:</p>
              <div className="flex justify-center gap-2 mt-2">
                {badges.map((badge, index) => (
                  <span key={index} className="px-2 py-1 bg-yellow-400 text-white rounded-full text-sm">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

