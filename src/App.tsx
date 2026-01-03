import React, { useState, useEffect } from "react";
import "./App.css";

import type { Step, Role, DebateMessage } from "./types/types";

import RoleSelection from "./screens/RoleSelection";
import TopicIntro from "./screens/TopicIntro"
{/*import CandidatesIntro from "./screens/CandidatesIntro";*/}
import ArgumentsIntro from "./screens/ArgumentsIntro";
import ActiveDebateScreen from "./screens/ActiveDebateScreen";
import ActiveArgumentsIntro from "./screens/ActiveArgumentsIntro";
import DebateScreen from "./screens/DebateScreen";
import WatchDebateScreen from "./screens/WatchDebateScreen";
import Summary from "./screens/Summary";


const STEPS: Record<string, Step> = {
  TOPIC: "TOPIC",
  ROLE: "ROLE",
  TOPIC_INTRO: "TOPIC_INTRO",
  CANDIDATES_INTRO: "CANDIDATES_INTRO",
  ARGUMENTS_INTRO: "ARGUMENTS_INTRO",
  ACTIVE_ARGUMENTS_INTRO: "ACTIVE_ARGUMENTS_INTRO",
  DEBATE: "DEBATE",
  SUMMARY: "SUMMARY",
};

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(STEPS.ROLE);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [customTopic, setCustomTopic] = useState<string>("");
  const [role, setRole] = useState<Role>(null);
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([
    { id: 1, side: "Contra", text: "Introduction" },
    { id: 2, side: "Pro", text: "Introduction" },
    { id: 3, side: "Contra", text: "Introduction" },
    { id: 4, side: "Pro", text: "Introduction" },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15:00
  const [introTime, setIntroTime] = useState<number>(1 * 60); // 1:00
  const resetIntroTimer = () => setIntroTime(1 * 60); // Reset auf 1 Minute
  const [activeBot, setActiveBot] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Timer für ARGUMENTS_INTRO (1 Min pro Speaker)
  useEffect(() => {
    if (!hasStarted) return;
    if (step !== STEPS.ARGUMENTS_INTRO) return;
    const id = window.setInterval(() => {
      setIntroTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [step, hasStarted]);

  // Timer für DEBATE (15 Min)
  useEffect(() => {
    if (step !== STEPS.DEBATE) return;
    if (!hasStarted) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [step, hasStarted]);


  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: DebateMessage = {
      id: Date.now(),
      side: "You",
      text: inputText.trim(),
    };
    setDebateMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  const currentTopicTitle = customTopic.trim() || selectedTopic;

  return (
    <div className="app-root">
      <div className="app-card">
        {step === STEPS.ROLE && (
          <RoleSelection
            role={role}
            setRole={setRole}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            customTopic={customTopic}
            setCustomTopic={setCustomTopic}
            onContinue={() => setStep(STEPS.TOPIC_INTRO)}
          />
        )}

        {step === STEPS.TOPIC_INTRO && (
          <TopicIntro
            topicTitle={currentTopicTitle}
            onNext={() => {
              if (role === "ACTIVE") {
                setStep(STEPS.ACTIVE_ARGUMENTS_INTRO);
              } else {
                setStep(STEPS.ARGUMENTS_INTRO);
              }
            }}
            onExit={() => {
              setStep(STEPS.SUMMARY);
              setCustomTopic("");
              setSelectedTopic("");
            }}
          />
        )}

        {/*{step === STEPS.CANDIDATES_INTRO && (
          <CandidatesIntro
            onNext={() => setStep(STEPS.ARGUMENTS_INTRO)}
            onExit={() => {
              setStep(STEPS.SUMMARY);
              setCustomTopic("");
              setSelectedTopic("");
            }}
            activeBot={activeBot}
            setActiveBot={setActiveBot}
            totalBots={4}
            onContinue={resetIntroTimer}
            onFinalContinue={() => {
              if (role === "ACTIVE") {
                setStep(STEPS.ACTIVE_ARGUMENTS_INTRO);
              } else {
                setStep(STEPS.ARGUMENTS_INTRO);
              }
              setHasStarted(false);
            }}
            hasStarted={hasStarted}
            onStart={() => {
              setHasStarted(true);
              setIntroTime(1 * 60);
              setActiveBot(0);}}
          />
        )}*/}

        {step === STEPS.ARGUMENTS_INTRO && (
          <ArgumentsIntro
            topicTitle={currentTopicTitle}
            onExit={() => { 
              setStep(STEPS.SUMMARY);
              setIntroTime(1 * 60);
              setActiveBot(0);
              setHasStarted(false);
              setCustomTopic("");
              setSelectedTopic("");
            }}
            introTime={formatTime(introTime)}
            activeBot={activeBot}
            setActiveBot={setActiveBot}
            totalBots={4}
            onContinue={resetIntroTimer}
            onFinalContinue={() => {
              setStep(STEPS.DEBATE);
              setHasStarted(false);
            }}
            hasStarted={hasStarted}
            onStart={() => {
              setHasStarted(true);
              setIntroTime(1 * 60);
              setActiveBot(0);}}
          />
        )}

        {step === STEPS.ACTIVE_ARGUMENTS_INTRO && (
          <ActiveArgumentsIntro
            topicTitle={currentTopicTitle}
            introTime={formatTime(introTime)}
            onExit={() => { 
              setStep(STEPS.SUMMARY);
              setIntroTime(1 * 60);
              setHasStarted(false);
              setCustomTopic("");
              setSelectedTopic("");
            }}
            inputText={inputText}
            setInputText={setInputText}
            onSend={() => {
              handleSend();
              setStep(STEPS.DEBATE);
              setHasStarted(false);
            }}
            hasStarted={hasStarted}
            onStart={() => {
              setHasStarted(true);
              setIntroTime(1 * 60);
              setActiveBot(0);
            }}
          />
        )}


        {step === STEPS.DEBATE && role === "ACTIVE" && (
          <ActiveDebateScreen
            topicTitle={currentTopicTitle}
            timeLeft={formatTime(timeLeft)}
            inputText={inputText}
            setInputText={setInputText}
            onSend={handleSend}
            onExit={() => {
              setStep(STEPS.SUMMARY);
              setIntroTime(1 * 60);
              setCustomTopic("");
              setSelectedTopic("");
            }}
            hasStarted={hasStarted}
            onStart={() => {
              setHasStarted(true);
              setTimeLeft(15 * 60);
              setActiveBot(0);
            }}
          />
        )}

        {step === STEPS.DEBATE && role === "WATCH" && (
          <WatchDebateScreen
            topicTitle={currentTopicTitle}
            role={role}
            timeLeft={formatTime(timeLeft)}
            onExit={() => {
              setStep(STEPS.SUMMARY);
              setIntroTime(1 * 60);
              setTimeLeft(15 * 60);
              setCustomTopic("");
              setSelectedTopic("");
            }}
            hasStarted={hasStarted}
            onStart={() => {
              setHasStarted(true);
              setTimeLeft(15 * 60);
              setActiveBot(0);}}
          />
        )}

        {step === STEPS.DEBATE && role === "COMMENT" && (
          <DebateScreen
            topicTitle={currentTopicTitle}
            role={role}
            messages={debateMessages}
            timeLeft={formatTime(timeLeft)}
            inputText={inputText}
            setInputText={setInputText}
            onSend={handleSend}
            onExit={() => {
              setStep(STEPS.SUMMARY);
              setIntroTime(1 * 60);
              setTimeLeft(15 * 60);
              setCustomTopic("");
              setSelectedTopic("");
            }}
            hasStarted={hasStarted}
            onStart={() => {
              setHasStarted(true);
              setTimeLeft(15 * 60);
              setActiveBot(0);}}
          />
        )}

        {step === STEPS.SUMMARY && (
          <Summary
            topicTitle={currentTopicTitle}
            onStartAnother={() => {
              setRole(null);
              setStep(STEPS.ROLE);
            }}
          />
        )}
      </div>
    </div>
  );
};


export default App;