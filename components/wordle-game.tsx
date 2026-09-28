"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { GameBoard } from "@/components/game-board";
import { Keyboard } from "@/components/keyboard";
import { PandaFace } from "@/components/panda-face";
import { WinModal } from "@/components/win-modal";
import {
  evaluateGuess,
  type LetterState,
  MAX_GUESSES,
  mergeKeyStates,
  TILE_FLIP_DURATION_MS,
  TILE_FLIP_STAGGER_MS,
  WORD_LENGTH,
} from "@/lib/game";
import { getDailyAnswer, getRandomAnswer, VALID_GUESSES } from "@/lib/words";

type Status = "playing" | "won" | "lost";

const DAILY_COMPLETE_KEY = "pandle-daily-complete";

function getDailyDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function WordleGame() {
  const [answer, setAnswer] = useState<string>("");
  const [definition, setDefinition] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<LetterState[][]>([]);
  const [current, setCurrent] = useState("");
  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});
  const [status, setStatus] = useState<Status>("playing");
  const [resultOpen, setResultOpen] = useState(false);
  const [dailyComplete, setDailyComplete] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchDefinition(word: string) {
    const normalizedWord = word.trim().toLowerCase();

    if (!normalizedWord) {
      setDefinition(null);
      return;
    }
    try {
      const response = await fetch(
        `/api/dictionary/${encodeURIComponent(normalizedWord)}`,
      );
      if (!response.ok) {
        setDefinition(null);
        return;
      }

      const data = await response.json();
      setDefinition(data.definition ?? null);
    } catch (error) {
      setDefinition(null);
    }
  }

  const loadPuzzle = useCallback(
    (useDailyWord = true, excludeWord?: string) => {
      const nextAnswer = useDailyWord
        ? getDailyAnswer(getDailyDateKey())
        : getRandomAnswer(excludeWord);
      setAnswer(nextAnswer);
      setDefinition(null);
      void fetchDefinition(nextAnswer);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const today = getDailyDateKey();

    try {
      if (window.localStorage.getItem(DAILY_COMPLETE_KEY) === today) {
        setDailyComplete(true);
        setStatus("won");
        return () => {
          cancelled = true;
        };
      }
    } catch {
      // Continue with a fresh puzzle when storage is unavailable.
    }

    setDailyComplete(false);
    loadPuzzle();
    return () => {
      cancelled = true;
    };
  }, [loadPuzzle]);

  const flash = useCallback((text: string) => {
    setMessage(text);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(""), 1600);
  }, []);

  const reset = useCallback(() => {
    if (resultTimer.current) {
      clearTimeout(resultTimer.current);
      resultTimer.current = null;
    }
    // A loss starts a fresh bonus round; avoid repeating the word from the completed round.
    loadPuzzle(false, answer);
    setGuesses([]);
    setEvaluations([]);
    setCurrent("");
    setKeyStates({});
    setStatus("playing");
    setDailyComplete(false);
    setResultOpen(false);
    setMessage("");
    setShakeRow(null);
  }, [loadPuzzle]);

  const submit = useCallback(async () => {
    if (current.length !== WORD_LENGTH) {
      setShakeRow(guesses.length);
      flash("Not enough letters");
      return;
    }
    if (!VALID_GUESSES.has(current)) {
      setShakeRow(guesses.length);
      flash("Not in word list");
      return;
    }

    const evaluation = evaluateGuess(current, answer);
    const rowIndex = guesses.length;

    setGuesses((g) => [...g, current]);
    setEvaluations((e) => [...e, evaluation]);
    setKeyStates((k) => mergeKeyStates(k, current, evaluation));
    setCurrent("");

    const revealMs =
      (WORD_LENGTH - 1) * TILE_FLIP_STAGGER_MS + TILE_FLIP_DURATION_MS + 80;

    if (current === answer) {
      // Wait for the tile flip animation before showing the modal.
      if (resultTimer.current) clearTimeout(resultTimer.current);
      resultTimer.current = setTimeout(() => {
        resultTimer.current = null;
        setStatus("won");
        setResultOpen(true);
      }, revealMs);
    } else if (rowIndex + 1 >= MAX_GUESSES) {
      if (resultTimer.current) clearTimeout(resultTimer.current);
      resultTimer.current = setTimeout(() => {
        resultTimer.current = null;
        setStatus("lost");
        setResultOpen(true);
      }, revealMs);
      flash(`The word was ${answer.toUpperCase()}`);
    }
  }, [current, answer, guesses.length, flash]);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing" || !answer) return;
      const k = key.toLowerCase();
      if (k === "enter") {
        submit();
      } else if (k === "backspace") {
        setCurrent((c) => c.slice(0, -1));
      } else if (/^[a-z]$/.test(k) && current.length < WORD_LENGTH) {
        setCurrent((c) => c + k);
      }
    },
    [status, answer, current.length, submit],
  );

  useEffect(() => {
    return () => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
      if (resultTimer.current) clearTimeout(resultTimer.current);
    };
  }, []);

  // Clear the shake flag after the animation runs.
  useEffect(() => {
    if (shakeRow === null) return;
    const t = setTimeout(() => setShakeRow(null), 450);
    return () => clearTimeout(t);
  }, [shakeRow]);

  useEffect(() => {
    if (!helpOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [helpOpen]);

  // Physical keyboard support.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (
        e.key === "Enter" ||
        e.key === "Backspace" ||
        /^[a-zA-Z]$/.test(e.key)
      ) {
        handleKey(e.key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  return (
    <div className="flex min-h-svh flex-col items-center px-4 pb-2 pt-6">
      <header className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <PandaFace size={44} />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Pandle
          </h1>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="How to play"
            aria-haspopup="dialog"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Guess the 5-letter word in 6 tries
        </p>
      </header>

      {dailyComplete === null ? null : dailyComplete ? (
        <main className="mt-12 flex w-full max-w-md flex-col items-center rounded-3xl border border-border bg-card/80 px-6 py-10 text-center shadow-lg">
          <div className="panda-bounce text-7xl" aria-hidden="true">
            🐼
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-foreground">
            You did it!
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Your word is solved for today. Come back tomorrow for another cozy
            challenge with Panda.
          </p>
        </main>
      ) : (
        <div className="relative mt-5 flex w-full max-w-md flex-col items-center gap-5 sm:mt-6 sm:gap-6">
          {/* Toast message */}
          <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2">
            {message && (
              <div className="rounded-md bg-panda-absent px-3 py-1.5 text-sm font-medium text-panda-absent-foreground shadow-md">
                {message}
              </div>
            )}
          </div>

          <div className="w-full max-w-[20rem]">
            <GameBoard
              guesses={guesses}
              evaluations={evaluations}
              current={current}
              shakeRow={shakeRow}
            />
          </div>

          <div className="w-full max-w-md px-0.5 sm:px-0">
            <Keyboard
              keyStates={keyStates}
              onKey={handleKey}
              disabled={status !== "playing"}
            />
          </div>
        </div>
      )}

      <WinModal
        open={resultOpen}
        outcome={status === "won" ? "won" : "lost"}
        word={answer}
        definition={definition}
        guessCount={guesses.length}
        onPlayAgain={reset}
        onDismiss={() => {
          try {
            window.localStorage.setItem(DAILY_COMPLETE_KEY, getDailyDateKey());
          } catch {
            // The completed state still lasts for this session when storage is unavailable.
          }
          setResultOpen(false);
          setDailyComplete(true);
        }}
      />

      {helpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setHelpOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-to-play-title"
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              aria-label="Close instructions"
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="how-to-play-title" className="pr-8 text-xl font-bold">
              How to play
            </h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>Guess the hidden 5-letter word in six tries.</p>
              <p>
                Type a word and press Enter. Use Backspace to remove a letter.
              </p>
              <div className="space-y-2" aria-label="Tile color meanings">
                <p>
                  <span className="font-semibold text-panda-correct">
                    Green
                  </span>{" "}
                  means the letter is correct and in the right spot.
                </p>
                <p>
                  <span className="font-semibold text-panda-present">
                    Yellow
                  </span>{" "}
                  means the letter is in the word but in another spot.
                </p>
                <p>
                  <span className="font-semibold text-panda-absent">Gray</span>{" "}
                  means the letter is not in the word.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
