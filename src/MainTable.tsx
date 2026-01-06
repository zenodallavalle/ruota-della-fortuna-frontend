import type { CharsData } from './useSentenceToGuess.ts';

import type GameData from './types/GameData.ts';

const ROWS = 4;
const COLS = 14;

const EXCLUDED = new Set(['0-0', '0-13', '3-0', '3-13']);

export default function MainTable({
  sentenceToGuessData,
  gameData,
  revealAtIndex,
  notFoundLetters,
}: {
  sentenceToGuessData: CharsData;
  gameData: GameData;
  revealAtIndex: (index: number) => void;
  notFoundLetters: Set<string>;
}) {
  const { suggestion, roundExpress, showNotFoundLetters } = gameData;
  let charIndex = 0;
  return (
    <div className="container-fluid">
      <div className="w-100 mb-3">
        {Array.from({ length: ROWS }).map((_, r) => (
          <div key={`row-${r}`} className="board">
            {Array.from({ length: COLS }).map((_, c) => {
              const isExcluded = EXCLUDED.has(`${r}-${c}`);
              if (isExcluded) {
                return <div key={`spacer-${r}-${c}`} className="cell spacer" />;
              }
              const data = sentenceToGuessData[charIndex++];
              let cls = 'cell cell-bordered fw-bold';
              if (!data.isLetter) {
                if (data.char === ' ') {
                  cls += ' filled';
                } else {
                  cls += ' bg-light text-dark';
                }
              } else {
                if (data.isShown === true) {
                  cls += ' shown bg-light text-dark';
                } else if (data.isShown === 'animating') {
                  cls += ' animating bg-warning text-warning';
                } else if (data.isShown === 'enhance-already-shown') {
                  cls += ' enhance-already-shown bg-warning text-dark';
                } else {
                  cls += ' bg-light text-light';
                }
              }
              return roundExpress ? (
                <button
                  key={`cell-${r}-${c}`}
                  className={cls}
                  disabled={!data.isLetter || data.isShown !== false}
                  onClick={() => revealAtIndex(data.index)}
                >
                  {data.isLetter && data.isShown === false
                    ? 'x'
                    : data.char === ' '
                    ? '_'
                    : data.char}
                </button>
              ) : (
                <div key={`cell-${r}-${c}`} className={cls}>
                  {data.isLetter && data.isShown === false
                    ? 'x'
                    : data.char === ' '
                    ? '_'
                    : data.char}
                </div>
              );
            })}
          </div>
        ))}
        {showNotFoundLetters && notFoundLetters.size > 0 && (
          <div className="board not-found-letters mt-3">
            {Array.from(notFoundLetters).map((letter) => (
              <div
                key={`not-found-${letter}`}
                className="cell cell-bordered cell-diagonal-line fly-in-to-not-found-letters bg-white fw-bold"
              >
                {letter}
              </div>
            ))}
          </div>
        )}
      </div>

      {suggestion && (
        <div className="w-100 mb-4">
          <hr className="pb-0" />
          <div className="d-flex justify-content-center pb-2">
            <span className="px-3 suggestion fw-bold">
              {suggestion.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
