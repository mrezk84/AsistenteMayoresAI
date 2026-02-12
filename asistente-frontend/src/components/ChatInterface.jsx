import React, { useState, useRef, useEffect } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import ChatMessage from './ChatMessage';
import VoiceControls from './VoiceControls';

/**
 * Componente principal de la interfaz de chat
 * Muestra el historial de mensajes y el input para enviar mensajes
 */
function ChatInterface({
  messages = [],
  loading = false,
  onSendMessage,
  onNewConversation
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    voiceEnabled,
    isSpeaking,
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleVoice,
    speak,
    isSpeechRecognitionSupported
  } = useSpeech();

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enfocar el input al montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Procesar la transcripción cuando se detiene la escucha
  useEffect(() => {
    if (transcript && !isListening) {
      setInputValue(transcript);
      inputRef.current?.focus();
    }
  }, [transcript, isListening]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || loading) {
      return;
    }

    const messageToSend = inputValue;
    setInputValue('');

    if (onSendMessage) {
      const response = await onSendMessage(messageToSend);

      // Leer la respuesta en voz alta si la voz está activada
      if (response && voiceEnabled) {
        speak(response);
      }
    }
  };

  const handleSpeak = (text) => {
    speak(text);
  };

  const handleNewConversation = () => {
    if (onNewConversation) {
      onNewConversation();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            📘 Asistente para Personas Mayores
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Haz tus preguntas, estaré encantado de ayudarte
          </p>
        </div>
        <button
          onClick={handleNewConversation}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-base font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
          aria-label="Nueva conversación"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva conversación
        </button>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              ¡Hola! ¿En qué puedo ayudarte hoy?
            </h2>
            <p className="text-gray-500 max-w-md">
              Escribe tu pregunta abajo o usa el botón del micrófono para hablar.
              También puedes subir un manual para hacer preguntas sobre su contenido.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSpeak={handleSpeak}
                isSpeaking={isSpeaking}
              />
            ))}

            {/* Indicador de escritura */}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Área de input y controles */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-4">
          {/* Input de mensaje */}
          <form onSubmit={handleSubmit} className="flex-1 flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta aquí..."
              className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={loading}
              aria-label="Campo de texto para tu pregunta"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="bg-green-600 text-white px-6 py-3 rounded-xl text-base font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2 min-w-[120px] justify-center"
              aria-label="Enviar pregunta"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar
                </>
              )}
            </button>
          </form>

          {/* Controles de voz */}
          <div className="flex flex-col gap-2">
            <VoiceControls
              voiceEnabled={voiceEnabled}
              onToggleVoice={toggleVoice}
              isListening={isListening}
              onStartListening={startListening}
              onStopListening={stopListening}
              transcript={transcript}
              onTranscriptChange={setInputValue}
              isSpeechRecognitionSupported={isSpeechRecognitionSupported}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
