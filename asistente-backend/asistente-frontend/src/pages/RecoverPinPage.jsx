import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './RecoverPinPage.css';

export default function RecoverPinPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
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
      setUserName(response.user_full_name || username);
      setStep(2);
      setMessage('');
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Confirmar que el código es correcto
  const handleConfirmCode = (e) => {
    e.preventDefault();
    if (resetCode.trim() !== resetCode) {
      setMessage('El código no coincide');
      return;
    }
    setStep(3);
    setMessage('');
  };

  // Paso 3: Crear nuevo PIN
  const handleCreatePin = (e) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(newPin)) {
      setMessage('El PIN debe ser 4 números');
      return;
    }
    if (newPin !== confirmPin) {
      setMessage('Los PIN no coinciden. Intenta de nuevo.');
      return;
    }

    setStep(4);
    setMessage('');
  };

  // Paso 4: Confirmar todo y resetear
  const handleResetComplete = async (e) => {
    e.preventDefault();

    if (!adminKey.trim()) {
      setMessage('Se necesita la clave de administrador');
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

      setStep(5);
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
    setResetCode('');
    setNewPin('');
    setConfirmPin('');
    setAdminKey('');
    setMessage('');
    setUserName('');
  };

  return (
    <div className="recover-page">
      <div className="recover-container">
        {/* Header */}
        <div className="recover-header">
          <span className="header-icon">🔐</span>
          <h1>Cambiar mi PIN</h1>
          <p>Sigue los pasos para crear un nuevo PIN</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>3</div>
          <div className={`progress-line ${step >= 4 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>4</div>
          <div className={`progress-line ${step >= 5 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>✓</div>
        </div>

        <div className="step-labels">
          <span className={step === 1 ? 'active' : ''}>1. Tu Código</span>
          <span className={step === 2 ? 'active' : ''}>2. Confirmar</span>
          <span className={step === 3 ? 'active' : ''}>3. Nuevo PIN</span>
          <span className={step === 4 ? 'active' : ''}>4. Finalizar</span>
          <span className={step === 5 ? 'active' : ''}>¡Listo!</span>
        </div>

        {/* PASO 1: Ingresar código de usuario */}
        {step === 1 && (
          <div className="card">
            <div className="card-title">
              <span className="step-number">1</span>
              <h2>¿Cuál es tu código de usuario?</h2>
            </div>
            <p className="card-text">
              Escribe el código que usas para entrar (ej: MARIA01)
            </p>

            <form onSubmit={handleRequestCode} className="form">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                placeholder="Ej: MARIA01"
                className="big-input"
                required
              />

              {message && <div className="message error">{message}</div>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Buscando...' : 'Continuar →'}
              </button>
            </form>

            <button onClick={() => navigate('/login')} className="btn-back">
              ← Volver al inicio
            </button>
          </div>
        )}

        {/* PASO 2: Mostrar código generado */}
        {step === 2 && (
          <div className="card">
            <div className="card-title">
              <span className="step-number">2</span>
              <h2>¡Copia este código!</h2>
            </div>
            <p className="card-text">
              Este es tu código de reseteo. Muéstralo a un familiar.
            </p>

            <div className="code-box-large">
              <div className="code-title">CÓDIGO DE RESETEO</div>
              <div className="code-value">{resetCode}</div>
            </div>

            <div className="info-box">
              <strong>💡 Instrucciones:</strong>
              <ol>
                <li>Copia o escribe este código: <strong>{resetCode}</strong></li>
                <li>Muéstralo a tu familiar o administrador</li>
                <li>Ellos usarán este código para ayudarte a crear un nuevo PIN</li>
              </ol>
            </div>

            <div className="button-group">
              <button onClick={() => setStep(1)} className="btn-secondary">
                ← Atrás
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Crear nuevo PIN */}
        {step === 3 && (
          <div className="card">
            <div className="card-title">
              <span className="step-number">3</span>
              <h2>Crea tu nuevo PIN</h2>
            </div>
            <p className="card-text">
              Elige 4 números que puedas recordar fácilmente
            </p>

            <form onSubmit={handleCreatePin} className="form">
              <div className="form-group">
                <label>Nuevo PIN (4 números)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="pin-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirma tu nuevo PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="pin-input"
                  required
                />
              </div>

              {message && <div className="message error">{message}</div>}

              <div className="summary-box">
                <p><strong>Código de reseteo:</strong> {resetCode}</p>
              </div>

              <div className="button-group">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                  ← Atrás
                </button>
                <button type="submit" className="btn-primary">
                  Continuar →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PASO 4: Confirmar y finalizar */}
        {step === 4 && (
          <div className="card">
            <div className="card-title">
              <span className="step-number">4</span>
              <h2>Confirma los datos</h2>
            </div>
            <p className="card-text">
              Revisa que todo esté correcto antes de continuar
            </p>

            <div className="confirm-box">
              <div className="confirm-row">
                <span>Usuario:</span>
                <strong>{username}</strong>
              </div>
              <div className="confirm-row">
                <span>Nuevo PIN:</span>
                <strong>{'•'.repeat(4)}</strong>
              </div>
              <div className="confirm-row">
                <span>Código de reseteo:</span>
                <strong>{resetCode}</strong>
              </div>
            </div>

            <form onSubmit={handleResetComplete} className="form">
              <div className="form-group">
                <label>Clave de Administrador</label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Pega la clave aquí"
                  className="big-input"
                  required
                />
                <small>Pide a tu familiar la clave de administrador</small>
              </div>

              {message && <div className="message error">{message}</div>}

              <div className="button-group">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary">
                  ← Atrás
                </button>
                <button type="submit" className="btn-success" disabled={loading}>
                  {loading ? '⏳ Procesando...' : '✅ Confirmar y Cambiar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PASO 5: ¡Listo! */}
        {step === 5 && (
          <div className="card success-card">
            <div className="success-icon">🎉</div>
            <h2>¡PIN Cambiado!</h2>

            <div className="success-message">
              <p>Tu nuevo PIN está listo.</p>
              <p>Ya puedes entrar al sistema.</p>
            </div>

            <div className="next-steps">
              <h3>📋 Recuerda:</h3>
              <ul>
                <li>Memoriza tu nuevo PIN</li>
                <li>Si lo olvidas, puedes volver a cambiarlo aquí</li>
                <li>Guarda este PIN en un lugar seguro</li>
              </ul>
            </div>

            <button onClick={() => navigate('/login')} className="btn-primary big-button">
              🚀 Ir al Login
            </button>

            <button onClick={startOver} className="btn-link">
              Cambiar otro PIN
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <p>¿Necesitas ayuda? Contacta a un familiar</p>
        </div>
      </div>
    </div>
  );
}
