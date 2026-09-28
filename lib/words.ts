import english10 from "wordlist-english/english-words-10.json";
import english20 from "wordlist-english/english-words-20.json";
import english35 from "wordlist-english/english-words-35.json";
import english40 from "wordlist-english/english-words-40.json";
import english50 from "wordlist-english/english-words-50.json";
import english55 from "wordlist-english/english-words-55.json";
import english60 from "wordlist-english/english-words-60.json";
import english70 from "wordlist-english/english-words-70.json";
import american10 from "wordlist-english/american-words-10.json";
import american20 from "wordlist-english/american-words-20.json";
import american35 from "wordlist-english/american-words-35.json";
import american40 from "wordlist-english/american-words-40.json";
import american50 from "wordlist-english/american-words-50.json";
import american55 from "wordlist-english/american-words-55.json";
import american60 from "wordlist-english/american-words-60.json";
import american70 from "wordlist-english/american-words-70.json";
import australian10 from "wordlist-english/australian-words-10.json";
import australian20 from "wordlist-english/australian-words-20.json";
import australian35 from "wordlist-english/australian-words-35.json";
import australian40 from "wordlist-english/australian-words-40.json";
import australian50 from "wordlist-english/australian-words-50.json";
import australian55 from "wordlist-english/australian-words-55.json";
import australian60 from "wordlist-english/australian-words-60.json";
import australian70 from "wordlist-english/australian-words-70.json";
import british10 from "wordlist-english/british-words-10.json";
import british20 from "wordlist-english/british-words-20.json";
import british35 from "wordlist-english/british-words-35.json";
import british40 from "wordlist-english/british-words-40.json";
import british50 from "wordlist-english/british-words-50.json";
import british55 from "wordlist-english/british-words-55.json";
import british60 from "wordlist-english/british-words-60.json";
import british70 from "wordlist-english/british-words-70.json";
import canadian10 from "wordlist-english/canadian-words-10.json";
import canadian20 from "wordlist-english/canadian-words-20.json";
import canadian35 from "wordlist-english/canadian-words-35.json";
import canadian40 from "wordlist-english/canadian-words-40.json";
import canadian50 from "wordlist-english/canadian-words-50.json";
import canadian55 from "wordlist-english/canadian-words-55.json";
import canadian60 from "wordlist-english/canadian-words-60.json";
import canadian70 from "wordlist-english/canadian-words-70.json";

const normalize = (word: string) => word.trim().toLowerCase();
const lists = [
  english10,
  english20,
  english35,
  english40,
  english50,
  english55,
  english60,
  english70,
  american10,
  american20,
  american35,
  american40,
  american50,
  american55,
  american60,
  american70,
  australian10,
  australian20,
  australian35,
  australian40,
  australian50,
  australian55,
  australian60,
  australian70,
  british10,
  british20,
  british35,
  british40,
  british50,
  british55,
  british60,
  british70,
  canadian10,
  canadian20,
  canadian35,
  canadian40,
  canadian50,
  canadian55,
  canadian60,
  canadian70,
] as string[][];

const fiveLetterWords = (words: string[]) =>
  words.map(normalize).filter((word) => word.length === 5);

// Common English words are used as the answer pool.
// export const ANSWERS = [...new Set(fiveLetterWords(english10))];
export const ANSWERS = [...new Set(lists.flatMap(fiveLetterWords))];

// Every five-letter word from every packaged *-words-*.json file is a valid guess.
export const VALID_GUESSES = new Set(lists.flatMap(fiveLetterWords));

export function getRandomAnswer(exclude?: string) {
  const normalizedExclude = exclude ? normalize(exclude) : null;
  const available = normalizedExclude
    ? ANSWERS.filter((word) => word !== normalizedExclude)
    : ANSWERS;

  return available[Math.floor(Math.random() * available.length)] ?? ANSWERS[0];
}

export function getDailyAnswer(dateKey: string) {
  let hash = 2166136261;
  for (const character of dateKey) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return ANSWERS[(hash >>> 0) % ANSWERS.length];
}

export const WORD_SOURCE = "wordlist-english/english-words-10.json";
export const GUESS_SOURCE = "wordlist-english/*-words-*.json";
export const isValidGuess = (guess: string) =>
  VALID_GUESSES.has(normalize(guess));

export const WORD_LIST_STATS = {
  answerCount: ANSWERS.length,
  validGuessCount: VALID_GUESSES.size,
  sourceFileCount: lists.length,
};

export const WORD_LENGTH = 5;

export default { ANSWERS, VALID_GUESSES, getRandomAnswer, isValidGuess };
