import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';

/**
 * Página de historial de conversaciones
 * Muestra todas las conversaciones del usuario y permite navegar entre ellas
 */
function HistoryPage() {
  const navigate = useNavigate();
  const { conversations, loadConversation, deleteConversation, loading } = useChat();
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'

  // Filtrar conversaciones por fecha
  const filteredConversations = conversations.filter(conv => {
    const convDate = new Date(conv.updated_at);
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    if (filter === 'today') {
      return now - convDate < dayMs;
    }
    if (filter === 'week') {
      return now - convDate < 7 * dayMs;
    }
    return true;
  });

  const handleSelectConversation = async (convId) => {
    localStorage.setItem('asistente_current_conversation', convId.toString());
    await loadConversation(convId);
    navigate('/');
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      await deleteConversation(convId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays === 0) {
      return 'Hoy, ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer, ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return days[date.getDay()] + ', ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al chat
            </button>

            <div className="flex items-center gap-4">
              <span className="text-4xl">📋</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Historial</h1>
                <p className="text-gray-600 text-lg">
                  {conversations.length} {conversations.length === 1 ? 'conversación' : 'conversaciones'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
              filter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
              filter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Esta semana
          </button>
        </div>

        {/* Lista de conversaciones */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Cargando conversaciones...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <span className="text-6xl mb-4 block">💬</span>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'all' ? 'Aún no tienes conversaciones' : 'No hay conversaciones en este período'}
            </h2>
            <p className="text-gray-500 mb-6">
              Comienza una nueva conversación en el chat
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-base font-medium hover:bg-blue-700 transition-all"
            >
              Ir al chat
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {conv.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(conv.updated_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {conv.messages?.length || 0} mensajes
                      </span>
                    </div>

                    {/* Vista previa del último mensaje */}
                    {conv.messages && conv.messages.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {conv.messages[conv.messages.length - 1].content.substring(0, 100)}
                        {conv.messages[conv.messages.length - 1].content.length > 100 && '...'}
                      </p>
                    )}
                  </div>

                  {/* Botón de eliminar */}
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    aria-label="Eliminar conversación"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
