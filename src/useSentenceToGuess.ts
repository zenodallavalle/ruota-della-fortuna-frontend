import { useState, useEffect, useRef } from 'react';

export interface SentenceToGuessChar {
  char: string;
  isLetter: boolean;
  isShown: 'animating' | boolean;
  index: number;
}
// SentenceToGuessData is a type alias for an array of SentenceToGuessChar
export type SentenceToGuessData = SentenceToGuessChar[];

const animationDelayMs = 500;

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

function initializeSentenceToGuessData(sentence: string): SentenceToGuessData {
  return sentence.split('').map((char, index) => ({
    char,
    isLetter: Boolean(char.match(/[a-zèéèáàíìóòúùA-ZÈÉÈÁÀÍÌÓÒÚÙ]/)),
    isShown: false,
    index,
  }));
}

const vocalChars = 'aeiouàèéìíòóùúAEIOUÀÈÉÌÍÒÓÙÚ';
const consonantChars = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';

function getCharType(char: string): 'vocal' | 'consonant' | 'other' {
  if (vocalChars.includes(char)) {
    return 'vocal';
  } else if (consonantChars.includes(char)) {
    return 'consonant';
  } else {
    return 'other';
  }
}

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
  const animatingToShownTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const timeoutRefs = useRef<(ReturnType<typeof setTimeout> | null)[]>(
    originalSentence.split('').map(() => null)
  );
  const [layedOutSentence, setLayedOutSentence] = useState<string>(
    layoutSentence(originalSentence).join('')
  );
  const [sentenceToGuessData, setSentenceToGuessData] =
    useState<SentenceToGuessData>(
      initializeSentenceToGuessData(layoutSentence(originalSentence).join(''))
    );

  const [vocalsToReveal, setVocalsToReveal] = useState<Set<string>>(
    extractVocals(originalSentence)
  );
  const [consonantsToReveal, setConsonantsToReveal] = useState<Set<string>>(
    extractConsonants(originalSentence)
  );

  useEffect(() => {
    setLayedOutSentence(layoutSentence(originalSentence).join(''));
    setSentenceToGuessData(
      initializeSentenceToGuessData(layoutSentence(originalSentence).join(''))
    );
    setVocalsToReveal(extractVocals(originalSentence));
    setConsonantsToReveal(extractConsonants(originalSentence));
    // cleanup timeouts on sentence change
    cleanUpTimeouts();
  }, [originalSentence]);

  const setShownImmediate = (index: number, shown: 'animating' | boolean) => {
    if (index < 0 || index >= sentenceToGuessData.length) return;
    setSentenceToGuessData((originalData: SentenceToGuessData) => {
      const newData = [...originalData];
      newData[index].isShown = shown;
      return newData;
    });
  };

  const setShown = (
    index: number,
    shown: 'animating' | boolean,
    timeout: number | null = null
  ) => {
    if (index < 0 || index >= sentenceToGuessData.length) return;
    if (timeout) {
      timeoutRefs.current[index] = setTimeout(() => {
        setShownImmediate(index, shown);
      }, timeout);
    } else {
      setShownImmediate(index, shown);
    }
  };

  const revealAtIndex = (index: number) => {
    setShown(index, 'animating');
    animatingToShownTimeoutRef.current = setTimeout(() => {
      setShown(index, true);
    }, animationDelayMs);
  };

  const revealLetter = (letter: string) => {
    const regex = getRegExForLetter(letter);
    let match;
    const matchesIndices: number[] = [];
    while ((match = regex.exec(layedOutSentence)) !== null) {
      matchesIndices.push(match.index);
    }
    matchesIndices.forEach((index, i) => {
      setShown(index, 'animating', i * animationDelayMs);
    });
    animatingToShownTimeoutRef.current = setTimeout(() => {
      matchesIndices.forEach((index, i) => {
        setShown(index, true, animationDelayMs + animationDelayMs * i);
      });
    }, matchesIndices.length * animationDelayMs);
    const letterType = getCharType(letter);
    if (letterType === 'vocal') {
      setVocalsToReveal((original) => {
        const newSet = new Set(original);
        newSet.delete(letter);
        return newSet;
      });
    } else if (letterType === 'consonant') {
      setConsonantsToReveal((original) => {
        const newSet = new Set(original);
        newSet.delete(letter);
        return newSet;
      });
    }
    return matchesIndices.length > 0;
  };

  function cleanUpTimeouts() {
    timeoutRefs.current.forEach((timeout) => {
      if (timeout) clearTimeout(timeout);
    });
    if (animatingToShownTimeoutRef.current) {
      clearTimeout(animatingToShownTimeoutRef.current);
    }
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
    setShown,
    revealLetter,
    revealAtIndex,
  };
}
