import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';

/**
 * Hook personalizado para manejar la lógica del chat
 */
export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar todas las conversaciones del usuario
   */
  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Cargar una conversación específica con sus mensajes
   */
  const loadConversation = useCallback(async (conversationId) => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.getConversation(conversationId);
      setCurrentConversation(data);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear una nueva conversación
   */
  const createConversation = useCallback(async (title = 'Nueva conversación', pdfId = null) => {
    try {
      setError(null);
      setLoading(true);
      const newConversation = await api.createConversation(title, pdfId);
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);
      return newConversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Enviar un mensaje en la conversación actual
   */
  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || !currentConversation) {
      return;
    }

    // Agregar mensaje del usuario inmediatamente (optimista)
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await api.sendMessage(currentConversation.id, question);

      // Agregar respuesta del asistente
      const assistantMessage = {
        id: response.message_id,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Actualizar la conversación en la lista
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversation.id) {
          return {
            ...conv,
            updated_at: new Date().toISOString(),
            messages: [...(conv.messages || []), userMessage, assistantMessage]
          };
        }
        return conv;
      }));

      return response.answer;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);

      // Remover el mensaje del usuario en caso de error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));

      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentConversation]);

  /**
   * Eliminar una conversación
   */
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      setError(null);
      await api.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));

      // Si eliminamos la conversación actual, limpiar
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError(err.message);
    }
  }, [currentConversation]);

  /**
   * Actualizar el título de una conversación
   */
  const updateConversationTitle = useCallback(async (conversationId, title) => {
    try {
      setError(null);
      await api.updateConversationTitle(conversationId, title);
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, title };
        }
        return conv;
      }));

      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => ({ ...prev, title }));
      }
    } catch (err) {
      console.error('Error updating conversation title:', err);
      setError(err.message);
    }
  }, [currentConversation]);

  /**
   * Limpiar el estado actual
   */
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  }, []);

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    // Estado
    conversations,
    currentConversation,
    messages,
    loading,
    error,

    // Acciones
    loadConversations,
    loadConversation,
    createConversation,
    sendMessage,
    deleteConversation,
    updateConversationTitle,
    clearCurrentConversation,
    setCurrentConversation
  };
}
