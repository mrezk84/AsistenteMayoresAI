import React from 'react';

/**
 * Componente que muestra un mensaje individual del chat
 * Soporta mensajes de usuario y del asistente
 */
function ChatMessage({ message, onSpeak, isSpeaking }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Formatear la hora del mensaje
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 fade-in-up`}
    >
      {/* Avatar del asistente (solo para mensajes del asistente) */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg">
            🤖
          </div>
        </div>
      )}

      {/* Contenedor del mensaje */}
      <div
        className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`}
      >
        {/* Header del mensaje con rol y hora */}
        <div className={`flex items-center gap-3 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-sm font-semibold ${
            isUser ? 'text-blue-100' : 'text-gray-600'
          }`}>
            {isUser ? '👤 Tú' : '🤖 Asistente'}
          </span>
          <span className={`text-xs ${
            isUser ? 'text-blue-200' : 'text-gray-400'
          }`}>
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Contenido del mensaje */}
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Botón para leer en voz alta (solo para respuestas del asistente) */}
        {isAssistant && onSpeak && (
          <button
            onClick={() => onSpeak(message.content)}
            className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-base font-medium transition-all ${
              isSpeaking
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'
            }`}
            aria-label="Leer respuesta en voz alta"
            disabled={isSpeaking}
          >
            {isSpeaking ? (
              <>
                <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.06 5.5 5.5 0 010 7.78.75.75 0 001.06 1.06 7 7 0 000-9.9z" />
                  <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
                </svg>
                Leyendo...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Escuchar respuesta
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
