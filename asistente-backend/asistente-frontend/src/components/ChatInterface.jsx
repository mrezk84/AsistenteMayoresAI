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
  onNewConversation,
  userName = ''
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
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50/50 to-white">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-6 py-5 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl md:text-4xl">📘</span>
            {userName ? `Hola, ${userName.split(' ')[0]} 👋` : 'Asistente para Personas Mayores'}
          </h1>
          <p className="text-blue-100 mt-1 text-lg">
            {userName
              ? '¿En qué puedo ayudarte hoy?'
              : 'Haz tus preguntas, estaré encantado de ayudarte'
            }
          </p>
        </div>
        <button
          onClick={handleNewConversation}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-5 py-3 rounded-xl text-lg font-semibold transition-all flex items-center gap-2 border border-white/30 shadow-lg"
          aria-label="Nueva conversación"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nueva conversación</span>
        </button>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 pattern-bg">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-7xl md:text-8xl mb-6 animate-bounce">👋</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              ¡Hola! {userName ? `${userName.split(' ')[0]}` : ''} ¿En qué puedo ayudarte hoy?
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg max-w-lg border-2 border-blue-100">
              <p className="text-gray-600 text-lg mb-4">
                Puedes hacer preguntas sobre cualquier tema. Aquí tienes algunas ideas:
              </p>
              <div className="grid gap-3 text-left">
                <button
                  onClick={() => setInputValue('¿Qué tiempo hace hoy?')}
                  className="text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-blue-700"
                >
                  🌤️ ¿Qué tiempo hace hoy?
                </button>
                <button
                  onClick={() => setInputValue('Explícame cómo usar WhatsApp')}
                  className="text-left p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-green-700"
                >
                  📱 Explícame cómo usar WhatsApp
                </button>
                <button
                  onClick={() => setInputValue('¿Cuáles son las noticias de hoy?')}
                  className="text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-purple-700"
                >
                  📰 ¿Cuáles son las noticias de hoy?
                </button>
              </div>
            </div>
            <p className="text-gray-500 mt-6 text-lg">
              Escribe tu pregunta abajo o usa el botón del micrófono para hablar.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSpeak={handleSpeak}
                isSpeaking={isSpeaking}
              />
            ))}

            {/* Indicador de escritura mejorado */}
            {loading && (
              <div className="flex justify-start mb-4 fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    🤖
                  </div>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Área de input y controles */}
      <div className="bg-white border-t-2 border-gray-100 px-4 md:px-6 py-4 shadow-xl">
        <div className="max-w-4xl mx-auto">
          {/* Controles de voz - mobile first */}
          {isSpeechRecognitionSupported && (
            <div className="flex justify-center mb-4">
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
          )}

          {/* Input de mensaje */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta aquí..."
              className="flex-1 px-5 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
              disabled={loading}
              aria-label="Campo de texto para tu pregunta"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all flex items-center gap-2 min-w-[140px] justify-center shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
              aria-label="Enviar pregunta"
            >
              {loading ? (
                <>
                  <div className="loading"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar
                </>
              )}
            </button>
          </form>

          {/* Ayuda visual */}
          <p className="text-center text-gray-500 mt-3 text-base">
            💡 Presiona <kbd className="px-2 py-1 bg-gray-100 rounded-lg text-sm font-mono">Enter</kbd> para enviar • Usa el micrófono para hablar
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
