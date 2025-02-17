"use client"

import { useState, useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { StorySection } from "@/components/story-section"
import { RocketScene } from "@/components/rocket-scene"
import { preloadWordScrambleSets } from "./actions"

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState<string>("")

  const subjects = ["Math", "English"]

  useEffect(() => {
    preloadWordScrambleSets()
  }, [])

  if (selectedSubject) {
    return <StorySection grade="All" subject={selectedSubject} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md h-64 mb-8">
        <Suspense fallback={<div className="text-center">Loading 3D model...</div>}>
          <Canvas>
            <RocketScene />
          </Canvas>
        </Suspense>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bubble text-purple-600 mb-6">Choose Your Adventure!</h2>
        <div className="flex gap-4 justify-center">
          {subjects.map((subject) => (
            <motion.div key={subject} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => setSelectedSubject(subject)}
                className="h-16 px-8 text-xl font-bubble bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600"
              >
                {subject}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  )
}

