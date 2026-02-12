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
    <div className="flex flex-col gap-3">
      {/* Botón para activar/desactivar voz de salida */}
      <button
        onClick={onToggleVoice}
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium transition-all ${
          voiceEnabled
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
      >
        {/* Icono de altavoz */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {voiceEnabled ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          ) : (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </>
          )}
        </svg>
        <span>{voiceEnabled ? 'Voz activada' : 'Voz desactivada'}</span>
      </button>

      {/* Botón de micrófono para entrada de voz */}
      {isSpeechRecognitionSupported && (
        <button
          onClick={handleMicClick}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label={isListening ? 'Detener grabación' : 'Hablar por micrófono'}
        >
          {/* Icono de micrófono */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <span>{isListening ? 'Escuchando...' : 'Hablar'}</span>
        </button>
      )}

      {/* Indicador de transcripción */}
      {transcript && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-sm text-blue-800 mb-1">Dicen:</p>
          <p className="text-base text-gray-800 italic">"{transcript}"</p>
        </div>
      )}
    </div>
  );
}

export default VoiceControls;
