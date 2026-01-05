import React from 'react';
import CandidateCardIntro from '../components/CandidateCardIntro';
import "../App.css";

interface SummaryProps {
  topicTitle: string;
  onStartAnother: () => void;
}

const Summary: React.FC<SummaryProps> = ({onStartAnother }) => {
  return (
    <div className="screen" style={{
     boxShadow: "0 20px 60px rgba(80, 60, 160, 0.15),0 8px 24px rgba(80, 60, 160, 0.10)",
  paddingTop: "24px",
  paddingBottom: "40px",
      margin: "32px auto",
      maxWidth: "1000px",
      borderRadius: "24px"
    }}>
      <section className="screen-body">
        <div className="intro-stage" style={{paddingBottom: "0px"}}>
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
      <header className="screen-header" style={{marginBottom: "4px", marginTop: "0px"}}>
        <p className="subtitle">Zusammenfassung</p> 
        <p className="intro-text" style={{marginTop: "0px"}}>Was die Debatte gezeigt hat:</p>
      </header>

    <div className="screen" style={{
      boxShadow: "0 2px 10px rgba(80, 60, 160, 0.2), 0 8px 24px rgba(80, 60, 160, 0.12), 0 0 80px rgba(80, 60, 160, 0.08)",
      paddingTop: "32px",
      paddingBottom: "10px",
      background: "#F9F8FD",
      margin: "0px auto",
      maxWidth: "800px",
      height: "auto",
      borderRadius: "24px"
    }}>
      <section className="screen-body scrollable" style={{maxWidth: "600px", margin: "0 auto", padding: "0 32px"}}>
        <p>• Steigende Krankenkassenprämien entstehen durch 
          Mengenausweitung, Fehlanreize und ungleiche Kostenverteilung.</p>
        <p>• Während einige stärkere Kostensteuerung fordern, betonen andere 
          Solidarität, Qualität und bessere Information.</p>
        <p>• <strong>Klar ist:</strong> Einfache Lösungen gibt es nicht – Reformen müssen 
          Kosten, Qualität und Verantwortung gemeinsam berücksichtigen.</p>
      </section>

      <footer className="footer-end-row" style= {{ marginTop: "30px", textAlign: "center" , marginBottom: "10px"  }}>
        <button className="con-primary-btn" onClick={onStartAnother}>
          Neue Runde starten
        </button>
      </footer>
    </div>
    </div>
  );
};

export default Summary;