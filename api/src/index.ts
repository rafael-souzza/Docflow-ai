import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import documentRoutes from './routes/document.routes';
import indexRoutes from './routes/index.routes';
import searchRoutes from './routes/search.routes';
import { documentQueue } from './services/queue.service';
import { processDocument } from './workers/document.worker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

documentQueue.setHandler(processDocument);

app.get('/', (req, res) => {
  res.json({ 
    message: 'DocFlow AI - Backend rodando com sucesso! 🚀',
    status: 'online',
    queueSize: documentQueue.getQueueLength()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/documents', documentRoutes);
app.use('/api/documents', indexRoutes);
app.use('/api/search', searchRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📄 Upload: POST http://localhost:${PORT}/api/documents/upload`);
  console.log(`📑 Indexar: POST http://localhost:${PORT}/api/documents/:id/index`);
  console.log(`🔍 Busca: GET http://localhost:${PORT}/api/search?q=...`);
});