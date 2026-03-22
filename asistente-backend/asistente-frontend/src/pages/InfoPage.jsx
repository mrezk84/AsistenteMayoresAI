import { useState } from 'react';
import { BACKGROUND_STYLES } from '../config/images';
import './InfoPage.css';

const infoCategories = [
  {
    id: 1,
    icon: '📱',
    title: 'Tecnología',
    color: '#3498db',
    items: [
      { title: 'Usar WhatsApp', description: 'Mantente en contacto con familiares' },
      { title: 'Videollamadas', description: 'Aprende a hacer videollamadas con Zoom' },
      { title: 'Seguridad Digital', description: 'Consejos para estar seguro en internet' },
      { title: 'Apps Útiles', description: 'Aplicaciones para el día a día' }
    ]
  },
  {
    id: 2,
    icon: '🏦',
    title: 'Trámites',
    color: '#27ae60',
    items: [
      { title: 'Bancos en Línea', description: 'Cómo usar la banca digital' },
      { title: 'Trámites del Gobierno', description: 'CURP, INE y otros documentos' },
      { title: 'Servicios Médicos', description: 'IMSS, ISSSTE y seguros médicos' },
      { title: 'Pensiones', description: 'Información sobre Afore y pensiones' }
    ]
  },
  {
    id: 3,
    icon: '🆘',
    title: 'Emergencias',
    color: '#e74c3c',
    items: [
      { title: 'Números de Emergencia', description: '911, Cruz Roja, Bomberos' },
      { title: 'Contactos Familiares', description: 'Guarda tus contactos importantes' },
      { title: 'Servicios Médicos', description: 'Hospitales y farmacias de guardia' },
      { title: 'Planes de Emergencia', description: 'Qué hacer en caso de...' }
    ]
  },
  {
    id: 4,
    icon: '🎓',
    title: 'Aprende',
    color: '#9b59b6',
    items: [
      { title: 'Cursos Gratuitos', description: 'Plataformas de aprendizaje online' },
      { title: 'Lectura', description: 'Libros y audiolibros recomendados' },
      { title: 'Ejercicios Mentales', description: 'Sudoku, crucigramas y más' },
      { title: 'Idiomas', description: 'Aprende inglés u otros idiomas' }
    ]
  }
];

export default function InfoPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="info-page" style={BACKGROUND_STYLES}>
      <div className="overlay"></div>
      <div className="content">
        <div className="header">
          <span className="icon">📚</span>
          <h1>Información Útil</h1>
          <p>Todo lo que necesitas saber</p>
        </div>

        {!selectedCategory ? (
          <div className="categories">
            {infoCategories.map(category => (
              <div
                key={category.id}
                className="category-card glass"
                onClick={() => setSelectedCategory(category)}
                style={{ borderLeftColor: category.color }}
              >
                <span className="category-icon">{category.icon}</span>
                <h3>{category.title}</h3>
                <p>{category.items.length} temas</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="items-view">
            <button onClick={() => { setSelectedCategory(null); setSelectedItem(null); }} className="back-btn">
              ← Volver
            </button>

            <div className="category-header glass">
              <span className="category-icon">{selectedCategory.icon}</span>
              <h2>{selectedCategory.title}</h2>
            </div>

            <div className="items-list">
              {selectedCategory.items.map((item, index) => (
                <div
                  key={index}
                  className="item-card glass"
                  onClick={() => setSelectedItem(selectedItem === index ? null : index)}
                >
                  <div className="item-header">
                    <h3>{item.title}</h3>
                    <span>{selectedItem === index ? '▲' : '▼'}</span>
                  </div>
                  <p className="item-description">{item.description}</p>

                  {selectedItem === index && (
                    <div className="item-details">
                      <div className="detail-content">
                        <h4>Información detallada:</h4>
                        <p>Aquí encontrarás información completa sobre {item.title.toLowerCase()}.
                        Esta sección está diseñada para guiarte paso a paso.</p>
                        <div className="detail-actions">
                          <button className="action-btn">📖 Leer más</button>
                          <button className="action-btn">🎥 Ver tutorial</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
