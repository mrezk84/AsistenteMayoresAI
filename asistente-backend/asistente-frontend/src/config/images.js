// Configuración de imágenes globales de la aplicación
export const IMAGES = {
  // Imagen de fondo principal - desde GitHub Releases (la que subiste)
  BACKGROUND: "https://github.com/mrezk84/AsistenteMayoresAI/releases/download/v1.0.0-assets/IMG_7689.PNG",

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
  backgroundColor: '#f0f4f8', // Color de fondo mientras carga la imagen
};
