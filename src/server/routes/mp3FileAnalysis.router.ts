import express from 'express';
import multer from 'multer';
import { fileUpload } from '../controllers/mp3FileAnalysis.controller';

const router = express.Router();

const upload = multer({
  // Scalability note: memory storage is simple for this assessment, but for
  // large files/high concurrency prefer streaming or disk-backed uploads.
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

/**
 * @openapi
 * /file-upload:
 *   post:
 *     tags:
 *       - MP3 Analysis
 *     summary: Upload an MP3 file and return the MPEG1 Layer3 frame count.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: MP3 analysis result.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 frameCount:
 *                   type: number
 *                   example: 358
 *       '400':
 *         description: Invalid upload request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/file-upload', upload.single('file'), fileUpload);

export default router;
