"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface GradeSelectorProps {
  onSelectGrade: (grade: string) => void
  onSelectSubject: (subject: string) => void
}

export function GradeSelector({ onSelectGrade, onSelectSubject }: GradeSelectorProps) {
  const grades = ["Grade 1", "Grade 2", "Grade 3"]
  const subjects = ["Math", "English"]

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h2 className="text-4xl font-bubble text-purple-600 mb-4">Pick Your Grade!</h2>
      <div className="flex gap-4">
        {grades.map((grade) => (
          <motion.div key={grade} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              onClick={() => onSelectGrade(grade)}
              className="h-16 px-8 text-xl font-bubble bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600"
            >
              {grade}
            </Button>
          </motion.div>
        ))}
      </div>

      <h2 className="text-4xl font-bubble text-purple-600 mt-8 mb-4">Choose Your Subject!</h2>
      <div className="flex gap-4">
        {subjects.map((subject) => (
          <motion.div key={subject} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              onClick={() => onSelectSubject(subject)}
              className="h-16 px-8 text-xl font-bubble bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full hover:from-blue-600 hover:to-teal-600"
            >
              {subject}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

