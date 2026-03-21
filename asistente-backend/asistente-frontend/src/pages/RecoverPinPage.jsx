import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './RecoverPinPage.css';

export default function RecoverPinPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [resetCode, setResetCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate();

  // Paso 1: Usuario solicita código de reseteo
  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage('Por favor, ingresa tu código de usuario');
      return;
    }
    setLoading(true);
    try {
      const response = await api.requestPinReset(username);
      setResetCode(response.reset_code);
      setStep(2);
      setMessage('');
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Familiar completa el reseteo
  const handleFamilyReset = async (e) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(newPin)) {
      setMessage('El PIN debe ser 4 números');
      return;
    }
    if (newPin !== confirmPin) {
      setMessage('Los PIN no coinciden');
      return;
    }
    if (!adminKey.trim()) {
      setMessage('Ingresa la clave de administrador');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://asistente-mayores-backend.onrender.com/auth/reset-pin-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.toUpperCase(),
          new_pin: newPin,
          admin_key: adminKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al resetear el PIN');
      }

      setResetComplete(true);
      setStep(3);
      setMessage('');
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setStep(1);
    setUsername('');
    setResetCode(null);
    setNewPin('');
    setConfirmPin('');
    setAdminKey('');
    setMessage('');
    setResetComplete(false);
  };

  return (
    <div className="recover-page">
      <div className="recover-container">
        {/* Header */}
        <div className="recover-header">
          <span className="header-icon">🔐</span>
          <h1>Recuperación de PIN</h1>
          <p>Sigue los pasos para recuperar tu acceso</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-container">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Solicitar</span>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Familiar</span>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Listo</span>
          </div>
        </div>

        {/* PASO 1: Usuario solicita código */}
        {step === 1 && (
          <div className="card">
            <div className="card-header">
              <span className="step-icon">📝</span>
              <h2>Paso 1: Solicita tu código</h2>
            </div>

            <div className="instructions">
              <h3>👤 Si olvidaste tu PIN, sigue estos pasos:</h3>
              <ol>
                <li>Escribe tu código de usuario (ej: MARIA01)</li>
                <li>Presiona "Obtener Código"</li>
                <li>Copia el código que aparece</li>
                <li>Muéstraselo a un familiar o administrador</li>
              </ol>
            </div>

            <form onSubmit={handleRequestCode} className="form">
              <div className="form-group">
                <label htmlFor="username">Tu Código de Usuario</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase())}
                  placeholder="Ej: MARIA01"
                  className="input-text"
                  required
                />
                <small>Este es el código que usas para entrar al sistema</small>
              </div>

              {message && (
                <div className={`message ${message.startsWith('❌') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Generando...' : '📧 Obtener Código'}
              </button>
            </form>

            <button onClick={() => navigate('/login')} className="btn-back">
              ← Volver al inicio
            </button>
          </div>
        )}

        {/* PASO 2: Familiar completa el reseteo */}
        {step === 2 && resetCode && (
          <div className="card">
            <div className="card-header">
              <span className="step-icon">👨‍👩‍👧‍👦</span>
              <h2>Paso 2: Para tu Familiar</h2>
            </div>

            <div className="code-display">
              <p className="code-label">CÓDIGO DE RESETEO:</p>
              <div className="code-box">{resetCode}</div>
              <p className="code-hint">Este código lo necesita tu familiar para ayudarte</p>
            </div>

            <div className="family-section">
              <h3>🔧 Instrucciones para el familiar/administrador:</h3>
              <ol className="family-steps">
                <li>Copia el código de arriba: <strong>{resetCode}</strong></li>
                <li>Crea un nuevo PIN de 4 números para el usuario</li>
                <li>Ingresa la clave de administrador</li>
                <li>Presiona "Resetear PIN"</li>
                <li>Informa al usuario cuál es su nuevo PIN</li>
              </ol>
            </div>

            <form onSubmit={handleFamilyReset} className="form family-form">
              <h4>📋 Formulario de Reseteo</h4>

              <div className="form-group">
                <label>Nuevo PIN (4 números)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="input-pin"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmar PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="input-pin"
                  required
                />
              </div>

              <div className="form-group">
                <label>Clave de Administrador</label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Ingresa la clave de administrador"
                  className="input-text"
                  required
                />
                <small>Esta clave es solo para familiares/administradores</small>
              </div>

              {message && (
                <div className={`message ${message.startsWith('❌') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}

              <div className="button-group">
                <button type="button" onClick={startOver} className="btn-secondary">
                  ← Empezar de nuevo
                </button>
                <button type="submit" className="btn-success" disabled={loading}>
                  {loading ? '⏳ Procesando...' : '✅ Resetear PIN'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PASO 3: Completado */}
        {step === 3 && resetComplete && (
          <div className="card success-card">
            <div className="success-animation">✅</div>
            <h2>¡PIN Reseteado Correctamente!</h2>

            <div className="success-message">
              <p>Tu PIN ha sido cambiado exitosamente.</p>
              <p>Ahora puedes iniciar sesión con tu nuevo PIN.</p>
            </div>

            <div className="next-steps-box">
              <h3>📋 ¿Qué hacer ahora?</h3>
              <ol>
                <li>Memoriza tu nuevo PIN</li>
                <li>Guarda este PIN en un lugar seguro</li>
                <li>Inicia sesión con tu nuevo PIN</li>
                <li>Opcional: Ve a Configuración y cámbialo por uno que tú elijas</li>
              </ol>
            </div>

            <div className="button-group">
              <button onClick={() => navigate('/login')} className="btn-primary">
                🚀 Ir al Login
              </button>
              <button onClick={startOver} className="btn-secondary">
                🔄 Ayudar a otro usuario
              </button>
            </div>
          </div>
        )}

        {/* Footer help */}
        <div className="help-footer">
          <p>¿Necesitas ayuda adicional?</p>
          <p>Contacta a un familiar o al administrador del sistema</p>
        </div>
      </div>
    </div>
  );
}
