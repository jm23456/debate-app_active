import React, { useEffect, useRef, useState, useMemo } from "react";
import CandidateCard from "../components/CandidateCard";
import MuteButton from "../components/MuteButton";
import ExitWarningModal from "../components/ExitWarningModal";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import type { BotColor } from "../hooks/useSpeechSynthesis";
import type { Role, DebateMessage, ChatMessage } from "../types/types";
import "../App.css";
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../hooks/useLanguage';
import mockDebateDE from '../components/mockDebate.de.json';
import mockDebateEN from '../components/mockDebate.en.json';

interface DebateScreenProps {
  topicTitle: string;
  role: Role;
  messages: DebateMessage[];
  timeLeft: string;
  inputText: string;
  setInputText: (value: string) => void;
  onSend: () => void;
  onExit: () => void;
  hasStarted: boolean;
  onStart: () => void;
}

const DebateScreen: React.FC<DebateScreenProps> = ({
  topicTitle,
  timeLeft,
  inputText,
  setInputText,
  onSend,
  onExit,
  hasStarted,
  onStart,
}) => {
  type Color = "red" | "yellow" | "green" | "gray" | "blue";
  const { t, language } = useLanguage();
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<Color>("yellow");
  const [currentTypingText, setCurrentTypingText] = useState<string | undefined>(undefined);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const hasStartedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);
  const currentBubbleRef = useRef<{text: string, color: Color, side: "pro" | "contra" | "undecided"} | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTimeExpired, setShowTimeExpired] = useState(false);

  type SpeakerKey = "A" | "B" | "C" | "D" | "E" | "SYSTEM";

  type DebateScriptItem = {
    id: number;
    speaker: SpeakerKey;
    text: string;
  }

  type RoleData = {
    label?: string;
    description?: string;
    orientation?: "pro" | "contra" | "undecided";
  }

  type DebateData = {
    debate_script?: DebateScriptItem[];
    "Arguments Intro"?: DebateScriptItem[];
    roles?: Record<string, RoleData>;
  }

  // Timer abgelaufen Check
  useEffect(() => {
    if (timeLeft === "0:00" && hasStarted && !showTimeExpired) {
      setShowTimeExpired(true);
    }
  }, [timeLeft, hasStarted, showTimeExpired]);

  // Speech Synthesis
  const { isMuted, toggleMute, speak, stopSpeaking, getWordDuration } = useSpeechSynthesis();

  // Exit handlers
  const handleExitClick = () => {
    setShowExitWarning(true);
  };

  const handleExitConfirm = () => {
    setShowExitWarning(false);
    stopSpeaking();
    onExit();
  };

  const handleExitCancel = () => {
    setShowExitWarning(false);
  };

  // Skip function - überspringt nur den aktuellen Bot (stoppt Sprechen, zeigt vollen Text)
  const handleSkip = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    stopSpeaking();
    setIsSpeaking(false);
    
    // Zeige den vollständigen Text des aktuellen Bots an
    if (currentBubbleRef.current) {
      const { text, color, side } = currentBubbleRef.current;
      setCurrentTypingText(undefined);
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        type: "bot",
        color: color,
        text: text,
        side: side,
        isComplete: true
      }]);
      setVisibleBubbles(prev => prev + 1);
      currentBubbleRef.current = null;
    }
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

  // Auto-scroll zur neuesten Nachricht
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mock-Debatte: Krankenkassenprämien

  const debateData = (language === 'de' ? mockDebateDE : mockDebateEN) as DebateData;

  const speakerColors: Record<string, Color> = {
    A: "red",
    B: "yellow",
    C: "green",
    D: "gray",
    E: "blue",
  };

  const speakerToSide: Record < string, "pro" | "contra" | "undecided"> = {
    A: "contra",
    B: "pro",
    C: "contra",
    D: "pro",
    E: "undecided",
  };
  const debateScript = debateData.debate_script ?? [];
  const argumentsIntro = debateData["Arguments Intro"] ?? [];

  const argumentBubbles = useMemo(() => {
    return debateScript.map((msg) => ({
    color: speakerColors[msg.speaker as keyof typeof speakerColors],
    side: speakerToSide[msg.speaker as keyof typeof speakerToSide],
    text: msg.text,
  }));
}, [debateScript]);

  // Initiale Chat-History mit Arguments Intro Nachrichten
  // Reihenfolge: B, D, C, A, E (yellow, gray, blue, red, green)
  const speakerOrder: SpeakerKey[] = ["B", "D", "E", "A", "C"];
  const initialChatHistory: ChatMessage[] = useMemo(() => {
    const sortedIntro = [...argumentsIntro].sort((a, b) => {
      const indexA = speakerOrder.indexOf(a.speaker as SpeakerKey);
      const indexB = speakerOrder.indexOf(b.speaker as SpeakerKey);
      return indexA - indexB;
    });
    return sortedIntro.map((msg, index) => ({
      id: index + 1,
      type: "bot" as const,
      color: speakerColors[msg.speaker as keyof typeof speakerColors],
      text: msg.text,
      side: speakerToSide[msg.speaker as keyof typeof speakerToSide],
      isComplete: true,
      isIntro: true
    }));
  }, [argumentsIntro]);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Setze initiale chatHistory wenn noch leer
  useEffect(() => {
    if (chatHistory.length === 0 && initialChatHistory.length > 0) {
      setChatHistory(initialChatHistory);
    }
  }, [initialChatHistory]);

  // Typewriter-Effekt: Text Wort für Wort in der Chatbot-Bubble aufbauen
  const typewriterEffect = (text: string, color: Color, side: "pro" | "contra" | "undecided") => {
    const words = text.split(" ");
    let wordCount = 0;
    
    // Speichere aktuelle Bubble-Daten für Skip
    currentBubbleRef.current = { text, color, side };
    
    // Start mit leerem Text in der Bubble
    setCurrentTypingText("");
    
    // Starte Speech Synthesis mit Bot-spezifischer Stimme
    const botColor = color as BotColor;
    setIsSpeaking(true);
    speak(text, { botColor, lang: language });
    
    // Berechne Wort-Dauer basierend auf Sprechgeschwindigkeit
    const wordDuration = getWordDuration(text, botColor);
    
    typingIntervalRef.current = window.setInterval(() => {
      wordCount++;
      
      if (wordCount <= words.length) {
        // Text aus den ersten wordCount Wörtern
        const newText = words.slice(0, wordCount).join(" ");
        setCurrentTypingText(newText);
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        // Fertig! Füge zur Chat-History hinzu und lösche Bubble-Text
        setCurrentTypingText(undefined);
        currentBubbleRef.current = null;
        setIsSpeaking(false);
        setChatHistory(prev => [...prev, {
          id: Date.now(),
          type: "bot",
          color: color,
          text: text,
          side: side,
          isComplete: true
        }]);
        setVisibleBubbles(prev => prev + 1);
      }
    }, wordDuration);
  };

  // Starte automatisch die erste Nachricht beim Laden
  useEffect(() => {
    if(!hasStarted) return;
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      if (!argumentBubbles.length) return;
        const firstBubble = argumentBubbles[0];
      setCurrentSpeaker(firstBubble.color);
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        typewriterEffect(firstBubble.text, firstBubble.color, firstBubble.side);
      }, 1500);
    }
    
    return () => {
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted]);

  // Auto-scroll wenn sich chatHistory oder isTyping ändert
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

    const handleContinue = () => {
    if (!hasStarted) {
      onStart();
      return;
    }
    const isBusy = isTyping || currentTypingText !== undefined;

    if (visibleBubbles < argumentBubbles.length && !isBusy) {
      const nextBubble = argumentBubbles[visibleBubbles];
      setCurrentSpeaker(nextBubble.color);
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        typewriterEffect(nextBubble.text, nextBubble.color, nextBubble.side);
      }, 1500);
    } else if (visibleBubbles >= argumentBubbles.length && !isBusy) {
      onExit();
    }
  }


  const handleTimeExpiredContinue = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    stopSpeaking();
    setIsSpeaking(false);
    setIsTyping(false);
    setCurrentTypingText(undefined);
    currentBubbleRef.current = null;
    onExit();
  }
  // User-Nachricht senden und in Chat-History einfügen
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    setChatHistory(prev => [...prev, {
      id: Date.now(),
      type: "user",
      text: inputText.trim(),
      isComplete: true
    }]);
    
    onSend();
  };

  return (
    <div className="screen debate-screen">
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
            <p className="modal-text">{t("timeExpiredFinish")}</p>
            <button className="start-debate-btn" onClick={() => {setShowTimeExpired(false); handleTimeExpiredContinue();}}>
              {t("continue")}
            </button>
          </div>
        </div>
      )}
      <div className="top-exit-row">
        <span className="timer-display">{timeLeft}</span>
        <div className="top-buttons-row">
          <MuteButton isMuted={isMuted} onToggle={toggleMute} />
          <button className="exit-btn" onClick={handleExitClick}>
            {t("exit")}
          </button>
        </div>
      </div>

      <header className="screen-header" style={{marginBottom: "10px"}}>
        <p className="subtitle">{topicTitle}</p>
      </header>

      {/* Chat-History - chronologisch */}
      <section className="debate-arguments">
        {chatHistory.map((msg) => (
          <div 
            key={msg.id} 
            className={`argument-box ${msg.type === "bot" ? `argument-${msg.color}` : "argument-user"}${msg.isIntro ? " argument-intro" : ""}`}
          >
            {msg.isIntro && <span className="intro-label">Intro</span>}
            <span className={msg.type === "bot" ? "argument-label" : "argument-text"}>
              {msg.text}
            </span>
            {msg.type === "bot" && (
              <button 
                className="report-btn" 
                title={t("flag")}
                onClick={() => alert(`Nachricht gemeldet`)}
              >
                ⚠️
              </button>
            )}
          </div>
        ))}
        
        {/* Auto-scroll Anker */}
        <div ref={messagesEndRef} />
      </section>

      {/* Pro vs Contra stage */}
      <section className="debate-stage" style={{
        borderRadius: "24px",
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
          <CandidateCard 
            color="yellow" 
            hasMic={hasStarted && currentSpeaker === "yellow" && (isTyping || isSpeaking) && visibleBubbles < argumentBubbles.length}
            isTyping={hasStarted && isTyping && currentSpeaker === "yellow"}
            bubbleText={hasStarted && currentSpeaker === "yellow" ? currentTypingText : undefined}
            isSpeaking={hasStarted && currentSpeaker === "yellow" && isSpeaking && visibleBubbles < argumentBubbles.length}
            bubbleLabel="• Prämien sind für Viele kaum mehr tragbar.
• Lösung liegt in Solidarität, gezielter Entlastung und fairer Verteilung von Kosten.
• Nicht im Abbau von Leistungen."
          />
          <CandidateCard 
            color="gray" 
            hasMic={hasStarted && currentSpeaker === "gray" && (isTyping || isSpeaking)&& visibleBubbles < argumentBubbles.length}
            isTyping={hasStarted && isTyping && currentSpeaker === "gray"}
            bubbleText={hasStarted && currentSpeaker === "gray" ? currentTypingText : undefined}
            isSpeaking={hasStarted && currentSpeaker === "gray" && isSpeaking && visibleBubbles < argumentBubbles.length}
            bubbleLabel="• Keine aussergewöhnlich hohen Gesundheitskosten.
                          • Es braucht kein pauschales Sparen, sondern gezielte Eingriffe bei Überversorgungen und Ineffizienzen."
          />
          <CandidateCard 
            color="blue" 
            hasMic={hasStarted && currentSpeaker === "blue" && (isTyping || isSpeaking) && visibleBubbles < argumentBubbles.length}
            isTyping={hasStarted && isTyping && currentSpeaker === "blue"}
            bubbleText={hasStarted && currentSpeaker === "blue" ? currentTypingText : undefined}
            isSpeaking={hasStarted && currentSpeaker === "blue" && isSpeaking && visibleBubbles < argumentBubbles.length}
            bubbleLabel="• Prämien steigen stärker als Löhne.
• Gefühl von Ineffizienz und unklarer Verantwortung.
• Erwartung: Nachvollziehbarer Umgang mit Beiträgen."
          />
          <CandidateCard 
            color="red" 
            hasMic={hasStarted && currentSpeaker === "red" && (isTyping || isSpeaking) && visibleBubbles < argumentBubbles.length}
            isTyping={hasStarted && isTyping && currentSpeaker === "red"}
            bubbleText={hasStarted && currentSpeaker === "red" ? currentTypingText : undefined}
            isSpeaking={hasStarted && currentSpeaker === "red" && isSpeaking && visibleBubbles < argumentBubbles.length}
            bubbleLabel="• Steigende Prämien sind Folge von explodierenden Kosten durch immer mehr Behandlungen.
• Es braucht Steuerungsmöglichkeiten für Krankenkassen.
• Ziel: Prämien senken durch Kostenkontrolle."
          />
          <CandidateCard 
            color="green" 
            hasMic={hasStarted && currentSpeaker === "green" && (isTyping || isSpeaking) && visibleBubbles < argumentBubbles.length}
            isTyping={hasStarted && isTyping && currentSpeaker === "green"}
            bubbleText={hasStarted && currentSpeaker === "green" ? currentTypingText : undefined}
            isSpeaking={hasStarted && currentSpeaker === "green" && isSpeaking && visibleBubbles < argumentBubbles.length}
            bubbleLabel="• Das System ist widersprüchlich: Hervorragende Medizin, aber oft zu viel davon.
• Es gibt unnötige Untersuchungen und Eingriffe, die weder Patienten noch dem System nützen."
          />
        </div>
      </section>

      {/* Modal Overlay für Start Debate */}
      {!hasStarted && (
        <div className="start-debate-modal-overlay">
          <div className="start-debate-modal">
            <div className="modal-icon">🎙️</div>
            <h2 className="modal-title">{t("ready")}</h2>
            <p className="modal-text">{t("readyText")}</p>
            <button className="start-debate-btn" onClick={onStart}>
              {t("startDebate")}
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <footer className="debate-input-footer">
        <div className="custom-topic-row">
          <input
            className="text-input flex-1"
            placeholder={t("inputPlaceholder")}
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
            className={"send-btn" + (inputText.trim() ? " active" : "")}
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
          >
            {t("send")}
          </button>
        </div>
        {hasStarted && (
          <div className="action-row">
            <button 
              className="con-primary-btn" 
              onClick={handleContinue}
              disabled={isTyping || currentTypingText !== undefined}
            >
              {visibleBubbles < argumentBubbles.length ? t("continue") : t("finishDebate")}
            </button>
            {(isTyping || currentTypingText !== undefined) ? (
              <button 
                className="skip-icon-btn" 
                onClick={handleSkip}
                title="Skip current speaker"
              >
                ⏭
              </button> 
            ) : (
              <div className="skip-icon-placeholder"></div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
};


export default DebateScreen;