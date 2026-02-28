import React, { useEffect, useCallback, useState } from 'react';
import { useChat } from '../hooks/useChat';
import ChatInterface from '../components/ChatInterface';

/**
 * Página principal de chat
 * Maneja la lógica de conversación y muestra la interfaz de chat
 */
function ChatPage() {
  const {
    currentConversation,
    messages,
    loading,
    error,
    createConversation,
    sendMessage,
    loadConversation
  } = useChat();

  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar conversación actual desde localStorage si existe
  useEffect(() => {
    const savedConversationId = localStorage.getItem('asistente_current_conversation');
    const init = async () => {
      if (savedConversationId) {
        await loadConversation(parseInt(savedConversationId));
      }
      setIsInitialized(true);
    };
    init();
  }, [loadConversation]);

  // Crear nueva conversación si no hay una activa (solo después de intentar cargar)
  useEffect(() => {
    if (!currentConversation && !loading && isInitialized) {
      handleNewConversation();
    }
  }, [currentConversation, loading, isInitialized]);

  const handleSendMessage = async (question) => {
    if (!currentConversation) {
      // Crear conversación si no existe
      const newConv = await createConversation();
      if (newConv) {
        localStorage.setItem('asistente_current_conversation', newConv.id.toString());
        return await sendMessage(question);
      }
    }
    return await sendMessage(question);
  };

  const handleNewConversation = async () => {
    const newConv = await createConversation();
    if (newConv) {
      localStorage.setItem('asistente_current_conversation', newConv.id.toString());
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <ChatInterface
        messages={messages}
        loading={loading}
        onSendMessage={handleSendMessage}
        onNewConversation={handleNewConversation}
      />

      {/* Notificación de error */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl shadow-lg max-w-md">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
