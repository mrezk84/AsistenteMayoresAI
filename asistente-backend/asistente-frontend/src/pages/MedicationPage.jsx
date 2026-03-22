import { useState, useEffect } from 'react';
import { BACKGROUND_STYLES } from '../config/images';
import './MedicationPage.css';

export default function MedicationPage() {
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
    notes: ''
  });

  // Cargar recordatorios desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('medication_reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  }, []);

  // Guardar recordatorios en localStorage
  useEffect(() => {
    localStorage.setItem('medication_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = () => {
    if (!newMedication.name) return;
    setReminders([...reminders, { ...newMedication, id: Date.now() }]);
    setNewMedication({ name: '', dosage: '', frequency: '', time: '', notes: '' });
    setShowAddForm(false);
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div className="medication-page" style={BACKGROUND_STYLES}>
      <div className="overlay"></div>
      <div className="content">
        <div className="header">
          <span className="icon">💊</span>
          <h1>Recordatorios de Medicación</h1>
          <p>Toma tus medicinas a tiempo</p>
        </div>

        <button onClick={() => setShowAddForm(true)} className="add-btn">
          ➕ Agregar Medicina
        </button>

        {showAddForm && (
          <div className="form-card glass">
            <h3>Nueva Medicina</h3>
            <input
              type="text"
              placeholder="Nombre de la medicina"
              value={newMedication.name}
              onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
              className="input"
            />
            <input
              type="text"
              placeholder="Dosis (ej: 1 pastilla)"
              value={newMedication.dosage}
              onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
              className="input"
            />
            <select
              value={newMedication.frequency}
              onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
              className="input"
            >
              <option value="">Frecuencia...</option>
              <option value="Diaria">Una vez al día</option>
              <option value="2 veces">Dos veces al día</option>
              <option value="3 veces">Tres veces al día</option>
              <option value="Antes de comer">Antes de comer</option>
              <option value="Después de comer">Después de comer</option>
            </select>
            <input
              type="time"
              value={newMedication.time}
              onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
              className="input"
            />
            <textarea
              placeholder="Notas (opcional)"
              value={newMedication.notes}
              onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
              className="textarea"
            ></textarea>
            <div className="button-group">
              <button onClick={addReminder} className="btn-primary">Guardar</button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        )}

        <div className="reminders-list">
          {reminders.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">💊</span>
              <p>No tienes recordatorios aún</p>
              <p>Presiona "Agregar Medicina" para crear uno</p>
            </div>
          ) : (
            reminders.map(reminder => (
              <div key={reminder.id} className="reminder-card glass">
                <div className="reminder-header">
                  <h3>{reminder.name}</h3>
                  <button onClick={() => deleteReminder(reminder.id)} className="delete-btn">🗑️</button>
                </div>
                <div className="reminder-details">
                  <p><strong>Dosis:</strong> {reminder.dosage}</p>
                  <p><strong>Frecuencia:</strong> {reminder.frequency}</p>
                  {reminder.time && <p><strong>Hora:</strong> {reminder.time}</p>}
                  {reminder.notes && <p><strong>Notas:</strong> {reminder.notes}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
