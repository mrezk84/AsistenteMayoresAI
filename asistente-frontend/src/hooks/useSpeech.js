import { useState, useEffect, useCallback, useRef } from 'react';
import { SPEECH_CONFIG, RECOGNITION_CONFIG, STORAGE_KEYS } from '../utils/constants';
import { useLocalStorage } from './useLocalStorage';

/**
 * Hook personalizado para manejar entrada y salida de voz
 * Soporta tanto síntesis (text-to-speech) como reconocimiento (speech-to-text)
 */
export function useSpeech() {
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage(STORAGE_KEYS.VOICE_ENABLED, true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState(null);

  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  // Inicializar síntesis de voz
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier habla pendiente al desmontar
      return () => {
        speechSynthesis.cancel();
      };
    }
  }, []);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = RECOGNITION_CONFIG.continuous;
      recognitionRef.current.interimResults = RECOGNITION_CONFIG.interimResults;
      recognitionRef.current.maxAlternatives = RECOGNITION_CONFIG.maxAlternatives;
      recognitionRef.current.lang = RECOGNITION_CONFIG.lang;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        setTranscript(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        setRecognitionError(event.error);
        setIsListening(false);
      };
    }
  }, []);

  /**
   * Hablar un texto en voz alta
   */
  const speak = useCallback((text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) {
      return;
    }

    // Cancelar cualquier habla anterior
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_CONFIG.lang;
    utterance.rate = SPEECH_CONFIG.rate;
    utterance.pitch = SPEECH_CONFIG.pitch;
    utterance.volume = SPEECH_CONFIG.volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  /**
   * Detener el habla actual
   */
  const cancelSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  /**
   * Iniciar el reconocimiento de voz
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setRecognitionError('El navegador no soporta reconocimiento de voz');
      return;
    }

    setTranscript('');
    recognitionRef.current.start();
  }, []);

  /**
   * Detener el reconocimiento de voz
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  /**
   * Alternar el estado de voz habilitada
   */
  const toggleVoice = useCallback(() => {
    setVoiceEnabled(!voiceEnabled);
  }, [voiceEnabled, setVoiceEnabled]);

  /**
   * Verificar si el navegador soporta reconocimiento de voz
   */
  const isSpeechRecognitionSupported = useCallback(() => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }, []);

  /**
   * Verificar si el navegador soporta síntesis de voz
   */
  const isSpeechSynthesisSupported = useCallback(() => {
    return 'speechSynthesis' in window;
  }, []);

  return {
    // Estado
    voiceEnabled,
    isSpeaking,
    isListening,
    transcript,
    recognitionError,

    // Acciones de síntesis (texto a voz)
    speak,
    cancelSpeech,
    toggleVoice,

    // Acciones de reconocimiento (voz a texto)
    startListening,
    stopListening,

    // Soporte del navegador
    isSpeechRecognitionSupported: isSpeechRecognitionSupported(),
    isSpeechSynthesisSupported: isSpeechSynthesisSupported(),
  };
}
