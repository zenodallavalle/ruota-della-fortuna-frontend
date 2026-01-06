import Modal from 'react-bootstrap/Modal';

export default function NotFoundLetterModal({
  show,
  onHide,
  letter,
}: {
  show: boolean;
  onHide: () => void;
  letter: string;
}) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Lettera non trovata</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        La lettera "<strong>{letter}</strong>" non è presente nella frase.
      </Modal.Body>
    </Modal>
  );
}
