import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { IMAGES, BACKGROUND_STYLES } from '../config/images';

/**
 * Componente de layout principal con navegación
 * Proporciona una barra de navegación accesible
 * Con imagen de fondo personalizada y funcionalidades para adultos mayores
 */
function Layout({ children, user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await api.logout();
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={BACKGROUND_STYLES}>
      {/* Overlay suave para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Navegación principal */}
      <nav className="bg-white shadow-lg border-b border-blue-100" role="navigation" aria-label="Navegación principal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-6">
              {/* Logo/Título */}
              <Link to="/" className="flex items-center gap-3 text-xl md:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <span className="text-3xl md:text-4xl">📘</span>
                <span className="hidden sm:inline">Asistente Mayores</span>
              </Link>

              {/* Enlaces de navegación */}
              <div className="hidden md:flex gap-2">
                <Link
                  to="/"
                  className={`px-4 py-2.5 rounded-xl text-lg font-medium transition-all ${
                    isActive('/')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  aria-label="Ir al chat"
                >
                  💬 Chat
                </Link>
                <Link
                  to="/medication"
                  className={`px-4 py-2.5 rounded-xl text-lg font-medium transition-all ${
                    isActive('/medication')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  aria-label="Recordatorios de medicación"
                >
                  💊 Medicación
                </Link>
                <Link
                  to="/health"
                  className={`px-4 py-2.5 rounded-xl text-lg font-medium transition-all ${
                    isActive('/health')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  aria-label="Consejos de salud"
                >
                  🏥 Salud
                </Link>
                <Link
                  to="/music"
                  className={`px-4 py-2.5 rounded-xl text-lg font-medium transition-all ${
                    isActive('/music')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  aria-label="Música"
                >
                  🎵 Música
                </Link>
                <Link
                  to="/info"
                  className={`px-4 py-2.5 rounded-xl text-lg font-medium transition-all ${
                    isActive('/info')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  aria-label="Información útil"
                >
                  📚 Información
                </Link>
                <Link
                  to="/upload"
                  className={`px-4 py-2.5 rounded-xl text-lg font-medium transition-all ${
                    isActive('/upload')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  aria-label="Subir PDF"
                >
                  📄 PDF
                </Link>
                <Link
                  to="/history"
                  className={`px-4 py-2.5 rounded-xl text-lg font-medium transition-all ${
                    isActive('/history')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  aria-label="Ver historial"
                >
                  📋 Historial
                </Link>
                <Link
                  to="/settings"
                  className={`px-4 py-2.5 rounded-xl text-lg font-medium transition-all ${
                    isActive('/settings')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  aria-label="Configuración"
                >
                  ⚙️ Ajustes
                </Link>
              </div>
            </div>

            {/* Información de usuario y acciones */}
            <div className="flex items-center gap-4">
              {/* Saludo personalizado */}
              {user && (
                <div className="hidden lg:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                  <span className="text-2xl">👤</span>
                  <div className="text-left">
                    <p className="text-sm text-green-600">Hola,</p>
                    <p className="text-lg font-semibold text-green-800">{user.full_name}</p>
                  </div>
                </div>
              )}

              {/* Indicador de voz */}
              <div className="hidden md:flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl border border-purple-200">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span className="text-sm text-purple-700 font-medium">Voz activa</span>
              </div>

              {/* Botón de cerrar sesión */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-200"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Navegación móvil */}
          <div className="md:hidden grid grid-cols-4 gap-1 py-3 border-t border-gray-200 bg-white/90">
            <Link
              to="/"
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">💬</span>
              <span className="text-xs font-medium">Chat</span>
            </Link>
            <Link
              to="/medication"
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                isActive('/medication') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">💊</span>
              <span className="text-xs font-medium">Medicina</span>
            </Link>
            <Link
              to="/health"
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                isActive('/health') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">🏥</span>
              <span className="text-xs font-medium">Salud</span>
            </Link>
            <Link
              to="/music"
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                isActive('/music') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">🎵</span>
              <span className="text-xs font-medium">Música</span>
            </Link>
            <Link
              to="/info"
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                isActive('/info') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">📚</span>
              <span className="text-xs font-medium">Info</span>
            </Link>
            <Link
              to="/upload"
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                isActive('/upload') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">📄</span>
              <span className="text-xs font-medium">PDF</span>
            </Link>
            <Link
              to="/history"
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                isActive('/history') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">📋</span>
              <span className="text-xs font-medium">Historial</span>
            </Link>
            <Link
              to="/settings"
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                isActive('/settings') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">⚙️</span>
              <span className="text-xs font-medium">Ajustes</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg font-medium mb-1">Asistente para Personas Mayores</p>
          <p className="text-blue-100">Diseñado para ser fácil de usar • Si necesitas ayuda, presiona el botón del micrófono</p>
        </div>
      </footer>

      {/* Modal de confirmación de logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-6xl">👋</span>
              <h3 className="text-2xl font-bold text-gray-800 mt-4">¿Cerrar sesión?</h3>
              <p className="text-gray-600 mt-2 text-lg">Vas a salir de tu cuenta personal.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-lg font-semibold transition-colors"
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Layout;
