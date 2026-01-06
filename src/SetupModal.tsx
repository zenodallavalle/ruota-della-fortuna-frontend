import { useState, useEffect } from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Modal from 'react-bootstrap/Modal';

interface Payload {
  sentenceToGuess: string;
  suggestion: string;
  roundExpress: boolean;
  showNotFoundLetters: boolean;
  [key: string]: any;
}

const emptyPayload: Payload = {
  sentenceToGuess: '',
  suggestion: '',
  roundExpress: false,
  showNotFoundLetters: false,
};

export default function SetupModal({
  show,
  onHide = () => {},
  payload,
  onSubmit: _onSubmit,
}: {
  show: boolean;
  onHide?: () => void;
  payload: Payload;
  onSubmit: (payload: Payload) => void;
}) {
  const [inputPayload, setInputPayload] = useState(emptyPayload);
  const numberOfCharacters = inputPayload.sentenceToGuess.trim().length;
  const remainingCharacters = 52 - numberOfCharacters;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputPayload((p: Payload) => ({
      ...p,
      [name]: value,
    }));
  };

  const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setInputPayload((p: Payload) => {
      const updatedPayload = { ...p, [name]: checked };
      if (name === 'roundExpress' && checked) {
        updatedPayload.showNotFoundLetters = false;
      }
      return updatedPayload;
    });
  };

  const onSubmit = () => {
    _onSubmit(inputPayload);
  };

  useEffect(() => {
    if (show) {
      setInputPayload({ ...emptyPayload, ...payload });
    }
  }, [show, payload]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <div className="fw-bold">Impostazioni</div>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-2">
          <FormControl
            type="text"
            name="sentenceToGuess"
            placeholder="Inserisci la frase da indovinare"
            value={inputPayload.sentenceToGuess}
            onChange={onChange}
          />
        </div>

        <div className={`mb-2 ${remainingCharacters < 0 ? 'text-danger' : ''}`}>
          {remainingCharacters < 0 ? (
            <span>
              {-remainingCharacters} caratteri oltre oltre il limite consentito!
            </span>
          ) : (
            <span>Numero di caratteri rimanenti: {remainingCharacters}</span>
          )}
        </div>
        <div className="mb-2">
          <FormControl
            type="text"
            name="suggestion"
            placeholder="Inserisci il suggerimento per la frase"
            value={inputPayload.suggestion}
            onChange={onChange}
          />
        </div>
        <div className="mb-2">
          <Form.Check
            type="switch"
            name="roundExpress"
            checked={inputPayload.roundExpress}
            onChange={onCheckboxChange}
            id="round-express-switch"
            label="Round Express"
          />
        </div>
        <div className="mb-2">
          <Form.Check
            type="switch"
            name="showNotFoundLetters"
            checked={inputPayload.showNotFoundLetters}
            disabled={inputPayload.roundExpress}
            onChange={onCheckboxChange}
            id="show-not-found-letters-switch"
            label="Mostra l'elenco delle lettere non trovate"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="w-100"
          variant="success"
          onClick={onSubmit}
          disabled={
            inputPayload.sentenceToGuess.trim() === '' ||
            remainingCharacters < 0
          }
        >
          Salva
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
