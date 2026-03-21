import React from 'react';

/**
 * Componente con controles de voz (micrófono y configuración)
 * Permite activar/desactivar voz y usar entrada por micrófono
 */
function VoiceControls({
  voiceEnabled,
  onToggleVoice,
  isListening,
  onStartListening,
  onStopListening,
  transcript,
  onTranscriptChange,
  isSpeechRecognitionSupported
}) {
  const handleMicClick = () => {
    if (isListening) {
      onStopListening();
      if (transcript && onTranscriptChange) {
        onTranscriptChange(transcript);
      }
    } else {
      onStartListening();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Botón de micrófono para entrada de voz */}
      {isSpeechRecognitionSupported && (
        <button
          onClick={handleMicClick}
          className={`mic-button relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform hover:scale-110 active:scale-95 ${
            isListening
              ? 'bg-gradient-to-br from-red-500 to-red-600 listening'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
          }`}
          aria-label={isListening ? 'Detener grabación' : 'Hablar por micrófono'}
        >
          {isListening ? (
            <>
              <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </>
          ) : (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      )}

      {/* Botón para activar/desactivar voz de salida */}
      <button
        onClick={onToggleVoice}
        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-medium transition-all shadow-md ${
          voiceEnabled
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {voiceEnabled ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </>
          )}
        </svg>
        <span>{voiceEnabled ? '🔊 Voz ON' : '🔇 Voz OFF'}</span>
      </button>

      {/* Indicador de transcripción */}
      {transcript && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 max-w-md animate-pulse-slow">
          <p className="text-sm text-blue-700 font-semibold mb-1 flex items-center gap-2">
            <span className="text-lg">🎤</span> Escuchando:
          </p>
          <p className="text-lg text-gray-800">"{transcript}"</p>
        </div>
      )}

      {/* Texto de ayuda */}
      {!isListening && !transcript && (
        <p className="text-sm text-gray-500 text-center">
          {isSpeechRecognitionSupported
            ? 'Toca el micrófono para hablar'
            : 'Tu navegador no soporta voz'
          }
        </p>
      )}
    </div>
  );
}

export default VoiceControls;
