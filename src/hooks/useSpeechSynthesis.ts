import { useState, useEffect, useRef, useCallback } from 'react';

// Bot-Farben zu Stimm-Eigenschaften zuordnen
export type BotColor = 'red' | 'yellow' | 'green' | 'gray';

interface VoiceConfig {
  pitch: number;
  rate: number;
  voiceType: 'male' | 'female';
}

// Verschiedene Stimm-Konfigurationen für jeden Bot
const voiceConfigs: Record<BotColor, VoiceConfig> = {
  red: { pitch: 1.2, rate: 1.2, voiceType: 'female' },      // Tiefe männliche Stimme
  yellow: { pitch: 0.8, rate: 1.3, voiceType: 'male' },  // Höhere weibliche Stimme
  green: { pitch: 1.1, rate: 1.4, voiceType: 'male' },     // Neutrale männliche Stimme
  gray: { pitch: 1.1, rate: 1.3, voiceType: 'female' },   // Leicht höhere weibliche Stimme
};

interface SpeakOptions {
  botColor?: BotColor;
  onWordSpoken?: (wordIndex: number) => void;
}

interface UseSpeechSynthesisReturn {
  isMuted: boolean;
  toggleMute: () => void;
  speak: (text: string, options?: SpeakOptions) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  getWordDuration: (text: string, botColor?: BotColor) => number;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenTextRef = useRef<string>('');

  // Lade Stimmen wenn verfügbar
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Finde passende Stimme basierend auf Konfiguration
  const getVoiceForBot = useCallback((botColor: BotColor): SpeechSynthesisVoice | null => {
    const config = voiceConfigs[botColor];
    
    // Deutsche Stimmen filtern
    const germanVoices = voices.filter(v => v.lang.startsWith('de'));
    
    if (germanVoices.length === 0) return null;

    // Versuche passende Stimme zu finden (männlich/weiblich)
    if (config.voiceType === 'male') {
      const maleVoice = germanVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('mann') ||
        v.name.toLowerCase().includes('martin') ||
        v.name.toLowerCase().includes('hans') ||
        v.name.toLowerCase().includes('daniel')
      );
      if (maleVoice) return maleVoice;
    } else {
      const femaleVoice = germanVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('frau') ||
        v.name.toLowerCase().includes('anna') ||
        v.name.toLowerCase().includes('petra') ||
        v.name.toLowerCase().includes('helena')
      );
      if (femaleVoice) return femaleVoice;
    }

    // Fallback: Verschiedene Stimmen für verschiedene Bots verwenden
    const colorIndex = { red: 0, yellow: 1, green: 2, gray: 3 };
    const index = colorIndex[botColor] % germanVoices.length;
    return germanVoices[index] || germanVoices[0];
  }, [voices]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return !prev;
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    lastSpokenTextRef.current = '';
  }, []);

  // Berechne durchschnittliche Wort-Dauer basierend auf Sprechgeschwindigkeit
  const getWordDuration = useCallback((_text: string, botColor: BotColor = 'yellow'): number => {
    const config = voiceConfigs[botColor];
    
    // Basis: ~300ms pro Wort bei Rate 1.0, angepasst an Bot-Rate
    const baseWordDuration = 300;
    const adjustedDuration = baseWordDuration / config.rate;
    
    // Dauer pro Wort für Typewriter
    return Math.round(adjustedDuration);
  }, []);

  const speak = useCallback((text: string, options: SpeakOptions = {}) => {
    if (isMuted || !text.trim()) return;
    
    const botColor = options.botColor || 'yellow';
    
    // Nur sprechen wenn neuer Text
    if (text === lastSpokenTextRef.current) return;
    
    window.speechSynthesis.cancel();
    lastSpokenTextRef.current = text;
    
    const config = voiceConfigs[botColor];
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = 'de-DE';
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = 1;

    // Stimme für diesen Bot auswählen
    const voice = getVoiceForBot(botColor);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Word boundary events für Synchronisation
    if (options.onWordSpoken) {
      let wordIndex = 0;
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          options.onWordSpoken?.(wordIndex);
          wordIndex++;
        }
      };
    }

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isMuted, getVoiceForBot]);

  return {
    isMuted,
    toggleMute,
    speak,
    stopSpeaking,
    isSpeaking,
    getWordDuration
  };
};

export default useSpeechSynthesis;
