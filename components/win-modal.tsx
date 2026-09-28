"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PandaFace } from "@/components/panda-face";

type WinModalProps = {
  open: boolean;
  outcome: "won" | "lost";
  word: string;
  definition: string | null;
  guessCount: number;
  onPlayAgain: () => void;
  onDismiss?: () => void;
};

const PRAISE = [
  "Un-bear-ably good!",
  "Bamboo-tiful!",
  "Paws-itively brilliant!",
  "So panda-tastic!",
];

export function WinModal({
  open,
  outcome,
  word,
  definition,
  guessCount,
  onPlayAgain,
  onDismiss,
}: WinModalProps) {
  const playAgainRef = useRef<HTMLButtonElement>(null);
  const [definitionOpen, setDefinitionOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    playAgainRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const won = outcome === "won";
  const praise =
    PRAISE[Math.min(Math.max(guessCount - 1, 0), PRAISE.length - 1)];
  const title = won ? "You Won!" : "Game Over";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-2xl border-2 bg-card p-8 text-center shadow-2xl ${won ? "border-panda-correct" : "border-panda-absent"}`}
      >
        {/* Falling bamboo leaves */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="bamboo-fall absolute top-0 block h-3 w-1.5 rounded-full bg-panda-correct"
              style={{
                left: `${(i + 0.5) * 10}%`,
                animationDuration: `${2.6 + (i % 4) * 0.6}s`,
                animationDelay: `${(i % 5) * 0.35}s`,
              }}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center gap-4">
          <div className="panda-bounce">
            <PandaFace size={120} waving />
          </div>

          <div className="text-5xl" aria-hidden="true">
            {won ? "🐼🎋" : "🐼💭"}
          </div>

          <h2
            id="result-title"
            className="text-3xl font-extrabold text-balance text-foreground"
          >
            {title}
          </h2>
          <p
            className={`text-lg font-semibold ${won ? "text-accent" : "text-panda-present"}`}
          >
            {won ? praise : "The panda will get them next time!"}
          </p>

          <p className="text-pretty text-muted-foreground">
            The word was{" "}
            <span className="font-bold uppercase tracking-wide text-foreground">
              {word}
            </span>
            {won ? ". You got it in " : "."}
            {won && (
              <span className="font-bold text-foreground">
                {guessCount} {guessCount === 1 ? "guess" : "guesses"}
              </span>
            )}
          </p>

          {definition && (
            <button
              type="button"
              onClick={() => setDefinitionOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-haspopup="dialog"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              See definition
            </button>
          )}

          {won ? (
            <Button
              ref={playAgainRef}
              onClick={onDismiss ?? onPlayAgain}
              size="lg"
              className="mt-2 w-full bg-panda-correct text-panda-correct-foreground hover:brightness-95"
            >
              Okay
            </Button>
          ) : (
            <Button
              ref={playAgainRef}
              onClick={onPlayAgain}
              size="lg"
              className="mt-2 w-full bg-panda-absent text-panda-absent-foreground hover:brightness-95"
            >
              Try again
            </Button>
          )}
        </div>

        {definitionOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/45 p-4"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget)
                setDefinitionOpen(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="definition-title"
              className="relative w-full max-w-xs rounded-2xl border border-border bg-card p-5 text-left text-card-foreground shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setDefinitionOpen(false)}
                aria-label="Close definition"
                className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="pr-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Word definition
              </p>
              <h3
                id="definition-title"
                className="mt-2 text-xl font-bold capitalize text-foreground"
              >
                {word.toLowerCase()}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {definition ??
                  "A definition is not available for this word right now."}
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
