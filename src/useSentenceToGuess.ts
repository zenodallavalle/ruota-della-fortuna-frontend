import { useState, useEffect, useMemo, useRef } from 'react';

type isShownType = 'animating' | 'enhance-already-shown' | boolean;

export interface CharData {
  char: string;
  isLetter: boolean;
  isShown: isShownType;
  index: number;
}
// CharsData is a type alias for an array of CharData
export type CharsData = CharData[];

const animationDelayMs = 500;

class TimeoutWithExpired {
  timeout: ReturnType<typeof setTimeout>;
  expired: boolean = false;
  constructor(fn: (...args: any[]) => void, delay: number) {
    this.timeout = setTimeout((...args: any[]) => {
      this.expired = true;
      fn(...args);
    }, delay);
  }
  clear() {
    clearTimeout(this.timeout);
    this.expired = true;
  }
}

function getRegExForLetter(letter: string): RegExp {
  const e = 'eéè';
  const a = 'aàá';
  const i = 'iíì';
  const o = 'oóò';
  const u = 'uúù';
  const letterLowerCase = letter.toLowerCase();

  if (e.includes(letterLowerCase)) {
    return RegExp(`[${e}${e.toUpperCase()}]`, 'g'); //i.e. /[eéèEÉÈ]/g
  } else if (a.includes(letterLowerCase)) {
    return RegExp(`[${a}${a.toUpperCase()}]`, 'g');
  } else if (i.includes(letterLowerCase)) {
    return RegExp(`[${i}${i.toUpperCase()}]`, 'g');
  } else if (o.includes(letterLowerCase)) {
    return RegExp(`[${o}${o.toUpperCase()}]`, 'g');
  } else if (u.includes(letterLowerCase)) {
    return RegExp(`[${u}${u.toUpperCase()}]`, 'g');
  } else {
    return RegExp(`[${letter}${letter.toUpperCase()}]`, 'g');
  }
}

function layoutSentence(sentence: string): string[] {
  const ROW_SIZES = [12, 14, 14, 12];

  // Normalizza spazi e tiene la punteggiatura attaccata alla parola
  // (es: "ciao ," -> "ciao,")
  sentence = sentence
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1');

  const words = sentence.split(' ');

  const rows = [];
  let rowIndex = 0;

  while (rowIndex < ROW_SIZES.length && words.length) {
    const maxLen = ROW_SIZES[rowIndex];
    let lineWords = [];
    let lineLen = 0;

    while (words.length) {
      const next = words[0];
      const needed = (lineWords.length ? 1 : 0) + next.length;

      if (lineLen + needed > maxLen) break;

      words.shift();
      lineWords.push(next);
      lineLen += needed;
    }

    const content = lineWords.join(' ');

    // centra orizzontalmente
    const padLeft = Math.floor((maxLen - content.length) / 2);
    const padRight = maxLen - content.length - padLeft;

    rows.push(' '.repeat(padLeft) + content + ' '.repeat(padRight));
    rowIndex++;
  }

  // riempi eventuali righe rimaste vuote
  while (rows.length < ROW_SIZES.length) {
    rows.push(' '.repeat(ROW_SIZES[rows.length]));
  }

  return rows;
}

function initializeSentenceToGuessData(sentence: string): CharsData {
  return sentence.split('').map((char, index) => ({
    char,
    isLetter: Boolean(char.match(/[a-zèéèáàíìóòúùA-ZÈÉÈÁÀÍÌÓÒÚÙ]/)),
    isShown: false,
    index,
  }));
}

const vocalChars = 'aeiouàèéìíòóùúAEIOUÀÈÉÌÍÒÓÙÚ';
const consonantChars = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';

function extractVocals(sentence: string): Set<string> {
  const vocals = new Set<string>();
  for (const char of sentence) {
    if (vocalChars.includes(char)) {
      vocals.add(char);
    }
  }
  return vocals;
}

function extractConsonants(sentence: string): Set<string> {
  const consonants = new Set<string>();

  for (const char of sentence) {
    if (consonantChars.includes(char)) {
      consonants.add(char);
    }
  }
  return consonants;
}

