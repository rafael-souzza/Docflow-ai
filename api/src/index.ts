import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import documentRoutes from './routes/document.routes';
import indexRoutes from './routes/index.routes';
import searchRoutes from './routes/search.routes';
import { documentQueue } from './services/queue.service';
import { processDocument } from './workers/document.worker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/build')));

documentQueue.setHandler(processDocument);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/documents', documentRoutes);
app.use('/api/documents', indexRoutes);
app.use('/api/search', searchRoutes);


app.listen(PORT, () => {
  console.log(`✅ DocFlow AI rodando em http://localhost:${PORT}`);
});