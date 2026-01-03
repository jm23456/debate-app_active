import React from 'react';
import "../App.css";

interface TopicIntroProps {
  topicTitle: string;
  onNext: () => void;
  onExit: () => void;
}

const TopicIntro: React.FC<TopicIntroProps> = ({ topicTitle, onNext, onExit }) => {
  return (
    <div className="screen">
      <div className="top-exit-row">
        <button className="exit-btn" onClick={onExit}>
          Exit
        </button>
      </div>
      <header className="screen-header">
        <p className="subtitle">{topicTitle}</p>
        <h2>Einführung ins Thema</h2>
      </header>
      <section className="screen-body scrollable">
        <p>
          Die Krankenkassenprämien steigen nächstes Jahr im Schnitt um 4,5 Prozent. 
          Seit Einführung der obligatorischen Krankenversicherung sind sie deutlich 
          stärker gestiegen als Löhne oder Teuerung. Viele Haushalte geraten unter Druck.
        </p>
        <p>
          Die Frage lautet: Wie krank ist unser Gesundheitssystem – und wo muss angesetzt werden?
        </p>
      </section>
      <footer className="footer-end-row">
        <button className="con-primary-btn" onClick={onNext}>
          Next
        </button>
      </footer>
    </div>
  );
};

export default TopicIntro;