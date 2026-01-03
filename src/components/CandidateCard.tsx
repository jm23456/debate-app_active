import React, { useState, useRef, useEffect } from "react";

interface CandidateCardProps {
  color: "yellow" | "gray" | "green" | "red";
  hasMic?: boolean;
  showBubble?: boolean;
  bubbleText?: string;
  isTyping?: boolean;
  bubbleLabel?: string;
  isSpeaking?: boolean;
}


const CandidateCard: React.FC<CandidateCardProps> = ({ color, hasMic = false, showBubble = false, bubbleText, isTyping = false, bubbleLabel = "Introduction", isSpeaking = false }) => {
  const [hovered, setHovered] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubbleVisible = showBubble || hovered || bubbleText !== undefined || isTyping;
  
  // Auto-scroll nach unten wenn Text sich ändert
  useEffect(() => {
    if (bubbleRef.current && bubbleText !== undefined) {
      bubbleRef.current.scrollTop = bubbleRef.current.scrollHeight;
    }
  }, [bubbleText]);
  
  return (
    <div className={`candidate-card candidate-${color}${isSpeaking ? " speaking" : ""}`}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    >
      {bubbleVisible && (
        <div className="candidate-speech-bubble" ref={bubbleRef} style={{ whiteSpace: 'pre-line' }}>
          {isTyping ? (
            <span className="typing-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          ) : bubbleText !== undefined ? (
            <span>{bubbleText}<span className="cursor">|</span></span>
          ) : (
            <span>{bubbleLabel}</span>
          )}
        </div>
      )}
      <div className={`candidate-robot ${hasMic ? "has-mic" : ""}`}>
        <span className="robot-icon">🤖</span>
        {hasMic && <span className="mic-icon">🎙️</span>}
      </div>
      <div className="candidate-podium">
        <div className="podium-modern">
          <div className="podium-modern-top"></div>
          <div className="podium-modern-stand"></div>
          <div className="podium-modern-base"></div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;