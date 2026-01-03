import React from 'react';
import CandidateCardIntro from '../components/CandidateCardIntro';
import "../App.css";

interface SummaryProps {
  topicTitle: string;
  onStartAnother: () => void;
}

const Summary: React.FC<SummaryProps> = ({onStartAnother }) => {
  return (
    <div className="screen">
      <section className="screen-body">
        <div className="intro-stage">
          {/* Pro Side */}
            <div className="introcandidates-row-left">
              <CandidateCardIntro color="yellow" />
              <CandidateCardIntro color="gray" />
            </div>

        {/* Contra Side */}
          <div className="introcandidates-row-right">
            <CandidateCardIntro color="red" />
            <CandidateCardIntro color="green" />
          </div>
        </div>
      </section>
      <header className="screen-header">
        <p className="subtitle">Zusammenfassung</p>
      </header>

      <section className="screen-body scrollable">
        <p>
          Die Debatte zeigt: Steigende Krankenkassenprämien entstehen durch 
          Mengenausweitung, Fehlanreize und ungleiche Kostenverteilung.
        </p>
        <p>
          Während einige stärkere Kostensteuerung fordern, betonen andere 
          Solidarität, Qualität und bessere Information.
        </p>
        <p>
          <strong>Klar ist:</strong> Einfache Lösungen gibt es nicht – Reformen müssen 
          Kosten, Qualität und Verantwortung gemeinsam berücksichtigen.
        </p>
      </section>

      <footer className="footer-end-row">
        <button className="con-primary-btn" onClick={onStartAnother}>
          Neue Runde starten
        </button>
      </footer>
    </div>
  );
};

export default Summary;