import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './ForgotPinPage.css';

export function ForgotPinPage() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState(null);
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setResetCode(null);

    if (!username.trim()) {
      setMessage('❌ Ingresa tu código de usuario');
      return;
    }

    setLoading(true);

    try {
      const response = await api.requestPinReset(username);
      setResetCode(response.reset_code);
      setMessage('✅ ' + response.message);
    } catch (error) {
      setMessage(`❌ ${error.message || 'Error al solicitar reseteo'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-pin-page">
      <div className="forgot-pin-container">
        <div className="forgot-pin-card">
          <h1>🔐 ¿Olvidaste tu PIN?</h1>

          <p className="help-text">
            No te preocupes. Puedes solicitar un código de reseteo
            y contactar a tu familiar o administrador.
          </p>

          {!resetCode ? (
            <form onSubmit={handleRequestReset} className="reset-form">
              <div className="form-group">
                <label htmlFor="username">Tu Código de Usuario</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase())}
                  placeholder="Ej: MARIA01"
                  className="text-input"
                  required
                />
              </div>

              {message && (
                <div className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !username}
              >
                {loading ? '⏳ Generando...' : '📧 Obtener Código'}
              </button>
            </form>
          ) : (
            <div className="reset-code-display">
              <h2>📋 Código de Reseteo</h2>

              <div className="code-box">
                <code>{resetCode}</code>
              </div>

              <p className="instructions">
                <strong>Pasos a seguir:</strong>
              </p>
              <ol className="steps-list">
                <li>Contacta a tu familiar o administrador</li>
                <li>Enséñale este código: <strong>{resetCode}</strong></li>
                <li>Ellos podrán resetear tu PIN</li>
              </ol>

              <div className="actions">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-secondary"
                >
                  ← Volver al Login
                </button>
                <button
                  onClick={() => {
                    setResetCode(null);
                    setMessage('');
                  }}
                  className="btn-primary"
                >
                  🔄 Generar otro código
                </button>
              </div>
            </div>
          )}

          <div className="info-box">
            <h3>ℹ️ ¿Por qué necesito ayuda?</h3>
            <p>
              Por tu seguridad, no podemos recuperar tu PIN actual.
              Un familiar o administrador debe asignarte uno nuevo.
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="back-link"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}
