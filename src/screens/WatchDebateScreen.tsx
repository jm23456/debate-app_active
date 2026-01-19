import React, { useEffect, useRef, useState } from "react";
import CandidateCard from "../components/CandidateCard";
import MuteButton from "../components/MuteButton";
import ExitWarningModal from "../components/ExitWarningModal";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import type { BotColor } from "../hooks/useSpeechSynthesis";
import type { Role, ChatMessage } from "../types/types";
import { useLanguage } from '../hooks/useLanguage';
import "../App.css";

interface WatchDebateScreenProps {
  topicTitle: string;
  role: Role;
  timeLeft: string;
  onExit: () => void;
  hasStarted: boolean;
  onStart: () => void;
}

const WatchDebateScreen: React.FC<WatchDebateScreenProps> = ({
  timeLeft,
  onExit,
  hasStarted,
  onStart,
}) => {
  const { language } = useLanguage();
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string>("yellow");
  const [currentTypingText, setCurrentTypingText] = useState<string | undefined>(undefined);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const hasStartedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);
  const currentBubbleRef = useRef<{text: string, color: string, side: string} | null>(null);

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
  // A=red (Contra), B=yellow (Pro), C=green (Contra), D=gray (Pro)
  const argumentBubbles = [
    { color: "red", text: "Die Prämien sind die Folge der Kosten. Und die Kosten sind die Folge der Behandlungen. Je mehr Behandlungen anfallen, desto höher steigen die Kosten – und damit auch die Prämien.", side: "contra" },
    { color: "yellow", text: "So kann es tatsächlich nicht mehr weitergehen. Für viele Familien ist diese Prämienlast kaum mehr tragbar. Und man muss festhalten: Die Prämien sind stärker gestiegen als die eigentlichen Gesundheitskosten.", side: "pro" },
    { color: "green", text: "Wir sehen im Spital Patienten, die ihre Prämien kaum mehr bezahlen können. Gleichzeitig funktioniert der Gesundheitsmarkt wie ein Supermarkt: Man konsumiert Leistungen, ohne an der Kasse direkt zu bezahlen.", side: "contra" },
    { color: "gray", text: "Ökonomisch betrachtet ist das System nicht ausser Kontrolle. Der Anteil der Gesundheitskosten am Bruttoinlandprodukt liegt seit Jahren stabil bei rund zehn Prozent – ähnlich wie in vergleichbaren Ländern.", side: "pro" },
    { color: "red", text: "Trotzdem müssen wir handeln. Wenn rund 20 Prozent der Leistungen unnötig oder unwirtschaftlich sind, sprechen wir von sechs bis acht Milliarden Franken Sparpotenzial.", side: "contra" },
    { color: "green", text: "Das stimmt. Es gibt Operationen, die nicht nötig wären. Und es gibt Patienten, die so lange von Arzt zu Arzt gehen, bis jemand den Eingriff durchführt.", side: "contra" },
    { color: "yellow", text: "Die Lösung kann aber nicht sein, den Grundleistungskatalog zu kürzen. Das würde zu einer Zweiklassenmedizin führen – genau das darf nicht passieren.", side: "pro" },
    { color: "gray", text: "Nicht welche Leistungen es gibt, ist das Hauptproblem, sondern für wen sie eingesetzt werden. Pauschale Streichungen sind ineffizient – gezielte Steuerung wäre sinnvoller.", side: "pro" },
    { color: "red", text: "Das Kernproblem ist der Vertragszwang. Krankenkassen müssen jede verordnete Leistung bezahlen, egal ob sie sinnvoll ist oder nicht. Das treibt die Kosten massiv.", side: "contra" },
    { color: "green", text: "Zusätzlich fehlt ein Qualitätsanreiz. Ein Spital, das effizient arbeitet, wird gleich entschädigt wie eines, das Patienten länger behält oder unnötige Untersuchungen macht.", side: "contra" },
    { color: "yellow", text: "Darum braucht es staatliche Steuerung. Der Markt allein funktioniert hier nicht, weil Patienten medizinische Qualität kaum beurteilen können.", side: "pro" },
    { color: "gray", text: "Wir haben Qualitätsdaten – zu Sterblichkeit, Komplikationen und Infektionen. Das Problem ist, dass diese Daten kaum Konsequenzen haben, selbst bei grossen Unterschieden.", side: "pro" },
    { color: "red", text: "Gleichzeitig landen rund 80 Prozent der Notfälle im Spital, die dort gar nicht hingehören. Das verursacht enorme Kosten – hier braucht es mehr Eigenverantwortung.", side: "contra" },
    { color: "green", text: "Das ist oft kein böser Wille. Viele Menschen haben keinen Hausarzt oder wissen nicht, wohin sie sich wenden sollen. Also gehen sie ins Spital.", side: "contra" },
    { color: "yellow", text: "Darum müssen wir die Grundversorgung stärken: Hausärzte, Gemeinschaftspraxen und bessere Information. Der aufgeklärte Patient entscheidet oft vernünftiger.", side: "pro" },
    { color: "gray", text: "Langfristig treibt auch der Ausstattungswettbewerb zwischen Kantonen und Spitälern die Kosten – ohne echten Mehrwert für die Patienten.", side: "pro" },
    { color: "red", text: "Einigkeit besteht immerhin darin: Nicht weniger Medizin ist das Ziel, sondern weniger unnötige Medizin – und mehr Verantwortung auf allen Ebenen.", side: "contra" },
  ];

  // Chat-History - startet leer
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Typewriter-Effekt: Text Wort für Wort in der Chatbot-Bubble aufbauen
  const typewriterEffect = (text: string, color: string, side: string) => {
    const words = text.split(" ");
    let wordCount = 0;
    
    // Speichere aktuelle Bubble-Daten für Skip
    currentBubbleRef.current = { text, color, side };
    
    // Start mit leerem Text in der Bubble
    setCurrentTypingText("");
    
    // Starte Speech Synthesis mit Bot-spezifischer Stimme
    const botColor = color as BotColor;
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

  return (
    <div className="screen debate-screen">
      <ExitWarningModal 
        isOpen={showExitWarning} 
        onConfirm={handleExitConfirm} 
        onCancel={handleExitCancel} 
      />
      <div className="top-exit-row">
        <span className="timer-display">{timeLeft}</span>
        <div className="top-buttons-row">
          <MuteButton isMuted={isMuted} onToggle={toggleMute} />
          {hasStarted && currentTypingText !== undefined && (
            <button className="skip-btn" onClick={handleSkip}>
              Überspringen
            </button>
          )}
          <button className="exit-btn" onClick={handleExitClick}>
            Exit
          </button>
        </div>
      </div>

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
            {msg.type === "bot" && (
              <button 
                className="report-btn" 
                title="Diese Aussage als möglicherweise falsch oder irreführend melden"
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
      <section className="debate-stage">
        <div className="arguments-stage">
          <CandidateCard 
            color="yellow" 
            hasMic={hasStarted && currentSpeaker === "yellow" && visibleBubbles < argumentBubbles.length}
            isTyping={hasStarted && isTyping && currentSpeaker === "yellow"}
            bubbleText={hasStarted && currentSpeaker === "yellow" ? currentTypingText : undefined}
            isSpeaking={hasStarted && currentSpeaker === "yellow" && visibleBubbles < argumentBubbles.length}
            bubbleLabel="• Prämien sind für viele Familien kaum mehr tragbar.
• Lösung liegt in Solidarität, gezielter Entlastung und fairer Verteilung von Kosten.
• Nicht im Abbau von Leistungen."
          />
          <CandidateCard 
            color="gray" 
            hasMic={hasStarted && currentSpeaker === "gray" && visibleBubbles < argumentBubbles.length}
            isTyping={hasStarted && isTyping && currentSpeaker === "gray"}
            bubbleText={hasStarted && currentSpeaker === "gray" ? currentTypingText : undefined}
            isSpeaking={hasStarted && currentSpeaker === "gray" && visibleBubbles < argumentBubbles.length}
            bubbleLabel="• Keine aussergewöhnlich hohen Gesundheitskosten.
• Es braucht kein pauschales Sparen, sondern gezielte Eingriffe bei Überversorgungen und Ineffizienzen."
          />
          <CandidateCard 
            color="blue" 
            hasMic={hasStarted && currentSpeaker === "blue" && visibleBubbles < argumentBubbles.length}
            isTyping={hasStarted && isTyping && currentSpeaker === "blue"}
            bubbleText={hasStarted && currentSpeaker === "blue" ? currentTypingText : undefined}
            isSpeaking={hasStarted && currentSpeaker === "blue" && visibleBubbles < argumentBubbles.length}
            bubbleLabel="• Prämien steigen stärker als Löhne.
• Gefühl von Ineffizienz und unklarer Verantwortung.
• Erwartung: Nachvollziehbarer Umgang mit Beiträgen."
          />
          <CandidateCard 
            color="red" 
            hasMic={hasStarted && currentSpeaker === "red" && visibleBubbles < argumentBubbles.length}
            isTyping={hasStarted && isTyping && currentSpeaker === "red"}
            bubbleText={hasStarted && currentSpeaker === "red" ? currentTypingText : undefined}
            isSpeaking={hasStarted && currentSpeaker === "red" && visibleBubbles < argumentBubbles.length}
            bubbleLabel="• Steigende Prämien sind Folge von explodierenden Kosten durch immer mehr Behandlungen.
• Es braucht Steuerungsmöglichkeiten für Krankenkassen.
• Ziel: Prämien senken durch Kostenkontrolle."
          />
          <CandidateCard 
            color="green" 
            hasMic={hasStarted && currentSpeaker === "green" && visibleBubbles < argumentBubbles.length}
            isTyping={hasStarted && isTyping && currentSpeaker === "green"}
            bubbleText={hasStarted && currentSpeaker === "green" ? currentTypingText : undefined}
            isSpeaking={hasStarted && currentSpeaker === "green" && visibleBubbles < argumentBubbles.length}
            bubbleLabel="• Das System ist widersprüchlich: Hervorragende Medizin, aber oft zu viel davon.
• Es gibt unnötige Untersuchungen und Eingriffe, die weder Patienten noch dem System nützen."
          />
        </div>
      </section>
   
   {/* Continue Button */}
        <div className="footer-end-row">
          <button className="con-primary-btn" onClick={handleContinue}>
            {!hasStarted ? "Start Debate" : visibleBubbles < argumentBubbles.length ? "Continue" : "Finish Debate"}
          </button>
        </div>
    </div>
  );
};


export default WatchDebateScreen;