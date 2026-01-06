import Modal from 'react-bootstrap/Modal';

export default function AlreadyUsedLetterModal({
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
        <Modal.Title>Lettera già utilizzata</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        La lettera "<strong>{letter}</strong>" è già stata utilizzata.
      </Modal.Body>
    </Modal>
  );
}
