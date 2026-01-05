import React, { useEffect, useRef, useState } from "react";
import CandidateCard from "../components/CandidateCard";
import MuteButton from "../components/MuteButton";
import ExitWarningModal from "../components/ExitWarningModal";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import type { BotColor } from "../hooks/useSpeechSynthesis";
import type { ChatMessage } from "../types/types";
import "../App.css";


// "Be an Active Part" - Role
interface ActiveArgumentsScreenProps {
  topicTitle: string;
  introTime: string;
  inputText: string;
  setInputText: (value: string) => void;
  onSend: () => void;
  onExit: () => void;
  hasStarted: boolean;
  onStart: () => void;
}

const ActiveArgumentsIntro: React.FC<ActiveArgumentsScreenProps> = ({
  introTime,
  inputText,
  setInputText,
  onSend,
  onExit,
  hasStarted,
  onStart,
}) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showUrgentPrompt, setShowUrgentPrompt] = useState(false);
  const [hasUserSentOpinion, setHasUserSentOpinion] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Speech Synthesis
  const { isMuted, toggleMute, speak, stopSpeaking } = useSpeechSynthesis();
  
  // Chatbot speaking logic
  const [activeBot, setActiveBot] = useState(0);
  const [spokenBots, setSpokenBots] = useState<number[]>([]);
  const [allBotsFinished, setAllBotsFinished] = useState(false);
  const totalBots = 4;

  // Typewriter state
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState<string | undefined>(undefined);
  const [completedTexts, setCompletedTexts] = useState<Record<number, string>>({});
  const typingIntervalRef = useRef<number | null>(null);

  // Pro: B (yellow) = Solidarität & soziale Perspektive, D (gray) = Ökonomische Systemperspektive
  // Contra: A (red) = Kosten & Versicherer-Perspektive, C (green) = Medizinische Fachperspektive
  const allBots = [
    { color: "yellow", label: "Ich sehe vor allem ein Gerechtigkeitsproblem. Für viele Familien und den Mittelstand sind die Prämien kaum mehr tragbar. Gleichzeitig profitieren tiefe und sehr hohe Einkommen von Entlastungen. Die Lösung liegt nicht im Abbau von Leistungen, sondern in Solidarität, gezielter Entlastung und einer fairen Verteilung der Kosten.", description: "• Prämien sind für viele Familien kaum mehr tragbar.\n• Lösung liegt in Solidarität, gezielter Entlastung und fairer Verteilung von Kosten.\n• Nicht im Abbau von Leistungen." },
    { color: "gray", label: "Ich möchte das System einordnen: Die Gesundheitskosten sind hoch, aber für ein reiches Land nicht aussergewöhnlich. Das Kernproblem sind Fehlanreize und fehlende Steuerung. Nicht pauschales Sparen ist gefragt, sondern gezielte Eingriffe dort, wo Überversorgung, Ineffizienz und Doppelspurigkeiten entstehen.", description: "• Keine aussergewöhnlich hohen Gesundheitskosten.\n• Es braucht kein pauschales Sparen, sondern gezielte Eingriffe bei Überversorgungen und Ineffizienzen." },
    { color: "red", label: "Für mich ist klar: Die steigenden Prämien sind kein Zufall, sondern die direkte Folge explodierender Kosten. Diese Kosten entstehen durch immer mehr Behandlungen, unabhängig davon, ob sie nötig sind oder nicht. Solange Krankenkassen jede Leistung bezahlen müssen und keine Steuerungsmöglichkeiten haben, wird sich daran nichts ändern.", description: "• Steigende Prämien sind Folge von explodierenden Kosten durch immer mehr Behandlungen.\n• Es braucht Steuerungsmöglichkeiten für Krankenkassen.\n• Ziel: Prämien senken durch Kostenkontrolle." },
    { color: "green", label: "Aus medizinischer Sicht ist das System widersprüchlich. Wir leisten hervorragende Medizin, aber oft zu viel davon. Es gibt unnötige Untersuchungen und Eingriffe, die weder den Patienten noch dem System nützen. Gleichzeitig fehlen Anreize für Qualität und Zurückhaltung.", description: "• Das System ist widersprüchlich: Hervorragende Medizin, aber oft zu viel davon.\n• Es gibt unnötige Untersuchungen und Eingriffe, die weder Patienten noch dem System nützen." },
  ];

  const proBots = allBots.slice(0, 2);
  const contraBots = allBots.slice(2, 4);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      stopSpeaking();
    };
  }, [stopSpeaking]);

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

  const typewriterEffect = (text: string, botIndex: number, onComplete: () => void) => {
    const words = text.split(" ");
    let wordCount = 0;
    setCurrentTypingText("");
    
    // Bot-Farbe ermitteln und Speech Synthesis mit spezifischer Stimme starten
    const botColor = allBots[botIndex].color as BotColor;
    speak(text, { botColor });
    
    // Berechne Wort-Dauer basierend auf Sprechgeschwindigkeit
    
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

  const handleNextSpeaker = () => {
    if (!hasStarted) {
      onStart();
      // Starte Typewriter für ersten Bot (activeBot ist bereits 0)
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        typewriterEffect(allBots[0].label, 0, () => {});
      }, 800);
      return;
    }

    // Wenn noch am Tippen, nicht fortfahren
    if (isTyping || currentTypingText !== undefined) return;
    
    // Prüfen ob aktueller Bot noch nicht gesprochen hat
    if (!spokenBots.includes(activeBot)) {
      // Aktueller Bot hat noch nicht gesprochen, starte ihn
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        typewriterEffect(allBots[activeBot].label, activeBot, () => {});
      }, 800);
      return;
    }
    
    if (activeBot < totalBots - 1) {
      const nextBot = activeBot + 1;
      setActiveBot(nextBot);
      
      // Starte Typewriter für nächsten Bot
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        typewriterEffect(allBots[nextBot].label, nextBot, () => {});
      }, 800);
    } else {
      // Alle Bots haben gesprochen - zeige UrgentPrompt
      setAllBotsFinished(true);
      setShowUrgentPrompt(true);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    setChatHistory(prev => [...prev, {
      id: Date.now(),
      type: "user",
      text: inputText.trim(),
      isComplete: true
    }]);
    
    // Reset urgent prompt nach User-Input
    setShowUrgentPrompt(false);
    setHasUserSentOpinion(true);
    
    onSend();
  };

  const getBotText = (seq: number): string | undefined => {
    if (activeBot === seq && currentTypingText !== undefined) {
      return currentTypingText;
    }
    return undefined;
  };

  const getBubbleLabel = (seq: number, _label: string): string => {
    if (completedTexts[seq]) {
      return completedTexts[seq];
    }
    return allBots[seq].description;
  };

  return (
    <div className="screen debate-screen">
      <ExitWarningModal 
        isOpen={showExitWarning} 
        onConfirm={handleExitConfirm} 
        onCancel={handleExitCancel} 
      />
      <div className="top-exit-row">
        <span className="timer-display">{introTime}</span>
        <div className="top-buttons-row">
          <MuteButton isMuted={isMuted} onToggle={toggleMute} />
          {hasStarted && !allBotsFinished && (isTyping || currentTypingText !== undefined) && (
            <button className="skip-btn" onClick={handleSkip}>
              Überspringen
            </button>
          )}
          <button className="exit-btn" onClick={handleExitClick}>
            Exit
          </button>
        </div>
      </div>

      <header className="screen-header">
        <p className="subtitleArgu">Jede Seite stellt nun ihre Hauptargumente vor</p>
      </header>

      {/* Chat-History - chronologisch */}
      <section className="debate-arguments">
        {chatHistory.map((msg) => (
          <div 
            key={msg.id} 
            className={`argument-box ${msg.type === "bot" ? `argument-${msg.color}` : "argument-user"}`}
          >
            <span className={msg.type === "bot" ? "argument-label" : "argument-text"}>
              {msg.text}
            </span>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </section>

      {/* Pro vs Contra stage */}
      <section className="debate-stage">
        <div className="arguments-stage">
          {/* Pro Side */}
          <div className="arguments-side pro-side">
            <div className="side-title">Pro</div>
            <div className="candidates-row">
              {proBots.map((bot, i) => {
                const seq = i;
                return (
                  <CandidateCard
                    key={i}
                    color={bot.color as "yellow" | "gray" | "red" | "green"}
                    hasMic={hasStarted && !allBotsFinished && activeBot === seq && currentTypingText !== undefined}
                    showBubble={hasStarted && (activeBot === seq || spokenBots.includes(seq))}
                    bubbleText={getBotText(seq)}
                    isTyping={hasStarted && isTyping && activeBot === seq}
                    bubbleLabel={getBubbleLabel(seq, bot.label)}
                    isSpeaking={hasStarted && !allBotsFinished && activeBot === seq && (isTyping || currentTypingText !== undefined)}
                  />
                );
              })}
            </div>
          </div>

          {/* Contra Side */}
          <div className="arguments-side contra-side">
            <div className="side-title">Contra</div>
            <div className="candidates-row">
              {contraBots.map((bot, i) => {
                const seq = proBots.length + i;
                return (
                  <CandidateCard
                    key={i}
                    color={bot.color as "yellow" | "gray" | "red" | "green"}
                    hasMic={hasStarted && !allBotsFinished && activeBot === seq && currentTypingText !== undefined}
                    showBubble={hasStarted && (activeBot === seq || spokenBots.includes(seq))}
                    bubbleText={getBotText(seq)}
                    isTyping={hasStarted && isTyping && activeBot === seq}
                    bubbleLabel={hasStarted ? getBubbleLabel(seq, bot.label) : ""}
                    isSpeaking={hasStarted && !allBotsFinished && activeBot === seq && (isTyping || currentTypingText !== undefined)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Modal Overlay für Start Debate nach User-Input */}
      {!hasStarted && hasUserSentOpinion && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal">
            <div className="modal-icon">🎙️</div>
            <h2 className="modal-title">Ready to start the debate?</h2>
            <p className="modal-text">You've shared your opinion. Now let the debate begin!</p>
            <button className="start-debate-btn" onClick={handleNextSpeaker}>
              Start Debate
            </button>
          </div>
        </div>
      )}

      {/* Overlay für User Input Prompt wenn alle Bots fertig sind */}
      {allBotsFinished && showUrgentPrompt && !hasUserSentOpinion && (
        <div className="urgent-prompt-overlay"></div>
      )}

      {/* Footer: Next Speaker Button ODER User Input */}
      {!allBotsFinished ? (
        <footer className="footer-end-row">
          <button className="con-primary-btn" onClick={handleNextSpeaker}>
            {!hasStarted ? "Start" : activeBot < totalBots - 1 ? "Nächster Sprecher" : "Weiter"}
          </button>
        </footer>
      ) : (
        <footer className="debate-input-footer active-input-footer">
          {/* Aufforderung zur Teilnahme */}
          <div className={`participation-prompt ${showUrgentPrompt ? "urgent" : ""}`}>
            {showUrgentPrompt ? (
              <span className="urgent-text">🎙️ Du bist dran! Teile deine Meinung zum Thema:</span>
            ) : (
              <span className="prompt-text">Deine Meinung ist gefragt:</span>
            )}
          </div>
          
          <div className="active-input-row">
            <div className="user-mic-icon">🎙️</div>
            <input
              className="text-input active-text-input"
              placeholder="Schreibe deine Meinung hier..."
              value={inputText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInputText(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button 
              className={"send-btn active-send-btn" + (inputText.trim() ? " active" : "")}
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
            >
              Senden
            </button>
          </div>
          
        </footer>
      )}
    </div>
  );
};

export default ActiveArgumentsIntro;