import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

/**
 * Componente que protege rutas que requieren autenticación
 * Redirige a login si no hay usuario autenticado
 */
function ProtectedRoute({ children }) {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    // Redirigir a login y guardar la ruta actual para volver después
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
