// Configuración de imágenes globales de la aplicación
export const IMAGES = {
  // Imagen de fondo principal - desde GitHub Releases
  BACKGROUND: "https://github.com/mrezk84/AsistenteMayoresAI/releases/download/v1.0.0-assets/Gemini_Generated_Image_cp0d9kcp0d9kcp0d.png",

  // Iconos y logos
  LOGO: "👋",
  BOT: "🤖",
  USER: "👤",
  SETTINGS: "⚙️",
  HISTORY: "📜",
  UPLOAD: "📁",
  LOCK: "🔐",
  KEY: "🔑",
  HELP: "❓",
};

// Estilos globales para el fondo
export const BACKGROUND_STYLES = {
  backgroundImage: `url(${IMAGES.BACKGROUND})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
};
