import { Router } from 'express';
import { indexDocument } from '../controllers/index.controller';

const router = Router();
router.post('/:id/index', indexDocument);
export default router;