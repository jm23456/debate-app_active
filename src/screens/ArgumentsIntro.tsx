import React, { useState, useEffect, useRef, useMemo } from "react";
import CandidateCard from "../components/CandidateCard";
import MuteButton from "../components/MuteButton";
import ExitWarningModal from "../components/ExitWarningModal";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import type { BotColor } from "../hooks/useSpeechSynthesis";
import "../App.css";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from '../hooks/useLanguage';    
import mockDebateDE from '../components/mockDebate.de.json';
import mockDebateEN from '../components/mockDebate.en.json';


interface ArgumentsIntroProps {
  topicTitle: string;
  onContinue: () => void;
  onExit: () => void;
  introTime: string;
  totalBots: number;
  onFinalContinue: () => void;
  hasStarted: boolean;
  onStart: () => void;
}

const ArgumentsIntro: React.FC<ArgumentsIntroProps> = ({
  onContinue,
  onExit,
  introTime,
  totalBots,
  onFinalContinue,
  hasStarted,
  onStart,
}) => {
  const { t, language } = useLanguage();
  const [spokenBots, setSpokenBots] = useState<number[]>([]); 
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState<string | undefined>(undefined);
  const [completedTexts, setCompletedTexts] = useState<Record<number, string>>({});
  const typingIntervalRef = useRef<number | null>(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [activeBot, setActiveBot] = useState(0);
  const [showTimeExpired, setShowTimeExpired] = useState(false);
  type Color = "yellow" | "gray" | "blue" | "green" | "red" ;
  type Bot = {
    color: Color;
    label: string;
    description: string;
  };

  type Speaker = "A" | "B" | "C" | "D" | "E" | "SYSTEM";

    type DebateScriptItem = {
    id: number;
    speaker: Speaker;
    text: string;
  }

  type RoleData = {
    description: string;
  }

  type DebateData = {
    debate_script?: DebateScriptItem[];
    "Arguments Intro"?: DebateScriptItem[];
    roles?: Record<string, RoleData>;
  }

  // Timer abgelaufen Check
  useEffect(() => {
    if (introTime === "0:00" && hasStarted && !showTimeExpired) {
      setShowTimeExpired(true);
    }
  }, [introTime, hasStarted, showTimeExpired]);

  // Speech Synthesis
  const { isMuted, toggleMute, speak, stopSpeaking, getWordDuration } = useSpeechSynthesis();

  // Skip function - überspringt nur den aktuellen Bot (stoppt Sprechen, zeigt vollen Text)
  const handleSkip = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    stopSpeaking();
    
    // Zeige den vollständigen Text des aktuellen Bots an
    const currentBotText = allBots[activeBot].label;
    setCurrentTypingText(undefined);
    setCompletedTexts(prev => ({ ...prev, [activeBot]: currentBotText }));
    setSpokenBots(prev => prev.includes(activeBot) ? prev : [...prev, activeBot]);
    setIsTyping(false);
  };

  // Exit handlers
  const handleExitClick = () => {
    setShowExitWarning(true);
  };

  const handleExitConfirm = () => {
    setShowExitWarning(false);
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    stopSpeaking();
    onExit();
  };

  const handleExitCancel = () => {
    setShowExitWarning(false);
  };

  // Pro: B (yellow) = Solidarität & soziale Perspektive, D (gray) = Ökonomische Systemperspektive
  // Contra: A (red) = Kosten & Versicherer-Perspektive, C (green) = Medizinische Fachperspektive
  // Undecided: E (blue) = Betroffene Bevölkerung
  const debateData = (language === "de" ? mockDebateDE : mockDebateEN) as DebateData;
  const speakerColors: Record<string, Color> = {
    A: "red",
    B: "yellow",
    C: "green",
    D: "gray",
    E: "blue",
  };

   const debateScript: DebateScriptItem[]= debateData["Arguments Intro"]
  ?? debateData.debate_script ?? [];

  const roles = debateData.roles;

  const order: Color[] = ["yellow", "gray", "blue", "red", "green"];

  const allBots: Bot[] = useMemo (()=> {
    return debateScript.map((msg): Bot => {
      const color = speakerColors[msg.speaker];
      return {
        color,
        label: msg.text,
        description: (roles as Record <Speaker, RoleData> | undefined)?.[msg.speaker]?.description ?? "",
      };
    }).sort((a, b) => order.indexOf(a.color) - order.indexOf(b.color));
  }, [debateScript, roles]);

  const typewriterEffect = (text: string, botIndex: number, onComplete: () => void) => {
    const words = text.split(" ");
    let wordCount = 0;
    setCurrentTypingText("");
    
    // Bot-Farbe ermitteln und Speech Synthesis mit spezifischer Stimme starten
    const botColor = allBots[botIndex].color as BotColor;
    speak(text, { botColor, lang: language });
    
    typingIntervalRef.current = window.setInterval(() => {
      wordCount++;
      if (wordCount <= words.length) {
        setCurrentTypingText(words.slice(0, wordCount).join(" "));
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setCurrentTypingText(undefined);
        setCompletedTexts(prev => ({ ...prev, [botIndex]: text }));
        setSpokenBots(prev => [...prev, botIndex]);
        onComplete();
      }
    }, 380);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const handleNext = () => {
    if (!hasStarted) {
      if (!allBots.length) return;
      onStart();
      setActiveBot(0);
      // Starte Typewriter für ersten Bot
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        typewriterEffect(allBots[0].label, 0, () => {});
      }, 800);
      return;
    }

    // Wenn noch am Tippen, nicht fortfahren
    if (isTyping || currentTypingText !== undefined) return;
    
    if (activeBot < totalBots - 1) {
      const nextBot = activeBot + 1;
      setActiveBot(nextBot);
      onContinue();
      
      // Starte Typewriter für nächsten Bot
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        typewriterEffect(allBots[nextBot].label, nextBot, () => {});
      }, 800);
    } else {
      onFinalContinue();      
    }
  };

  const getBotText = (seq: number): string | undefined => {
    if (activeBot === seq && currentTypingText !== undefined) {
      return currentTypingText;
    }
    return undefined;
  };

  const getBubbleLabel = (seq: number): string => {
    if (completedTexts[seq]) {
      return completedTexts[seq];
    }
    return allBots[seq].description;
  };

  return (
    <div className="screen">
      <LanguageToggle />
      <ExitWarningModal 
        isOpen={showExitWarning} 
        onConfirm={handleExitConfirm} 
        onCancel={handleExitCancel} 
      />
      {/* Timer abgelaufen Popup */}
      {showTimeExpired && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal">
            <div className="modal-icon">⏱️</div>
            <p style={{fontSize: "16px"}}>{t("timeExpiredContinue")}</p>
            <button className="start-debate-btn" onClick={() => {setShowTimeExpired(false); handleNext();}}>
              {t("continue")}
            </button>
          </div>
        </div>
      )}
      <div className="top-exit-row">
        <span className="timer-display">{introTime}</span>
        <div className="top-buttons-row">
          <MuteButton isMuted={isMuted} onToggle={toggleMute} />
          <button className="exit-btn" onClick={handleExitClick}>
            {t("exit")}
          </button>
        </div>
      </div>


      <header className="screen-header">
        <p className="subtitleArgu">{t("eachSide")}</p>
      </header>

      <section className="screen-body" style={{
        borderRadius: "24px",
        paddingTop: "50px",
    background: `
      radial-gradient(
        circle at center,
        rgba(255,255,255,0.9) 0%,
        rgba(255,255,255,0.6) 30%,
        rgba(255,255,255,0.0) 60%
      ),
      linear-gradient(
        90deg,
        #eaf6f1 0%,
        #f7f9fc 50%,
        #e9f1fb 100%
      )
    `
  }}>
        <div className="arguments-stage">
          <div className="candidates-row-unified">
            {allBots.map((bot, i) => {
              return (
                <CandidateCard
                  key={i}
                  color={bot.color as "yellow" | "gray" | "blue" | "red" | "green"}
                  hasMic={hasStarted && activeBot === i && currentTypingText !== undefined}
                  showBubble={hasStarted && (activeBot === i || spokenBots.includes(i))}
                  bubbleText={getBotText(i)}
                  isTyping={hasStarted && isTyping && activeBot === i}
                  bubbleLabel={hasStarted ? getBubbleLabel(i) : ""}
                  isSpeaking={hasStarted && activeBot === i && (isTyping || currentTypingText !== undefined)}
                />
              );
            })}
          </div>
        </div>
      </section>
            {/* Modal Overlay für Start Debate */}
      {!hasStarted && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal">
            <p style={{fontSize: "16px"}}>{t("popup1")}</p>
            <p style={{fontSize: "16px"}}>{t("popup2")}</p>
            <button className="start-debate-btn" onClick={handleNext}>
              {t("startDebate")}
            </button>
          </div>
        </div>
      )}
      <footer className="action-row">
        <button 
          className="con-primary-btn" 
          onClick={handleNext}
          disabled={hasStarted && (isTyping || currentTypingText !== undefined)} 
          style={{marginTop: "15px"}}
        >
          {activeBot < totalBots - 1 ? t("nextSpeaker") : t("continue")}
        </button>
        {hasStarted ? (
          (isTyping || currentTypingText !== undefined) ? (
            <button 
              className="skip-icon-btn" 
              onClick={handleSkip}
              title="Skip current speaker"
            >
              ⏭
            </button>
          ) : (
            <div className="skip-icon-placeholder"></div>
          )
        ) : null}
      </footer>
    </div>
  );
};

export default ArgumentsIntro;