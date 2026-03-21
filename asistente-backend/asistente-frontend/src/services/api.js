import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// ============================================
// GESTIÓN DE AUTENTICACIÓN
// ============================================

// Guardar token y datos de usuario
export const saveAuthData = (token, userData) => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
};

// Limpiar datos de autenticación
export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

// Obtener token almacenado
export const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Obtener datos del usuario almacenado
export const getUserData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
};

// Verificar si hay usuario autenticado
export const isAuthenticated = () => {
  return !!getAuthToken();
};

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
   * Helper para hacer fetch con manejo de errores y autenticación
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = getAuthToken();

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
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

  // ============================================
  // ENDPOINTS DE AUTENTICACIÓN
  // ============================================

  /**
   * Registra un nuevo usuario
   */
  async register(username, fullName, pin) {
    return this.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: username.toUpperCase(),
        full_name: fullName,
        pin: pin
      }),
    });
  }

  /**
   * Inicia sesión
   */
  async login(username, pin, rememberDevice = true) {
    const response = await this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: username.toUpperCase(),
        pin: pin,
        remember_device: rememberDevice
      }),
    });

    // Guardar datos de autenticación
    if (response.success) {
      saveAuthData(response.token, {
        user_id: response.user_id,
        username: response.username,
        full_name: response.full_name
      });
    }

    return response;
  }

  /**
   * Cierra sesión
   */
  async logout() {
    try {
      await this.fetch('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthData();
    }
  }

  /**
   * Verifica si hay una sesión activa
   */
  async checkAuth() {
    try {
      const response = await this.fetch('/auth/check');
      return response.authenticated ? response : null;
    } catch (error) {
      // Si hay error, probablemente el token expiró
      clearAuthData();
      return null;
    }
  }

  /**
   * Obtiene información del usuario actual
   */
  async getMe() {
    return this.fetch('/auth/me');
  }

  /**
   * Cambia el PIN del usuario (requiere PIN actual)
   */
  async changePin(currentPin, newPin) {
    return this.fetch('/auth/change-pin', {
      method: 'POST',
      body: JSON.stringify({
        current_pin: currentPin,
        new_pin: newPin
      }),
    });
  }

  /**
   * Solicita reseteo de PIN cuando se olvidó
   */
  async requestPinReset(username) {
    return this.fetch('/auth/reset-pin-request', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  /**
   * Desbloquea la cuenta del usuario actual
   */
  async unlockAccount() {
    return this.fetch('/auth/unlock', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // ============================================
  // ENDPOINTS DE CONVERSACIONES
  // ============================================

  /**
   * Obtener todas las conversaciones del usuario actual
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

  // ============================================
  // ENDPOINTS DE CHAT
  // ============================================

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

  // ============================================
  // ENDPOINTS DE PDF
  // ============================================

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
   * Obtener PDFs del usuario
   */
  async getUserPDFs() {
    const userData = getUserData();
    if (!userData) return [];

    return this.fetch(`/pdfs/user/${userData.user_id}`);
  }

  // ============================================
  // ENDPOINTS LEGADOS (para compatibilidad)
  // ============================================

  /**
   * Obtener o crear usuario por device_id (LEGADO)
   */
  async getOrCreateUser() {
    return this.fetch(`/users/device/${this.deviceId}`);
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

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
