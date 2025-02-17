interface WordImage {
  word: string
  imageUrl: string | null
}

interface WordCategories {
  easy: Record<string, WordImage[]>
  hard: Record<string, WordImage[]>
}

export let wordCategories: WordCategories = {
  easy: {
    food: [
      { word: "apple", imageUrl: null },
      { word: "banana", imageUrl: null },
      { word: "pizza", imageUrl: null },
      { word: "cookie", imageUrl: null },
    ],
    animals: [
      { word: "cat", imageUrl: null },
      { word: "dog", imageUrl: null },
      { word: "elephant", imageUrl: null },
      { word: "lion", imageUrl: null },
    ],
    birds: [
      { word: "eagle", imageUrl: null },
      { word: "penguin", imageUrl: null },
      { word: "parrot", imageUrl: null },
      { word: "owl", imageUrl: null },
    ],
    vehicles: [
      { word: "car", imageUrl: null },
      { word: "bus", imageUrl: null },
      { word: "bike", imageUrl: null },
      { word: "train", imageUrl: null },
    ],
  },
  hard: {
    astronomy: [
      { word: "nebula", imageUrl: null },
      { word: "quasar", imageUrl: null },
      { word: "galaxy", imageUrl: null },
      { word: "comet", imageUrl: null },
    ],
    chemistry: [
      { word: "molecule", imageUrl: null },
      { word: "isotope", imageUrl: null },
      { word: "catalyst", imageUrl: null },
      { word: "polymer", imageUrl: null },
    ],
    mythology: [
      { word: "phoenix", imageUrl: null },
      { word: "minotaur", imageUrl: null },
      { word: "hydra", imageUrl: null },
      { word: "kraken", imageUrl: null },
    ],
    geography: [
      { word: "fjord", imageUrl: null },
      { word: "plateau", imageUrl: null },
      { word: "archipelago", imageUrl: null },
      { word: "tundra", imageUrl: null },
    ],
  },
}

export async function updateWordCategoryImage(
  difficulty: 'easy' | 'hard',
  category: string,
  word: string,
  imageUrl: string
) {
  const categoryWords = wordCategories[difficulty][category]
  const wordToUpdate = categoryWords.find(w => w.word === word)
  if (wordToUpdate) {
    wordToUpdate.imageUrl = imageUrl
  }
}

