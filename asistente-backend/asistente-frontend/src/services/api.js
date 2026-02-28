import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Obtener o generar device_id único para este dispositivo
const getDeviceId = () => {
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
};

/**
 * Cliente API centralizado para comunicarse con el backend
 */
class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.deviceId = getDeviceId();
  }

  /**
   * Helper para hacer fetch con manejo de errores
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Subir un PDF
   */
  async uploadPDF(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('device_id', this.deviceId);

    const response = await fetch(`${this.baseUrl}/pdfs/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir el PDF');
    }

    return await response.json();
  }

  /**
   * Obtener o crear usuario por device_id
   */
  async getOrCreateUser() {
    return this.fetch(`/users/device/${this.deviceId}`);
  }

  /**
   * Obtener todas las conversaciones del dispositivo actual
   */
  async getConversations() {
    return this.fetch(`/conversations/?device_id=${this.deviceId}`);
  }

  /**
   * Obtener una conversación específica con sus mensajes
   */
  async getConversation(conversationId) {
    return this.fetch(`/conversations/${conversationId}`);
  }

  /**
   * Crear una nueva conversación
   */
  async createConversation(title = 'Nueva conversación', pdfId = null) {
    const response = await this.fetch('/conversations/', {
      method: 'POST',
      body: JSON.stringify({
        title,
        pdf_id: pdfId
      }),
    });
    return response;
  }

  /**
   * Actualizar el título de una conversación
   */
  async updateConversationTitle(conversationId, title) {
    const formData = new FormData();
    formData.append('title', title);

    const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la conversación');
    }

    return await response.json();
  }

  /**
   * Eliminar una conversación
   */
  async deleteConversation(conversationId) {
    return this.fetch(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Enviar un mensaje en una conversación
   */
  async sendMessage(conversationId, question) {
    return this.fetch('/chat/', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        question: question
      }),
    });
  }

  /**
   * Obtener PDFs del usuario
   */
  async getUserPDFs() {
    // Primero obtenemos el user_id
    const user = await this.getOrCreateUser();
    return this.fetch(`/pdfs/user/${user.id}`);
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.fetch('/health');
  }
}

// Exportar una instancia única del cliente
export const api = new ApiClient();
export default api;
