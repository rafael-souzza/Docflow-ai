import { query } from '../config/database';
import { generateEmbedding } from '../services/embedding.service';

export async function searchDocuments(req: any, res: any) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query "q" obrigatória' });

    const embedding = await generateEmbedding(q);
    const result = await query(
      'SELECT dc.*, d."originalName" FROM "DocumentChunk" dc JOIN "Document" d ON dc."documentId" = d.id ORDER BY dc.embedding <=> $1 LIMIT 5',
      [JSON.stringify(embedding)]
    );

    return res.json(result.rows);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
