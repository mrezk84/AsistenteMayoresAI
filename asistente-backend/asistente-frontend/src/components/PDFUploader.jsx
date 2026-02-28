import React, { useState, useRef, useCallback } from 'react';
import api from '../services/api';

/**
 * Componente para subir archivos PDF
 * Soporta drag & drop y selección de archivos
 */
function PDFUploader({ onUploadSuccess, onError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadProgress(0);
    } else {
      onError && onError('Por favor, selecciona un archivo PDF válido.');
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [onError]);

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) {
      return;
    }

    setIsUploading(true);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await api.uploadPDF(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      onUploadSuccess && onUploadSuccess(result);
      setSelectedFile(null);
      setUploadProgress(0);

      // Resetear el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      onError && onError('Hubo un error al subir el archivo. Por favor, intenta de nuevo.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl">
      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📄 Subir Manual en PDF
        </h2>

        {/* Área de drag & drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-100'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
            className="hidden"
            aria-label="Seleccionar archivo PDF"
          />

          <div className="flex flex-col items-center">
            {/* Icono de documento */}
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>

            {!selectedFile ? (
              <>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Arrastra tu PDF aquí o haz clic para buscar
                </p>
                <p className="text-sm text-gray-500">
                  Solo archivos PDF, máximo 10 MB
                </p>
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-center gap-3 justify-center mb-3">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>

                {/* Barra de progreso */}
                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        {selectedFile && !isUploading && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpload}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl text-base font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Subir archivo
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl text-base font-medium hover:bg-gray-300 transition-all"
            >
              Cancelar
            </button>
          </div>
        )}

        {isUploading && (
          <div className="mt-6 text-center">
            <p className="text-blue-600 font-medium">Subiendo archivo... {uploadProgress}%</p>
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">💡 ¿Cómo funciona?</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Sube un manual en PDF</li>
            <li>El asistente leerá el contenido</li>
            <li>Haz preguntas sobre el manual</li>
            <li>Recibe respuestas claras y sencillas</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default PDFUploader;
