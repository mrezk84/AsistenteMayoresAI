import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

/**
 * Página de Login diseñada para personas mayores
 * Características:
 * - Texto grande y claro
 * - Contraste alto
 * - Instrucciones paso a paso
 * - PIN numérico de 4 dígitos (fácil de recordar)
 * - Mensajes de error amigables
 */
function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  // Estados para el formulario
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: username, 2: pin

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Registro de nuevo usuario
        if (pin !== confirmPin) {
          setError('Los PINs no coinciden. Por favor, verifica que sean iguales.');
          setLoading(false);
          return;
        }

        const response = await api.register(username, fullName, pin);

        // Login automático después del registro
        const loginResponse = await api.login(username, pin, rememberDevice);
        onLogin(loginResponse);
        navigate('/', { replace: true });
      } else {
        // Login de usuario existente
        const response = await api.login(username, pin, rememberDevice);
        onLogin(response);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Validar PIN de 4 dígitos
  const handlePinChange = (value) => {
    // Solo permitir números
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setPin(numericValue);
  };

  const handleConfirmPinChange = (value) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setConfirmPin(numericValue);
  };

  // Cambiar entre login y registro
  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setPin('');
    setConfirmPin('');
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">👋</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Asistente para Personas Mayores
          </h1>
          <p className="text-xl text-gray-600">
            {isRegister ? 'Crea tu cuenta personal' : 'Bienvenido de nuevo'}
          </p>
        </div>

        {/* Tarjeta de login/registro */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Instrucciones */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8">
            <div className="flex items-start">
              <span className="text-3xl mr-3">💡</span>
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-1">
                  {isRegister ? '¿Cómo crear tu cuenta?' : '¿Cómo entrar?'}
                </h3>
                <ol className="text-blue-700 text-base space-y-1 list-decimal list-inside">
                  {isRegister ? (
                    <>
                      <li>Escribe tu nombre completo</li>
                      <li>Crea un código corto (ej: MARIA01)</li>
                      <li>Crea un PIN secreto de 4 números</li>
                    </>
                  ) : (
                    <>
                      <li>Escribe tu código de usuario</li>
                      <li>Escribe tu PIN de 4 números</li>
                      <li>¡Listo! Ya puedes usar el asistente</li>
                    </>
                  )}
                </ol>
              </div>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <p className="text-red-700 text-lg">{error}</p>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre completo (solo registro) */}
            {isRegister && (
              <div>
                <label htmlFor="fullName" className="block text-xl font-semibold text-gray-700 mb-2">
                  📝 Tu Nombre Completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ejemplo: María García López"
                  className="w-full px-6 py-4 text-xl border-3 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all"
                  required
                  autoComplete="name"
                />
              </div>
            )}

            {/* Username / Código de usuario */}
            <div>
              <label htmlFor="username" className="block text-xl font-semibold text-gray-700 mb-2">
                🔑 Tu Código de Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                placeholder="Ejemplo: MARIA01"
                className="w-full px-6 py-4 text-xl border-3 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all uppercase"
                required
                autoComplete="username"
              />
              <p className="text-gray-500 mt-2 text-lg">
                Este es tu código personal. Recuérdalo para entrar la próxima vez.
              </p>
            </div>

            {/* PIN */}
            <div>
              <label htmlFor="pin" className="block text-xl font-semibold text-gray-700 mb-2">
                🔢 Tu PIN Secreto (4 números)
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="••••"
                className="w-full px-6 py-4 text-2xl text-center tracking-widest border-3 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all"
                required
                autoComplete={isRegister ? "new-password" : "current-password"}
                maxLength={4}
              />
              <p className="text-gray-500 mt-2 text-lg">
                Elige 4 números que puedas recordar fácilmente
              </p>
            </div>

            {/* Confirmar PIN (solo registro) */}
            {isRegister && (
              <div>
                <label htmlFor="confirmPin" className="block text-xl font-semibold text-gray-700 mb-2">
                  🔢 Confirma tu PIN
                </label>
                <input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => handleConfirmPinChange(e.target.value)}
                  placeholder="••••"
                  className="w-full px-6 py-4 text-2xl text-center tracking-widest border-3 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all"
                  required
                  autoComplete="new-password"
                  maxLength={4}
                />
              </div>
            )}

            {/* Recordar dispositivo (solo login) */}
            {!isRegister && (
              <div className="flex items-center bg-gray-50 p-4 rounded-xl">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-3 text-lg text-gray-700 cursor-pointer">
                  Recordarme en este dispositivo
                </label>
              </div>
            )}

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 px-8 rounded-2xl text-2xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all transform hover:scale-[1.02] disabled:scale-100 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-7 w-7 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </span>
              ) : (
                isRegister ? 'Crear mi cuenta' : 'Entrar'
              )}
            </button>
          </form>

          {/* Cambiar entre login y registro */}
          <div className="mt-8 text-center">
            <p className="text-lg text-gray-600 mb-4">
              {isRegister ? '¿Ya tienes cuenta?' : '¿Es tu primera vez aquí?'}
            </p>
            <button
              onClick={toggleMode}
              className="text-xl text-blue-600 font-semibold hover:text-blue-800 underline decoration-2 underline-offset-4 transition-colors"
            >
              {isRegister ? 'Inicia sesión aquí' : 'Crea tu cuenta aquí'}
            </button>
          </div>
        </div>

        {/* Ayuda adicional */}
        <div className="mt-8 text-center">
          <p className="text-lg text-gray-600">
            ¿Necesitas ayuda? Pide a un familiar que te asista.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
