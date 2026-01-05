import React, { useState } from "react";
import type { Role } from "../types/types";
import CandidateCardIntro from "../components/CandidateCardIntro";
import "../App.css";


interface RoleSelectionProps {
  role: Role;
  setRole: (value: Role) => void;
  selectedTopic: string;
  setSelectedTopic: (value: string) => void;
  customTopic: string;
  setCustomTopic: (value: string) => void;
  onContinue: () => void;
}


const RoleSelection: React.FC<RoleSelectionProps> = ({
  role,
  setRole,
  selectedTopic,
  setSelectedTopic,
  customTopic,
  setCustomTopic,
  onContinue,
}) => {
  const roles: { id: Role; label: string; description: string }[] = [
    {
      id: "WATCH",
      label: "Only observe the debate",
      description: "You observe and follow the arguments.",
    },
    {
      id: "COMMENT",
      label: "Ask questions and comment",
      description: "You can send questions and short comments.",
    },
    {
      id: "ACTIVE",
      label: "Be an active part of the debate",
      description: "You participate as if you were one side.",
    },
  ];
  

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
  };

  const topics = ["Topic 1", "Krankenkassenprämie", "Topic 3"];
  const [customTopicConfirmed, setCustomTopicConfirmed] = useState(false);

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setCustomTopic("");
    setCustomTopicConfirmed(false);
  };

  const handleConfirmCustomTopic = () => {
    if (customTopic.trim()) {
      setSelectedTopic("");
      setCustomTopicConfirmed(true);
    }
  };

  const canContinue = role && (selectedTopic || customTopicConfirmed);

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


      <header className="screen-header" style={{marginBottom: "30px", marginTop: "0px"}}>
        <p className="subtitle">Chatbot Debate Arena</p>
        <p className="intro-text">
          Vier KI-Persönlichkeiten. Eine Debatte.<br />
          Du entscheidest, wie du mitmachst.
        </p>
      </header>

      <div className="screen" style={{
      boxShadow: "0 2px 10px rgba(80, 60, 160, 0.2), 0 8px 24px rgba(80, 60, 160, 0.12), 0 0 80px rgba(80, 60, 160, 0.08)",
      paddingLeft: "40px",
      paddingRight: "40px",
      paddingBottom: "15px",
      paddingTop: "5px",

      background: "#F9F8FD",
      margin: "0px auto",
      maxWidth: "860px",
      height: "auto",
      borderRadius: "24px"
    }}>
      <section className="role-title">
        <h2>Select your role for the debate:</h2>
        <div className="button-grid">
          {roles.map((r) => (
            <button
              key={r.id ?? "NONE"}
              className={
                "primary-btn outline" + (role === r.id ? " primary-btn-active" : "")
              }
              onClick={() => handleRoleSelect(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>
      <section className="role-title">
        <h2>Choose a topic:</h2>
        <div className="button-grid-horizontal">
          {topics.map((topic) => (
            <button
              key={topic}
              className={
                "topic-btn outline" +
                (selectedTopic === topic && !customTopic
                  ? " topic-btn-active"
                  : "")
              }
              onClick={() => handleTopicSelect(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        <h3>Or enter your own topic here:</h3>
        
        <div className="custom-topic-row">
          <input
            className={"text-input" + (customTopicConfirmed ? " confirmed" : "")}
            placeholder="Type your own topic here..."
            value={customTopic}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCustomTopic(e.target.value);
                  setCustomTopicConfirmed(false);
                  setSelectedTopic("");
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter" && customTopic.trim()) {
                        e.preventDefault();
                        handleConfirmCustomTopic();
                      }
                    }}
            />
            <button 
              className={"send-btn" + (customTopic.trim() && !customTopicConfirmed ? " active" : "")}
              onClick={handleConfirmCustomTopic}
              disabled={!customTopic.trim() || customTopicConfirmed}
            >
              {customTopicConfirmed ? "✓" : "Enter"}
            </button>
          </div>
      </section>

      <div className="footer-end-row" style={{marginBottom: "0px"}}>
        <button 
          className="con-primary-btn" 
          onClick={onContinue}
          disabled={!canContinue}
        >
          Continue
        </button>
      </div>
      </div>
    </div>
  );
};

export default RoleSelection;