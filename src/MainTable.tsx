import type { SentenceToGuessData } from './useSentenceToGuess.ts';

import type GameData from './types/GameData.ts';

const ROWS = 4;
const COLS = 14;

const EXCLUDED = new Set(['0-0', '0-13', '3-0', '3-13']);

export default function MainTable({
  sentenceToGuessData,
  gameData,
  revealAtIndex,
}: {
  sentenceToGuessData: SentenceToGuessData;
  gameData: GameData;
  revealAtIndex: (index: number) => void;
}) {
  const { suggestion, notFoundLetters, roundExpress, showNotFoundLetters } =
    gameData;
  let charIndex = 0;
  return (
    <div className="container-fluid">
      <div className="w-100 mb-3">
        {Array.from({ length: ROWS }).map((_, r) => (
          <div className="board mb-2">
            {Array.from({ length: COLS }).map((_, c) => {
              const isExcluded = EXCLUDED.has(`${r}-${c}`);
              if (isExcluded) {
                return <div key={`spacer-${r}-${c}`} className="cell spacer" />;
              }
              const data = sentenceToGuessData[charIndex++];
              let cls = 'cell border border-dark border-4 fw-bold';
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
                  {data.isLetter && data.isShown !== true
                    ? 'x'
                    : data.char === ' '
                    ? '_'
                    : data.char}
                </button>
              ) : (
                <div key={`cell-${r}-${c}`} className={cls}>
                  {data.isLetter && data.isShown !== true
                    ? 'x'
                    : data.char === ' '
                    ? '_'
                    : data.char}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {suggestion && (
        <div className="w-100 mb-4 text-center">
          <hr />
          <h5>{suggestion}</h5>
        </div>
      )}
      {showNotFoundLetters && (
        <div className="text-center mt-3">
          <hr />
          <h6>Lettere non trovate</h6>
          <div className="d-flex justify-content-center">
            {notFoundLetters.split('').map((letter) => (
              <div
                key={`not-found-letter-${letter}`}
                className="me-1 fly-in-to-not-found-letters"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
