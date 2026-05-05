import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append('document', file);
    await axios.post(API + '/documents/upload', form);
    setFile(null);
    setLoading(false);
    alert('Upload enviado!');
  };

  const search = async () => {
    if (!query) return;
    const res = await axios.get(API + '/search?q=' + query);
    setResults(res.data);
  };

  return (
    <div style={{ padding: 40, fontFamily: 'Arial', maxWidth: 800, margin: '0 auto' }}>
      <h1>📄 DocFlow AI</h1>
      <p>Intelligent Document Processing + Multi-Agent Workflow</p>

      <div style={{ border: '2px dashed #ccc', padding: 30, margin: '20px 0', borderRadius: 10 }}>
        <input type="file" onChange={(e: any) => setFile(e.target.files[0])} accept=".pdf,.png,.jpg,.jpeg" />
        <button onClick={upload} disabled={!file || loading} style={{ marginLeft: 10 }}>
          {loading ? 'Enviando...' : 'Upload'}
        </button>
      </div>

      <div style={{ margin: '20px 0' }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar nos documentos..."
          style={{ width: '70%', padding: 8 }} />
        <button onClick={search} style={{ padding: 8, marginLeft: 10 }}>🔍</button>
      </div>

      {results.length > 0 && (
        <div>
          <h3>Resultados ({results.length})</h3>
          {results.map((r: any) => (
            <div key={r.id} style={{ background: '#f5f5f5', padding: 10, margin: 5, borderRadius: 5 }}>
              <strong>{r.originalName}</strong>
              <p>{r.content?.substring(0, 200)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}