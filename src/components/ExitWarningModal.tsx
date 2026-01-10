import React from 'react';
import "../App.css";
import { useLanguage } from '../hooks/useLanguage';

interface ExitWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ExitWarningModal: React.FC<ExitWarningModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;


  return (
    <div className="exit-warning-modal-overlay">
      <div className="exit-warning-modal">
        <h3>{t("exitSure")}</h3>
        <div className="exit-modal-buttons">
          <button className="exit-cancel-btn" onClick={onCancel}>
            {t("cancel")}
          </button>
          <button className="exit-confirm-btn" onClick={onConfirm}>
            {t("leave")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitWarningModal;
