import React from 'react';
import CandidateCardIntro from '../components/CandidateCardIntro';
import "../App.css";
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../hooks/useLanguage';

interface SummaryProps {
  topicTitle: string;
  onStartAnother: () => void;
}

const Summary: React.FC<SummaryProps> = ({onStartAnother }) => {
  const { t } = useLanguage();

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
        <LanguageToggle />
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
        <p className="subtitle">{t("summary")}</p> 
        <p className="intro-text" style={{marginTop: "0px"}}>{t("debatedShowed")}</p>
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
        <p> {t("summary1")}</p>
        <p>{t("summary2")}</p>
        <p>• <strong>{t("summary31")}</strong> {t("summary3")}</p>
      </section>

      <footer className="footer-end-row" style= {{ marginTop: "30px", textAlign: "center" , marginBottom: "10px"  }}>
        <button className="con-primary-btn" onClick={onStartAnother}>
          {t("startNewRound")}
        </button>
      </footer>
    </div>
    </div>
  );
};

export default Summary;