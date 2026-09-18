"use client"

import { Delete } from "lucide-react"
import type { LetterState } from "@/lib/game"
import { cn } from "@/lib/utils"

type KeyboardProps = {
  keyStates: Record<string, LetterState>
  onKey: (key: string) => void
  disabled: boolean
}

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
]

const stateClasses: Record<LetterState, string> = {
  correct: "bg-panda-correct text-panda-correct-foreground",
  present: "bg-panda-present text-panda-present-foreground",
  absent: "bg-panda-absent text-panda-absent-foreground",
  empty: "bg-secondary text-secondary-foreground hover:bg-muted",
}

export function Keyboard({ keyStates, onKey, disabled }: KeyboardProps) {
  return (
    <div className="flex w-full flex-col gap-1.5 sm:gap-2">
      {ROWS.map((row, i) => (
        <div
          key={i}
          className={cn(
            "flex w-full justify-center gap-1 sm:gap-1.5",
            i === 1 && "px-4 sm:px-6",
          )}
        >
          {row.map((key) => {
            const isAction = key === "enter" || key === "backspace"
            const state = keyStates[key] ?? "empty"
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKey(key)}
                aria-label={key}
                className={cn(
                  "relative z-20 flex h-11 min-w-0 touch-manipulation select-none items-center justify-center rounded-md text-xs font-semibold uppercase transition-colors [-webkit-tap-highlight-color:transparent] disabled:opacity-60 sm:h-14 sm:text-sm",
                  isAction ? "flex-[1.5] px-1 text-xs" : "flex-1",
                  isAction ? stateClasses.empty : stateClasses[state],
                )}
              >
                {key === "backspace" ? <Delete className="h-5 w-5" /> : key === "enter" ? "Enter" : key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
