import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs/promises';

export async function imageToText(imagePath: string): Promise<string> {
  try {
    const compressedPath = imagePath.replace(/(\.\w+)$/, '_compressed$1');
    await sharp(imagePath)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .jpeg({ quality: 85 })
      .toFile(compressedPath);

    const result = await Tesseract.recognize(compressedPath, 'por+eng', {
      errorHandler: (err) => console.warn('Tesseract warning:', err.message)
    });

    await fs.unlink(compressedPath).catch(() => {});

    return result.data.text;
  } catch (error) {
    console.error('Erro no OCR:', error);
    throw new Error('Falha ao processar imagem com OCR');
  }
}

export async function pdfToText(pdfPath: string): Promise<string> {
  const pdfParse = require('pdf-parse');
  
  const dataBuffer = await fs.readFile(pdfPath);
  const data = await pdfParse(dataBuffer);
  
  console.log(`📄 PDF processado: ${data.numpages} páginas, ${data.text.length} caracteres`);
  
  return data.text.substring(0, 8000);
}