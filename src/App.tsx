import { useState } from 'react';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';

import './App.css';

import useSentenceToGuess from './useSentenceToGuess.ts';
import AlreadyUsedLetterModal from './AlreadyUsedLetterModal.tsx';
import NotFoundLetterModal from './NotFoundLetterModal.tsx';
import SetupModal from './SetupModal.tsx';
import MainTable from './MainTable.tsx';

import type GameData from './types/GameData.ts';

import ruota_della_fortuna_img from '/ruota_della_fortuna.jpg?url';

const emptyGameData: GameData = {
  sentenceToGuess: '',
  suggestion: '',
  roundExpress: false,
  showNotFoundLetters: false,
};

function App() {
  const [gameData, setGameData] = useState<GameData>(emptyGameData);
  const [showAlreadyUsedLetterModal, setShowAlreadyUsedLetterModal] =
    useState(false);
  const [showNotFoundLetterModal, setShowNotFoundLetterModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const {
    sentenceToGuessData,
    vocalsToReveal,
    consonantsToReveal,
    notFoundLetters,
    animating,
    revealLetter,
    revealAtIndex,
  } = useSentenceToGuess(gameData.sentenceToGuess);

  const onGameSetup = (payload: {
    sentenceToGuess: string;
    suggestion: string;
    showNotFoundLetters: boolean;
  }) => {
    setGameData({
      ...emptyGameData,
      ...payload,
    });
    setShowSetupModal(false);
  };

  const onPickLetter = () => {
    const letter = inputValue.trim().toUpperCase();

    const found = revealLetter(letter);
    if (!found) {
      if (gameData.showNotFoundLetters) {
        setInputValue('');
      } else {
        setShowNotFoundLetterModal(true);
      }
    } else {
      setInputValue('');
    }
  };

  const pickLetterDisabled =
    animating ||
    !gameData.sentenceToGuess ||
    inputValue.length !== 1 ||
    Boolean(inputValue.match(/[^a-zA-Z]/));

  return (
    <div className="mt-2 mx-3">
      <img src={ruota_della_fortuna_img} className="wheel-bg" alt="" />
      <AlreadyUsedLetterModal
        show={showAlreadyUsedLetterModal}
        onHide={() => {
          setShowAlreadyUsedLetterModal(false);
          setInputValue('');
        }}
        letter={inputValue.trim().toUpperCase()}
      />
      <NotFoundLetterModal
        show={showNotFoundLetterModal}
        onHide={() => {
          setShowNotFoundLetterModal(false);
          setInputValue('');
        }}
        letter={inputValue.trim().toUpperCase()}
      />
      <SetupModal
        show={showSetupModal}
        onHide={() => setShowSetupModal(false)}
        payload={gameData}
        onSubmit={onGameSetup}
      />
      {gameData.sentenceToGuess && consonantsToReveal.size === 0 && (
        <Alert variant="info">Tutte le consonanti sono state rivelate!</Alert>
      )}
      {gameData.sentenceToGuess && vocalsToReveal.size === 0 && (
        <Alert variant="info">Tutte le vocali sono state rivelate!</Alert>
      )}
      <div className="d-flex align-items-center mb-3">
        <Button
          variant="secondary"
          className=""
          onClick={() => setShowSetupModal(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-gear"
            viewBox="0 0 16 16"
            svg-img-alt="Impostazioni"
          >
            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
          </svg>
        </Button>
        <span className="px-1" />
        <FormControl
          type="text"
          placeholder="Digita la lettera scelta"
          value={inputValue}
          isInvalid={pickLetterDisabled}
          disabled={gameData.roundExpress || !gameData.sentenceToGuess}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              !pickLetterDisabled && onPickLetter();
            }
          }}
        />
        <span className="px-1" />
        <Button
          variant="primary text-nowrap"
          disabled={pickLetterDisabled}
          onClick={onPickLetter}
        >
          Scegli lettera
        </Button>
      </div>

      {gameData.sentenceToGuess ? (
        <div className="mb-3">
          <MainTable
            sentenceToGuessData={sentenceToGuessData}
            gameData={gameData}
            revealAtIndex={revealAtIndex}
            notFoundLetters={notFoundLetters}
          />
        </div>
      ) : (
        <h4 className="mb-3 text-center">
          Imposta una frase per iniziare il gioco.
        </h4>
      )}
    </div>
  );
}

export default App;
