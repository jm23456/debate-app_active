import React from 'react';
import "../App.css";

interface ExitWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ExitWarningModal: React.FC<ExitWarningModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="exit-warning-modal-overlay">
      <div className="exit-warning-modal">
        <div className="modal-icon">⚠️</div>
        <h2 className="modal-title">Bist du sicher?</h2>
        <p className="modal-text">
          Willst du die Debatte wirklich verlassen? Dein Fortschritt geht verloren.
        </p>
        <div className="exit-modal-buttons">
          <button className="exit-cancel-btn" onClick={onCancel}>
            Abbrechen
          </button>
          <button className="exit-confirm-btn" onClick={onConfirm}>
            Ja, verlassen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitWarningModal;
