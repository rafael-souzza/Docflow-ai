import { getDocument, query } from '../config/database';
import { generateEmbedding, generateChunks } from '../services/embedding.service';
import { v4 as uuidv4 } from 'uuid';

export async function indexDocument(req: any, res: any) {
  try {
    const doc = await getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento nao encontrado' });
    if (!doc.ocrText) return res.status(400).json({ error: 'Documento sem texto extraido' });

    const chunks = await generateChunks(doc.ocrText);
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      await query(
        'INSERT INTO "DocumentChunk" (id, "documentId", content, embedding) VALUES ($1, $2, $3, $4)',
        [uuidv4(), doc.id, chunk, JSON.stringify(embedding)]
      );
    }

    return res.json({ message: 'Indexado com sucesso', chunks: chunks.length });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}