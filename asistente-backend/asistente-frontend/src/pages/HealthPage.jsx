import { BACKGROUND_STYLES } from '../config/images';
import './HealthPage.css';

const healthTips = [
  {
    id: 1,
    icon: '💧',
    title: 'Hidratación',
    description: 'Bebe al menos 8 vasos de agua al día',
    tips: ['Inicia el día con un vaso de agua', 'Lleva una botella contigo', 'Bebe antes de sentir sed']
  },
  {
    id: 2,
    icon: '🚶',
    title: 'Actividad Física',
    description: 'Caminar 30 minutos diarios mejora tu salud',
    tips: ['Camina a paso ligero', 'Usa las escaleras', 'Estírate cada hora']
  },
  {
    id: 3,
    icon: '🥗',
    title: 'Alimentación',
    description: 'Come más frutas y verduras',
    tips: ['5 porciones de frutas/verduras al día', 'Reduce la sal', 'Come despacio']
  },
  {
    id: 4,
    icon: '😴',
    title: 'Descanso',
    description: 'Dormir bien es fundamental',
    tips: ['Duerme 7-8 horas', 'Cena ligero', 'Apaga pantallas 1 hora antes']
  },
  {
    id: 5,
    icon: '🧘',
    title: 'Bienestar Mental',
    description: 'Cuida tu mente como tu cuerpo',
    tips: ['Medita 10 minutos', 'Socializa con amigos', 'Haz actividades que disfrutes']
  },
  {
    id: 6,
    icon: '🩺',
    title: 'Chequeos Médicos',
    description: 'Visita al médico regularmente',
    tips: ['Control de presión arterial', 'Examen anual', 'Vacunas al día']
  }
];

export default function HealthPage() {
  const [expandedTip, setExpandedTip] = useState(null);

  return (
    <div className="health-page" style={BACKGROUND_STYLES}>
      <div className="overlay"></div>
      <div className="content">
        <div className="header">
          <span className="icon">🏥</span>
          <h1>Consejos de Salud</h1>
          <p>Pequeños cambios, grandes beneficios</p>
        </div>

        <div className="tips-grid">
          {healthTips.map(tip => (
            <div
              key={tip.id}
              className={`tip-card glass ${expandedTip === tip.id ? 'expanded' : ''}`}
              onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
            >
              <div className="tip-icon">{tip.icon}</div>
              <h3>{tip.title}</h3>
              <p className="tip-description">{tip.description}</p>

              {expandedTip === tip.id && (
                <div className="tip-details">
                  <h4>💡 Recomendaciones:</h4>
                  <ul>
                    {tip.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="tap-hint">
                {expandedTip === tip.id ? '▲ Toca para cerrar' : '▼ Toca para más'}
              </div>
            </div>
          ))}
        </div>

        <div className="daily-quote glass">
          <span className="quote-icon">✨</span>
          <p className="quote">"La salud es el mayor de los bienes."</p>
          <p className="quote-author">- Pitágoras</p>
        </div>
      </div>
    </div>
  );
}
