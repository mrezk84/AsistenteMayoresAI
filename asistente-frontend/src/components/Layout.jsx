import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import InteractiveBackground from './InteractiveBackground';

/**
 * Componente de layout principal con navegación
 * Proporciona una barra de navegación accesible
 */
function Layout({ children }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fondo interactivo animado */}
      <InteractiveBackground />

      {/* Navegación principal */}
      <nav className="bg-white/80 backdrop-blur-md shadow-md border-b border-blue-100 relative z-10" role="navigation" aria-label="Navegación principal">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo/Título */}
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <span className="text-2xl">📘</span>
                <span className="hidden sm:inline">Asistente Mayores</span>
              </Link>

              {/* Enlaces de navegación */}
              <div className="flex gap-2">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${isActive('/')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  aria-label="Ir al chat"
                >
                  💬 Chat
                </Link>
                <Link
                  to="/upload"
                  className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${isActive('/upload')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  aria-label="Subir PDF"
                >
                  📄 Subir PDF
                </Link>
                <Link
                  to="/history"
                  className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${isActive('/history')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  aria-label="Ver historial"
                >
                  📋 Historial
                </Link>
              </div>
            </div>

            {/* Información de accesibilidad */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>Voz activada</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-blue-100 py-4 mt-auto relative z-10">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Asistente para Personas Mayores - Diseñado para ser fácil de usar</p>
          <p className="mt-1">Si necesitas ayuda, presiona el botón del micrófono para hablar</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
