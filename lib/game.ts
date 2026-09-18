export type LetterState = "correct" | "present" | "absent" | "empty"

export const WORD_LENGTH = 5
export const MAX_GUESSES = 6

// Evaluate a guess against the answer, correctly handling duplicate letters.
export function evaluateGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = new Array(WORD_LENGTH).fill("absent")
  const answerChars = answer.split("")
  const used = new Array(WORD_LENGTH).fill(false)

  // First pass: exact matches
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answerChars[i]) {
      result[i] = "correct"
      used[i] = true
    }
  }

  // Second pass: present-but-misplaced
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue
    const idx = answerChars.findIndex((c, j) => !used[j] && c === guess[i])
    if (idx !== -1) {
      result[i] = "present"
      used[idx] = true
    }
  }

  return result
}

// Merge new letter states into the keyboard state, keeping the best known state.
const RANK: Record<LetterState, number> = {
  empty: 0,
  absent: 1,
  present: 2,
  correct: 3,
}

export function mergeKeyStates(
  current: Record<string, LetterState>,
  guess: string,
  states: LetterState[],
): Record<string, LetterState> {
  const next = { ...current }
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i]
    const incoming = states[i]
    if (!next[letter] || RANK[incoming] > RANK[next[letter]]) {
      next[letter] = incoming
    }
  }
  return next
}
