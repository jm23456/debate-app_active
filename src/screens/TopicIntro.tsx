import React, { useState } from 'react';
import ExitWarningModal from '../components/ExitWarningModal';
import "../App.css";

interface TopicIntroProps {
  topicTitle: string;
  onNext: () => void;
  onExit: () => void;
}

const TopicIntro: React.FC<TopicIntroProps> = ({ topicTitle, onNext, onExit }) => {
  const [showExitWarning, setShowExitWarning] = useState(false);

  const handleExitClick = () => {
    setShowExitWarning(true);
  };

  const handleExitConfirm = () => {
    setShowExitWarning(false);
    onExit();
  };

  const handleExitCancel = () => {
    setShowExitWarning(false);
  };

  return (
    <div className="screen-wrapper">
      <ExitWarningModal 
        isOpen={showExitWarning} 
        onConfirm={handleExitConfirm} 
        onCancel={handleExitCancel} 
      />
      <div className="exit-btn-outside">
        <button className="exit-btn" onClick={handleExitClick}>
          Exit
        </button>
      </div>
      <div className="screen" style={{
        boxShadow: "0 10px 40px rgba(80, 60, 160, 0.2), 0 8px 24px rgba(80, 60, 160, 0.12), 0 0 80px rgba(80, 60, 160, 0.08)",
        padding: "24px 40px",
        margin: "0 auto",
        maxWidth: "1000px",
        borderRadius: "24px"
      }}>
        <header className="screen-header">
          <p className="subtitle">{topicTitle}</p>
          <h2 style={{ textAlign: "center" }}>Warum die Kosten steigen - und was das für uns bedeutet</h2>
        </header>
        <section className="screen-body scrollable">
          <div className="topic-intro-content">
            <div className="topic-intro-image">
              <img src={import.meta.env.BASE_URL + "Infografik_Praemien.png"} alt="Infografik Prämien" />
            </div>
            <div className="topic-intro-text">
              <p>
                Die Krankenkassenprämien steigen nächstes Jahr im Schnitt um 4,5 Prozent.
              </p>
              <p> 
                Seit Einführung der obligatorischen Kranken- versicherung sind sie deutlich 
                stärker gestiegen als Löhne oder Teuerung. Viele Haushalte geraten unter Druck.
              </p>
              <p style={{ marginBottom: "35px" }}>
                Die Frage lautet: Wie krank ist unser Gesundheitssystem – und wo muss angesetzt werden?
              </p>
              <button className="con-primary-btn" onClick={onNext}>
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TopicIntro;