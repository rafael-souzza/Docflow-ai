import { Router } from 'express';
import multer from 'multer';
import { uploadDocument, getDocumentStatus, listDocuments } from '../controllers/document.controller';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/:id/status', getDocumentStatus);
router.get('/', listDocuments);

export default router;