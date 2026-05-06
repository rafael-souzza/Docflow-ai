import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

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
  const { fromPath } = require('pdf2pic');
  const outputDir = path.dirname(pdfPath);
  
  const options = {
    density: 150,
    saveFilename: path.basename(pdfPath, '.pdf'),
    savePath: outputDir,
    format: 'png',
    width: 1200,
    height: 1600,
  };

  const convert = fromPath(pdfPath, options);
  const result = await convert(1); // só primeira página
  
  if (!result?.path) throw new Error('Falha ao converter PDF');
  
  const text = await imageToText(result.path);
  await fs.unlink(result.path).catch(() => {});
  
  console.log('PDF processado via OCR');
  return text.substring(0, 8000);
}