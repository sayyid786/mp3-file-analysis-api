import Router from 'express';
const router = Router();

import mp3FileAnalysisRouter from './mp3FileAnalysis.router';

router.use('/', mp3FileAnalysisRouter);

export default router;
