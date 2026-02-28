import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PDFUploader from '../components/PDFUploader';

/**
 * Página para subir archivos PDF
 * Permite al usuario cargar manuales para consultar
 */
function UploadPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const handleUploadSuccess = (result) => {
    const notification = {
      id: Date.now(),
      type: 'success',
      message: `¡PDF "${result.filename}" subido correctamente con ID ${result.pdf_id}!`
    };
    setNotifications(prev => [notification, ...prev]);

    // Remover notificación después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleError = (errorMessage) => {
    const notification = {
      id: Date.now(),
      type: 'error',
      message: errorMessage
    };
    setNotifications(prev => [notification, ...prev]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notificaciones */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
          >
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al chat
        </button>

        <div className="flex items-center gap-4 mb-2">
          <span className="text-4xl">📄</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Subir Manual</h1>
            <p className="text-gray-600 text-lg">
              Sube un manual en PDF para poder hacer preguntas sobre su contenido
            </p>
          </div>
        </div>
      </div>

      {/* Componente de subida */}
      <div className="max-w-4xl mx-auto">
        <PDFUploader
          onUploadSuccess={handleUploadSuccess}
          onError={handleError}
        />
      </div>

      {/* Instrucciones adicionales */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ℹ️ Instrucciones</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-1">Sube el PDF</h3>
              <p className="text-sm text-gray-600">Arrastra o selecciona tu archivo PDF</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-1">Espera el procesamiento</h3>
              <p className="text-sm text-gray-600">El asistente leerá el contenido</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-1">Haz preguntas</h3>
              <p className="text-sm text-gray-600">Ve al chat y consulta lo que necesites</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
