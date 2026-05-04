import { Request, Response } from 'express';
const { PrismaClient } = require('../generated/prisma');
const { validateFile, sanitizeFilename, ensureUploadDir } = require('../utils/file.utils');
const { documentQueue } = require('../services/queue.service');
const path = require('path');
const fs = require('fs/promises');

const prisma = new PrismaClient({});
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function uploadDocument(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado' });
      return;
    }

    const validationError = validateFile(req.file.mimetype, req.file.size);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    ensureUploadDir(UPLOAD_DIR);

    const sanitized = sanitizeFilename(req.file.originalname);
    const filePath = path.join(UPLOAD_DIR, sanitized);
    await fs.writeFile(filePath, req.file.buffer);

    const document = await prisma.document.create({
      data: {
        filename: sanitized,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        filePath: filePath,
        status: 'UPLOADED'
      }
    });

    await documentQueue.add(document.id, filePath);

    res.status(202).json({
      message: 'Documento enviado para processamento',
      documentId: document.id,
      status: 'UPLOADED',
      queuePosition: documentQueue.getQueueLength()
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}

export async function getDocumentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        originalName: true,
        status: true,
        extractedData: true,
        errorMessage: true,
        createdAt: true,
        processedAt: true
      }
    });

    if (!document) {
      res.status(404).json({ error: 'Documento não encontrado' });
      return;
    }

    res.json(document);

  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}