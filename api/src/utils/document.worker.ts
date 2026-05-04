import { PrismaClient } from '../generated/prisma';
import { imageToText, pdfToText } from '../services/ocr.service';
import { extractDocumentData } from '../services/groq.service';
import path from 'path'

const prisma = new (PrismaClient as any)();

export async function processDocument(documentId: string, filePath: string): Promise<void> {
  try {
    await (prisma as any).document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' }
    });

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

    console.log(`📝 Texto extraído: ${ocrText.substring(0, 200)}...`);

    const extractedData = await extractDocumentData(ocrText);
    console.log('🤖 Dados extraídos:', JSON.stringify(extractedData, null, 2));

    await (prisma as any).document.update({
      where: { id: documentId },
      data: {
        status: 'COMPLETED',
        ocrText: ocrText.substring(0, 10000),
        extractedData: extractedData,
        processedAt: new Date()
      }
    });

    console.log(`✨ Documento ${documentId} processado com sucesso`);

  } catch (error) {
    console.error(`Erro ao processar documento ${documentId}:`, error);
    
    await (prisma as any).document.update({
      where: { id: documentId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    });
  }
}