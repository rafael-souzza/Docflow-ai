const { validateFile, sanitizeFilename, ensureUploadDir } = require('../utils/file.utils');
const { documentQueue } = require('../services/queue.service');
const path = require('path');
const fs = require('fs/promises');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function uploadDocument(req: any, res: any) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const validationError = validateFile(req.file.mimetype, req.file.size);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    ensureUploadDir(UPLOAD_DIR);

    const sanitized = sanitizeFilename(req.file.originalname);
    const filePath = path.join(UPLOAD_DIR, sanitized);
    await fs.writeFile(filePath, req.file.buffer);

    const { createDocument } = require('../config/database');
    const { v4: uuidv4 } = require('uuid');
    const doc = await createDocument({
      id: uuidv4(),
      filename: sanitized,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      filePath: filePath,
    });

    await documentQueue.add(doc.id, filePath);

    return res.status(202).json({
      message: 'Documento enviado para processamento',
      documentId: doc.id,
      status: 'UPLOADED',
      queuePosition: documentQueue.getQueueLength()
    });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getDocumentStatus(req: any, res: any) {
  try {
    const { getDocument } = require('../config/database');
    const doc = await getDocument(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    return res.json(doc);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function listDocuments(req: any, res: any) {
  try {
    const { query } = require('../config/database');
    const result = await query('SELECT id, "originalName", status, "extractedData", "createdAt" FROM "Document" ORDER BY "createdAt" DESC LIMIT 20');
    return res.json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}