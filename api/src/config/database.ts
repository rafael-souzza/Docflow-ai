import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/docflow',
});

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
}

export async function createDocument(data: any) {
  const result = await pool.query(
    `INSERT INTO "Document" (id, filename, "originalName", "mimeType", size, "filePath", status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, 'UPLOADED', NOW(), NOW()) RETURNING *`,
    [data.id, data.filename, data.originalName, data.mimeType, data.size, data.filePath]
  );
  return result.rows[0];
}

export async function updateDocumentStatus(id: string, status: string, extra: any = {}) {
  const result = await pool.query(
    `UPDATE "Document" SET status = $1, "ocrText" = $2, "extractedData" = $3, "errorMessage" = $4, "processedAt" = $5, "updatedAt" = NOW()
     WHERE id = $6 RETURNING *`,
    [status, extra.ocrText || null, extra.extractedData ? JSON.stringify(extra.extractedData) : null, extra.errorMessage || null, status === 'COMPLETED' || status === 'FAILED' ? new Date() : null, id]
  );
  return result.rows[0];
}

export async function getDocument(id: string) {
  const result = await pool.query('SELECT * FROM "Document" WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export default pool;
