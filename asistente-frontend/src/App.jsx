import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadPDF = async () => {
    if (!file) return alert('Selecciona un archivo PDF');
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    const res = await fetch('http://localhost:8000/upload-pdf/', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    alert(data.message);
    setLoading(false);
  };

  const ask = async () => {
    if (!question) return;
    const formData = new FormData();
    formData.append('question', question);
    setLoading(true);
    const res = await fetch('http://localhost:8000/ask/', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setAnswer(data.answer);
    speakText(data.answer);
    setLoading(false);
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">📘 Asistente para personas mayores</h1>

      <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={uploadPDF}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
      >
        Subir Manual
      </button>

      <div className="mb-4">
        <label className="block mb-2">Escribí tu pregunta:</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        onClick={ask}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Consultar
      </button>

      {loading && <p className="mt-4 text-center text-sm">Procesando...</p>}

      {answer && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Respuesta:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;
