import { useState } from 'react';
import { BACKGROUND_STYLES } from '../config/images';
import './MusicPage.css';

const musicCategories = [
  {
    id: 1,
    name: 'Música Clásica',
    icon: '🎼',
    color: '#e74c3c',
    songs: [
      { name: 'Beethoven - Sonata Claro de Luna', mood: 'Relajante' },
      { name: 'Mozart - Pequeña Serenata Nocturna', mood: 'Alegre' },
      { name: 'Bach - Arión', mood: 'Tranquilo' },
      { name: 'Vivaldi - Las Cuatro Estaciones', mood: 'Energizante' }
    ]
  },
  {
    id: 2,
    name: 'Boleros',
    icon: '💃',
    color: '#e91e63',
    songs: [
      { name: 'Bésame Mucho', artist: 'Consuelo Velázquez', mood: 'Romántico' },
      { name: 'Sabor a Mí', artist: 'Ángel Cabral', mood: 'Nostálgico' },
      { name: 'La Mentira', artist: 'Ángel Cabral', mood: 'Emotivo' },
      { name: 'Reloj', artist: 'Pablo Beltrán Ruiz', mood: 'Clásico' }
    ]
  },
  {
    id: 3,
    name: 'Rancheras',
    icon: '🤠',
    color: '#ff9800',
    songs: [
      { name: 'El Rey', artist: 'Vicente Fernández', mood: 'Alegre' },
      { name: 'Volver, Volver', artist: 'Vicente Fernández', mood: 'Emotivo' },
      { name: 'México Lindo y Querido', artist: 'Jorge Negrete', mood: 'Patriota' },
      { name: 'Caminos de Michoacán', artist: 'Vicente Fernández', mood: 'Nostálgico' }
    ]
  },
  {
    id: 4,
    name: 'Baladas',
    icon: '🎤',
    color: '#9c27b0',
    songs: [
      { name: 'Yesterday', artist: 'The Beatles', mood: 'Nostálgico' },
      { name: 'My Way', artist: 'Frank Sinatra', mood: 'Inspirador' },
      { name: 'La Barca', artist: 'Jeanette', mood: 'Romántico' },
      { name: 'Mienteme', artist: 'Pimpinela', mood: 'Emotivo' }
    ]
  },
  {
    id: 5,
    name: 'Instrumental Relax',
    icon: '🎹',
    color: '#00bcd4',
    songs: [
      { name: 'River Flows in You', artist: 'Yiruma', mood: 'Relajante' },
      { name: 'Canon in D', artist: 'Pachelbel', mood: 'Tranquilo' },
      { name: 'Gymnopédie No.1', artist: 'Erik Satie', mood: 'Calma' },
      { name: 'Clair de Lune', artist: 'Debussy', mood: 'Serenidad' }
    ]
  }
];

export default function MusicPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="music-page" style={BACKGROUND_STYLES}>
      <div className="overlay"></div>
      <div className="content">
        <div className="header">
          <span className="icon">🎵</span>
          <h1>Música para el Alma</h1>
          <p>Disfruta de buena música</p>
        </div>

        {!selectedCategory ? (
          <div className="categories">
            {musicCategories.map(category => (
              <div
                key={category.id}
                className="category-card glass"
                onClick={() => setSelectedCategory(category)}
                style={{ borderTopColor: category.color }}
              >
                <span className="category-icon">{category.icon}</span>
                <h3>{category.name}</h3>
                <p>{category.songs.length} canciones</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="songs-view">
            <button onClick={() => setSelectedCategory(null)} className="back-btn">
              ← Volver a categorías
            </button>

            <div className="category-header glass">
              <span className="category-icon">{selectedCategory.icon}</span>
              <h2>{selectedCategory.name}</h2>
            </div>

            <div className="songs-list">
              {selectedCategory.songs.map((song, index) => (
                <div
                  key={index}
                  className={`song-card glass ${currentSong?.name === song.name ? 'playing' : ''}`}
                  onClick={() => playSong(song)}
                >
                  <div className="song-number">{index + 1}</div>
                  <div className="song-info">
                    <h4>{song.name}</h4>
                    {song.artist && <p className="artist">{song.artist}</p>}
                    <span className="mood">{song.mood}</span>
                  </div>
                  <div className="play-btn">
                    {currentSong?.name === song.name && isPlaying ? '⏸️' : '▶️'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentSong && (
          <div className="player glass">
            <div className="player-info">
              <span className="note">🎵</span>
              <div>
                <h4>{currentSong.name}</h4>
                {currentSong.artist && <p>{currentSong.artist}</p>}
              </div>
            </div>
            <div className="player-controls">
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
