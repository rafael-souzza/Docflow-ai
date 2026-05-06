import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://reimagined-funicular-gxqrv9575vg539999-3000.app.github.dev/api';

const C = {
  bg: '#0A0C10', surface: '#111318', surface2: '#181B22',
  accent: '#00E5A0', data: '#0EA5E9', agent: '#7C3AED',
  text: '#F0F2F5', muted: '#6B7280',
  border: 'rgba(255,255,255,0.07)', borderEm: 'rgba(255,255,255,0.12)',
};

const badgeStyle = (color: string) => ({
  fontFamily: 'DM Mono, monospace', fontSize: 11, color,
  background: `${color}15`, border: `0.5px solid ${color}30`,
  padding: '4px 10px', borderRadius: 6,
});

const btnPrimary = {
  background: C.accent, color: '#030712', border: 'none',
  fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 13,
  padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
};

const btnSecondary = {
  background: 'transparent', color: C.text,
  border: `0.5px solid ${C.borderEm}`,
  fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 13,
  padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);

  const loadDocs = async () => {
    try {
      const res = await axios.get(API + '/documents');
      setDocs(res.data);
    } catch (e) {}
  };

  useEffect(() => { loadDocs(); }, []);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append('document', file);
    const res = await axios.post(API + '/documents/upload', form);
    setDocId(res.data.documentId);
    setFile(null);
    setLoading(false);
    loadDocs();
  };

  const search = async () => {
    if (!query) return;
    const res = await axios.get(API + '/search?q=' + query);
    setResults(res.data);
  };

  const cleanResult = (text: string) => {
    return text
      .replace(/```json\n?|\n?```/g, '')
      .replace(/\/\/.*/g, '')
      .substring(0, 300);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 180, background: C.bg, borderRight: `0.5px solid ${C.border}`, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -1 }}>Doc</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: C.accent, letterSpacing: -1 }}>Flow</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['Documents', 'Search', 'Agents'].map(item => (
            <div key={item} style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13, color: item === 'Documents' ? C.accent : C.muted, background: item === 'Documents' ? `${C.accent}10` : 'transparent' }}>
              {item}
            </div>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '48px 64px', display: 'flex', flexDirection: 'column', gap: 48 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 28, letterSpacing: -0.5 }}>Documents</h1>
          <p style={{ color: C.muted, fontSize: 14 }}>Upload, process and search your documents.</p>
        </div>

        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.data }}>STEP 01 — UPLOAD</span>
          <input type="file" onChange={(e: any) => setFile(e.target.files[0])} accept=".pdf,.png,.jpg,.jpeg" style={{ color: C.muted, fontSize: 13 }} />
          <button onClick={upload} disabled={!file || loading} style={{ ...btnPrimary, opacity: file ? 1 : 0.4 }}>
            {loading ? 'PROCESSING...' : 'UPLOAD DOCUMENT'}
          </button>
          {docId && <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.accent }}>✅ {docId.slice(0, 10)}...</p>}
        </div>

        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 18 }}>Latest Documents</h2>
            <button onClick={loadDocs} style={btnSecondary}>REFRESH</button>
          </div>
          {docs.map((d: any) => (
            <div key={d.id} style={{ borderBottom: `0.5px solid ${C.border}`, padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.muted, marginRight: 12 }}>{d.id.slice(0, 8)}</span>
                  <span style={{ fontSize: 14 }}>{d.originalName}</span>
                </div>
                <span style={badgeStyle(d.status === 'COMPLETED' ? C.accent : d.status === 'FAILED' ? '#EF4444' : '#F59E0B')}>{d.status}</span>
              </div>
              {d.status === 'COMPLETED' && d.extractedData && (
                <div style={{ background: C.surface2, borderRadius: 8, padding: 16, marginTop: 8 }}>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: C.data, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Extracted Data
                  </p>
                  {d.extractedData.result ? (
                    <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                      {typeof d.extractedData.result === 'string' 
                        ? cleanResult(d.extractedData.result)
                        : JSON.stringify(d.extractedData.result).substring(0, 300)}
                    </p>
                  ) : (
                    <p style={{ fontFamily: 'DM Mono', fontSize: 11, color: C.muted }}>No data extracted</p>
                  )}
                  {d.extractedData.category && (
                    <span style={{ ...badgeStyle(C.agent), marginTop: 8, display: 'inline-block' }}>
                      {d.extractedData.category}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          {docs.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>No documents yet.</p>}
        </div>

        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 32 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents..."
              style={{ flex: 1, background: C.surface2, border: `0.5px solid ${C.borderEm}`, borderRadius: 8, padding: '10px 14px', fontFamily: 'DM Mono, monospace', fontSize: 12, color: C.data }} />
            <button onClick={search} style={btnSecondary}>SEARCH</button>
          </div>
        </div>

        {results.map((r: any) => (
          <div key={r.id} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{r.originalName}</h3>
              <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}>{r.content?.substring(0, 250)}...</p>
            </div>
            <span style={badgeStyle(C.accent)}>indexed</span>
          </div>
        ))}
      </main>
    </div>
  );
}