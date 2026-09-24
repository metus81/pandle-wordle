"use client"

import { type LetterState, MAX_GUESSES, TILE_FLIP_STAGGER_MS, WORD_LENGTH } from "@/lib/game"
import { cn } from "@/lib/utils"

type BoardProps = {
  guesses: string[]
  evaluations: LetterState[][]
  current: string
  shakeRow: number | null
}

const stateClasses: Record<LetterState, string> = {
  correct: "bg-panda-correct text-panda-correct-foreground border-panda-correct",
  present: "bg-panda-present text-panda-present-foreground border-panda-present",
  absent: "bg-panda-absent text-panda-absent-foreground border-panda-absent",
  empty: "bg-card text-foreground border-border",
}

export function GameBoard({ guesses, evaluations, current, shakeRow }: BoardProps) {
  const rows = Array.from({ length: MAX_GUESSES })

  return (
    <div className="grid grid-rows-6 gap-1.5" role="grid" aria-label="Guess grid">
      {rows.map((_, rowIndex) => {
        const submitted = evaluations[rowIndex]
        const isCurrentRow = rowIndex === guesses.length
        const letters = submitted ? guesses[rowIndex] : isCurrentRow ? current : ""

        return (
          <div
            key={rowIndex}
            className={cn("grid grid-cols-5 gap-1.5", shakeRow === rowIndex && "panda-shake")}
            role="row"
          >
            {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
              const letter = letters[colIndex] ?? ""
              const state: LetterState = submitted ? submitted[colIndex] : "empty"
              const filled = letter !== "" && !submitted

              return (
                <div
                  key={colIndex}
                  role="gridcell"
                  aria-label={letter ? letter : "empty"}
                  className={cn(
                    "flex aspect-square w-full items-center justify-center rounded-md border-2 text-2xl font-bold uppercase sm:text-3xl",
                    stateClasses[state],
                    submitted && "panda-flip",
                    filled && "panda-pop border-foreground/50",
                  )}
                  style={submitted ? { animationDelay: `${colIndex * TILE_FLIP_STAGGER_MS}ms` } : undefined}
                >
                  {letter}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
