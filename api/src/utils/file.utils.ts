import path from 'path';
import fs from 'fs';

export const ALLOWED_MIMES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/tiff'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(mimetype: string, size: number): string | null {
  if (!ALLOWED_MIMES.includes(mimetype)) {
    return `Tipo não permitido: ${mimetype}. Use PDF, PNG, JPG ou TIFF.`;
  }
  if (size > MAX_FILE_SIZE) {
    return `Arquivo muito grande. Máximo: 10MB.`;
  }
  return null;
}

export function sanitizeFilename(original: string): string {
  const ext = path.extname(original);
  const name = path.basename(original, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 100);
  return `${name}-${Date.now()}${ext}`;
}

export function ensureUploadDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}