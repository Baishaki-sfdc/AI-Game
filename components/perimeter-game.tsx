"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Coins } from "lucide-react"
import confetti from "canvas-confetti"
import { generatePerimeterBackground } from "@/app/actions"
import Image from "next/image"

interface Shape {
  id: number
  type: string
  sides: number[]
  perimeter: number
}

interface PerimeterGameProps {
  onQuit: () => void
}

export function PerimeterGame({ onQuit }: PerimeterGameProps) {
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [position, setPosition] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<Shape[]>([])
  const [correctAnswer, setCorrectAnswer] = useState<number>(0)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState("")
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)

  // Add background image loading
  useEffect(() => {
    const loadBackground = async () => {
      try {
        const imageUrl = await generatePerimeterBackground()
        setBackgroundImage(imageUrl)
      } catch (error) {
        console.error("Failed to load background:", error)
      }
    }
    loadBackground()
  }, [])

  const generateShapes = (): Shape[] => {
    const shapes: Shape[] = []
    // Generate 3 random shapes
    for (let i = 0; i < 3; i++) {
      const type = Math.random() > 0.5 ? "rectangle" : "square"
      let sides: number[]

      if (type === "square") {
        const side = Math.floor(Math.random() * 8) + 2
        sides = [side, side, side, side]
      } else {
        const length = Math.floor(Math.random() * 8) + 2
        const width = Math.floor(Math.random() * 8) + 2
        sides = [length, width, length, width]
      }

      shapes.push({
        id: i,
        type,
        sides,
        perimeter: sides.reduce((a, b) => a + b, 0),
      })
    }

    // Ensure at least one shape has the target perimeter
    const targetPerimeter = Math.floor(Math.random() * 20) + 10
    shapes[0].sides = [targetPerimeter / 4, targetPerimeter / 4, targetPerimeter / 4, targetPerimeter / 4]
    shapes[0].perimeter = targetPerimeter

    return shapes.sort(() => Math.random() - 0.5)
  }

  const startNewQuestion = () => {
    const shapes = generateShapes()
    setCurrentQuestion(shapes)
    setCorrectAnswer(shapes[0].perimeter)
  }

  useEffect(() => {
    startNewQuestion()
  }, [score, currentQuestion]) // Added currentQuestion to dependencies

  const handleAnswer = (shape: Shape) => {
    if (shape.perimeter === correctAnswer) {
      setMessage("Correct! Moving up!")
      setPosition((prev) => Math.min(prev + 2, 10))
      if (position >= 8) {
        // Victory condition
        setScore((prev) => prev + 1)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
        setTimeout(() => {
          setPosition(0)
          startNewQuestion()
          setMessage("")
        }, 2000)
      } else {
        setTimeout(() => {
          startNewQuestion()
          setMessage("")
        }, 1500)
      }
    } else {
      setMessage("Incorrect! Lost a life!")
      setLives((prev) => prev - 1)
      setPosition((prev) => Math.max(prev - 1, 0))
      if (lives <= 1) {
        setGameOver(true)
      }
      setTimeout(() => {
        startNewQuestion()
        setMessage("")
      }, 1500)
    }
  }

  if (gameOver) {
    return (
      <Card className="p-6 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bubble text-red-600 mb-4">Game Over!</h2>
          <p className="text-xl mb-4">You collected {score} coins!</p>
          <Button onClick={onQuit} className="bg-blue-500 hover:bg-blue-600 text-white">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {[...Array(lives)].map((_, i) => (
            <Heart key={i} className="w-6 h-6 text-red-500 fill-red-500" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-6 h-6 text-yellow-500" />
          <span className="text-xl">{score}</span>
        </div>
      </div>

      <div className="relative h-80 mb-4 border-2 border-gray-200 rounded-lg overflow-hidden">
        {/* Background Image */}
        {backgroundImage ? (
          <Image
            src={backgroundImage || "/placeholder.svg"}
            alt="Mountain climbing scene"
            layout="fill"
            objectFit="cover"
            className="opacity-50"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-purple-100" />
        )}

        {/* Ladder and climber visualization */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Ladder rungs */}
          <div className="absolute inset-0 flex flex-col justify-between py-8">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-1 bg-brown-400 mx-auto"
                style={{
                  backgroundColor: "#8B4513",
                  opacity: 0.7,
                }}
              />
            ))}
          </div>

          {/* Coin at top */}
          <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto shadow-lg animate-bounce-slow flex items-center justify-center">
            <Coins className="w-8 h-8 text-yellow-100" />
          </div>

          {/* Climber */}
          <motion.div
            className="relative w-12 h-12 mx-auto"
            animate={{ y: `${-position * 10}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="w-full h-full bg-blue-500 rounded-full shadow-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-400 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bubble text-purple-600 mb-4">Find the shape with perimeter {correctAnswer}!</h2>
        {message && (
          <p className={`text-lg ${message.includes("Correct") ? "text-green-600" : "text-red-600"}`}>{message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {currentQuestion.map((shape) => (
          <Button
            key={shape.id}
            onClick={() => handleAnswer(shape)}
            className="p-4 h-auto aspect-square flex flex-col items-center justify-center bg-white border-2 border-gray-200 hover:border-purple-500"
          >
            <div className="text-sm mb-2">{shape.type}</div>
            <div className="text-xs">Sides: {shape.sides.join(", ")}</div>
          </Button>
        ))}
      </div>

      <Button onClick={onQuit} className="mt-6 bg-red-500 hover:bg-red-600 text-white">
        Quit Game
      </Button>
    </Card>
  )
}

