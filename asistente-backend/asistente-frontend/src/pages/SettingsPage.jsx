import { useState } from 'react';
import { api } from '../services/api';
import './SettingsPage.css';

function SettingsPage() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePin = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validaciones
    if (newPin !== confirmPin) {
      setMessage('❌ Los nuevos PIN no coinciden');
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setMessage('❌ El PIN debe ser 4 números');
      return;
    }

    setLoading(true);

    try {
      await api.changePin(currentPin, newPin);
      setMessage('✅ PIN cambiado correctamente');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      setMessage(`❌ ${error.message || 'Error al cambiar el PIN'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>⚙️ Configuración</h1>

        <div className="settings-card">
          <h2>🔑 Cambiar mi PIN</h2>
          <p className="settings-help">
            Ingresa tu PIN actual y el nuevo que deseas usar.
          </p>

          <form onSubmit={handleChangePin} className="pin-form">
            <div className="form-group">
              <label htmlFor="current-pin">PIN Actual</label>
              <input
                id="current-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="pin-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-pin">Nuevo PIN</label>
              <input
                id="new-pin"
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
              <label htmlFor="confirm-pin">Confirmar Nuevo PIN</label>
              <input
                id="confirm-pin"
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

            {message && (
              <div className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !currentPin || !newPin || !confirmPin}
            >
              {loading ? '⏳ Cambiando...' : '🔄 Cambiar PIN'}
            </button>
          </form>
        </div>

        <div className="settings-card">
          <h2>📌 Consejos para un PIN seguro</h2>
          <ul className="tips-list">
            <li>Usa un número que puedas recordar fácilmente</li>
            <li>No uses años de nacimiento (19XX, 20XX)</li>
            <li>No uses secuencias (1234, 4321)</li>
            <li>No uses números repetidos (1111, 0000)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


export default SettingsPage;
