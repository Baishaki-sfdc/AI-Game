"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { WordScrambleGame } from "./word-scramble-game"
import { useRouter } from "next/navigation"
import { PerimeterGame } from "./perimeter-game"
import { Card } from "@/components/ui/card"

interface StorySectionProps {
  grade: string
  subject: string
}

export function StorySection({ subject }: StorySectionProps) {
  const router = useRouter()
  const [showWordScramble, setShowWordScramble] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleQuit = () => {
    router.push("/")
  }

  if (subject === "English") {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bubble text-purple-600 mb-4">Word Scramble Game</h2>
        {showWordScramble ? (
          <WordScrambleGame
            grade="All"
            onQuit={() => {
              setShowWordScramble(false)
              router.push("/")
            }}
          />
        ) : (
          <Button
            onClick={() => setShowWordScramble(true)}
            className="px-8 py-6 text-xl font-bubble bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600"
          >
            Start Game
          </Button>
        )}
      </div>
    )
  }

  if (subject === "Math") {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bubble text-purple-600 mb-4">Perimeter Climber</h2>
        <PerimeterGame onQuit={() => router.push("/")} />
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bubble text-center text-purple-600">Subject: {subject}</h1>
          <Button
            onClick={handleQuit}
            className="px-4 py-2 font-bubble bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            Quit
          </Button>
        </div>
        <div className="text-center">
          <p className="text-xl font-comic text-gray-700 mb-8">
            The content for this subject is not available at the moment.
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

