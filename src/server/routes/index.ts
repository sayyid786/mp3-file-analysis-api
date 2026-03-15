import Router from 'express';
const router = Router();

import mp3FileAnalysisRouter from './mp3-file-analysis.router';

router.use('/', mp3FileAnalysisRouter);

export default router;
