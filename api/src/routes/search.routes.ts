import { Router } from 'express';
import { searchDocuments } from '../controllers/search.controller';

const router = Router();
router.get('/', searchDocuments);
export default router;
