import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import HistoryPage from './pages/HistoryPage';

/**
 * Componente principal de la aplicación
 * Configura el enrutador y las rutas de la aplicación
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><ChatPage /></Layout>} />
        <Route path="/upload" element={<Layout><UploadPage /></Layout>} />
        <Route path="/history" element={<Layout><HistoryPage /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