export default function useSentenceToGuess(sentence: string) {
  const originalSentence = sentence.trim().toUpperCase();
  const animatingToShownTimeoutRef = useRef<TimeoutWithExpired | null>(null);
  const timeoutRefs = useRef<(TimeoutWithExpired | null)[]>(
    originalSentence.split('').map(() => null)
  );
  const [layedOutSentence, setLayedOutSentence] = useState<string>('');
  const [sentenceToGuessData, setSentenceToGuessData] = useState<CharsData>([]);

  const [usedLetters, setUsedLetters] = useState(new Set<string>());
  const [notFoundLetters, setNotFoundLetters] = useState(new Set<string>());

  const vocalsInTheSentence = useMemo(
    () => extractVocals(originalSentence),
    [originalSentence]
  );
  const consonantsInTheSentence = useMemo(
    () => extractConsonants(originalSentence),
    [originalSentence]
  );

  const vocalsToReveal = vocalsInTheSentence.difference(usedLetters);
  const consonantsToReveal = consonantsInTheSentence.difference(usedLetters);

  const animating =
    timeoutRefs.current.some((t) => t !== null && !t.expired) ||
    (animatingToShownTimeoutRef.current !== null &&
      !animatingToShownTimeoutRef.current.expired);

  useEffect(() => {
    const _layedOutSentence = layoutSentence(originalSentence).join('');
    setLayedOutSentence(_layedOutSentence);
    setSentenceToGuessData(initializeSentenceToGuessData(_layedOutSentence));
    setUsedLetters(new Set<string>());
    setNotFoundLetters(new Set<string>());
    // cleanup timeouts on sentence change
    cleanUpTimeouts();
  }, [originalSentence]);

  const setShownImmediate = (index: number, shown: isShownType) => {
    if (index < 0 || index >= sentenceToGuessData.length) return;
    setSentenceToGuessData((originalData: CharsData) => {
      const newData = [...originalData];
      newData[index].isShown = shown;
      return newData;
    });
  };

  const setShown = (
    index: number,
    shown: isShownType,
    timeout: number | null = null
  ) => {
    if (index < 0 || index >= sentenceToGuessData.length) return;
    if (timeout) {
      timeoutRefs.current[index] = new TimeoutWithExpired(() => {
        setShownImmediate(index, shown);
      }, timeout);
    } else {
      setShownImmediate(index, shown);
    }
  };

  const revealAtIndex = (index: number) => {
    if (sentenceToGuessData[index].isShown === true) return;
    setShown(index, 'animating');
    animatingToShownTimeoutRef.current = new TimeoutWithExpired(() => {
      setShown(index, true);
    }, animationDelayMs);
  };

  const revealLetter = (letter: string) => {
    setUsedLetters((original) => {
      const newSet = new Set(original);
      newSet.add(letter);
      return newSet;
    });
    const regex = getRegExForLetter(letter);
    let match;
    const matchesIndices: number[] = [];
    while ((match = regex.exec(layedOutSentence)) !== null) {
      matchesIndices.push(match.index);
    }
    if (!usedLetters.has(letter)) {
      // only set used letter if not already present
      matchesIndices.forEach((index, i) => {
        setShown(index, 'animating', i * animationDelayMs);
      });
      animatingToShownTimeoutRef.current = new TimeoutWithExpired(() => {
        matchesIndices.forEach((index, i) => {
          setShown(index, true, animationDelayMs + animationDelayMs * i);
        });
      }, matchesIndices.length * animationDelayMs);
      if (matchesIndices.length === 0) {
        setNotFoundLetters((original) => {
          const newSet = new Set(original);
          newSet.add(letter);
          return newSet;
        });
      }
    } else {
      // letter was already used
      if (matchesIndices.length > 0) {
        // letter is in the sentence, but was already revealed
        matchesIndices.forEach((index, i) => {
          setShown(index, 'enhance-already-shown', i * animationDelayMs);
        });
        animatingToShownTimeoutRef.current = new TimeoutWithExpired(() => {
          matchesIndices.forEach((index, i) => {
            setShown(index, true, animationDelayMs + animationDelayMs * i);
          });
        }, 3000 + matchesIndices.length * animationDelayMs);
      }
    }
    return matchesIndices.length > 0;
  };

  function cleanUpTimeouts() {
    timeoutRefs.current.forEach((timeout) => {
      timeout?.clear();
    });
    animatingToShownTimeoutRef.current?.clear();
  }

  useEffect(() => {
    return () => {
      // cleanup timeouts on unmount
      cleanUpTimeouts();
    };
  }, []);

  return {
    originalSentence,
    sentenceToGuessData,
    vocalsToReveal,
    consonantsToReveal,
    usedLetters,
    notFoundLetters,
    animating,
    setShown,
    revealLetter,
    revealAtIndex,
  };
}
