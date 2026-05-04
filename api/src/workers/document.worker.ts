import dotenv from 'dotenv';
dotenv.config();

import { getDocument, updateDocumentStatus } from '../config/database';
import { imageToText, pdfToText } from '../services/ocr.service';
import { extractDocumentData } from '../services/groq.service';
import path from 'path';

export async function processDocument(documentId: string, filePath: string) {
  try {
    await updateDocumentStatus(documentId, 'PROCESSING');

    const ext = path.extname(filePath).toLowerCase();
    let ocrText = '';

    if (ext === '.pdf') {
      ocrText = await pdfToText(filePath);
    } else {
      ocrText = await imageToText(filePath);
    }

    if (!ocrText.trim()) {
      throw new Error('Nenhum texto extraído do documento');
    }

    console.log('📝 Texto extraído: ' + ocrText.substring(0, 200) + '...');

    const extractedData = await extractDocumentData(ocrText);
    console.log('🤖 Dados extraídos:', JSON.stringify(extractedData, null, 2));

    await updateDocumentStatus(documentId, 'COMPLETED', {
      ocrText: ocrText.substring(0, 10000),
      extractedData: extractedData,
    });

    console.log('✨ Documento ' + documentId + ' processado com sucesso');
  } catch (error: any) {
    console.error('Erro ao processar documento ' + documentId + ':', error);
    await updateDocumentStatus(documentId, 'FAILED', {
      errorMessage: error?.message || 'Erro desconhecido',
    });
  }
}