import Router from 'express';
const router = Router();

import { fileUpload } from '../controllers/mp3-file-analysis.controller';

router.post('/file-upload', fileUpload);

export default router;
