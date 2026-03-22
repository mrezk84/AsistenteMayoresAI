import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKGROUND_STYLES } from '../config/images';
import './HealthPage.css';

const healthTips = [
  {
    id: 1,
    icon: '💧',
    title: 'Hidratación',
    description: 'Bebe al menos 8 vasos de agua al día',
    tips: ['Inicia el día con un vaso de agua', 'Lleva una botella contigo', 'Bebe antes de sentir sed'],
    chatPrompt: '¿Qué importancia tiene beber agua durante el día?'
  },
  {
    id: 2,
    icon: '🚶',
    title: 'Actividad Física',
    description: 'Caminar 30 minutos diarios mejora tu salud',
    tips: ['Camina a paso ligero', 'Usa las escaleras', 'Estírate cada hora'],
    chatPrompt: '¿Qué ejercicios simples puedo hacer en casa?'
  },
  {
    id: 3,
    icon: '🥗',
    title: 'Alimentación',
    description: 'Come más frutas y verduras',
    tips: ['5 porciones de frutas/verduras al día', 'Reduce la sal', 'Come despacio'],
    chatPrompt: '¿Qué alimentos son buenos para mi edad?'
  },
  {
    id: 4,
    icon: '😴',
    title: 'Descanso',
    description: 'Dormir bien es fundamental',
    tips: ['Duerme 7-8 horas', 'Cena ligero', 'Apaga pantallas 1 hora antes'],
    chatPrompt: '¿Cómo puedo mejorar mi sueño?'
  },
  {
    id: 5,
    icon: '🧘',
    title: 'Bienestar Mental',
    description: 'Cuida tu mente como tu cuerpo',
    tips: ['Medita 10 minutos', 'Socializa con amigos', 'Haz actividades que disfrutes'],
    chatPrompt: '¿Qué actividades puedo hacer para mantener mi mente activa?'
  },
  {
    id: 6,
    icon: '🩺',
    title: 'Chequeos Médicos',
    description: 'Visita al médico regularmente',
    tips: ['Control de presión arterial', 'Examen anual', 'Vacunas al día'],
    chatPrompt: '¿Qué exámenes médicos debo hacer regularmente?'
  }
];

export default function HealthPage() {
  const [expandedTip, setExpandedTip] = useState(null);
  const navigate = useNavigate();

  const handleChatWithTopic = (prompt) => {
    sessionStorage.setItem('chatTopic', prompt);
    navigate('/');
  };

  return (
    <div className="health-page" style={BACKGROUND_STYLES}>
      <div className="overlay"></div>
      <div className="content">
        <div className="header">
          <span className="icon">🏥</span>
          <h1>Consejos de Salud</h1>
          <p>Pequeños cambios, grandes beneficios</p>
        </div>

        <div className="chat-tip glass">
          <span className="tip-icon">💬</span>
          <p>Toca cualquier tarjeta para ver más y hablar con el asistente sobre ese tema</p>
        </div>

        <div className="tips-grid">
          {healthTips.map(tip => (
            <div
              key={tip.id}
              className={`tip-card glass ${expandedTip === tip.id ? 'expanded' : ''}`}
            >
              <div className="tip-icon">{tip.icon}</div>
              <h3>{tip.title}</h3>
              <p className="tip-description">{tip.description}</p>

              {expandedTip === tip.id ? (
                <>
                  <div className="tip-details">
                    <h4>💡 Recomendaciones:</h4>
                    <ul>
                      {tip.tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleChatWithTopic(tip.chatPrompt); }} className="chat-btn">
                    💬 Hablar sobre esto
                  </button>
                  <div className="tap-hint" onClick={(e) => { e.stopPropagation(); setExpandedTip(null); }}>
                    ▲ Toca para cerrar
                  </div>
                </>
              ) : (
                <div className="tap-hint" onClick={() => setExpandedTip(tip.id)}>
                  ▼ Toca para más
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="daily-quote glass">
          <span className="quote-icon">✨</span>
          <p className="quote">"La salud es el mayor de los bienes."</p>
          <p className="quote-author">- Pitágoras</p>
        </div>

        <button onClick={() => navigate('/')} className="floating-chat-btn">
          💬 Ir al Chat
        </button>
      </div>
    </div>
  );
}
