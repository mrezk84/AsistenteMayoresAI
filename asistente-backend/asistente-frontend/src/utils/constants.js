// Configuración de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configuración de voz
export const SPEECH_CONFIG = {
  lang: 'es-ES',
  rate: 0.9,  // Velocidad (0.1 a 1)
  pitch: 1,    // Tono (0 a 2)
  volume: 1    // Volumen (0 a 1)
};

// Configuración de reconocimiento de voz
export const RECOGNITION_CONFIG = {
  lang: 'es-ES',
  continuous: false,
  interimResults: false,
  maxAlternatives: 1
};

// Claves para localStorage
export const STORAGE_KEYS = {
  DEVICE_ID: 'asistente_device_id',
  VOICE_ENABLED: 'asistente_voice_enabled',
  CURRENT_CONVERSATION: 'asistente_current_conversation',
  USER_PREFERENCES: 'asistente_user_preferences'
};
