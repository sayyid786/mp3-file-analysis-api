import { Request, Response } from 'express';
import { getMpeg1Layer3FrameCount } from '../services/mp3FileAnalysis.service';

const moduleName = '/server/controllers/mp3FileAnalysis.controller';

export const fileUpload = async (req: Request, res: Response) => {
  const log = req.logger.child({
    module: moduleName,
    function: 'fileUpload',
  });

  log.verbose('received POST /file-upload');

  const uploadedFile = req.file;

  if (!uploadedFile || !Buffer.isBuffer(uploadedFile.buffer)) {
    res.status(400).json({ message: 'No MP3 file found in request' });
    return;
  }

  if (!['audio/mpeg', 'audio/mp3'].includes(uploadedFile.mimetype)) {
    res.status(400).json({ message: 'Only MP3 files are supported' });
    return;
  }

  if (uploadedFile.buffer.length === 0) {
    res.status(400).json({ message: 'Uploaded MP3 file is empty' });
    return;
  }

  const result = getMpeg1Layer3FrameCount(uploadedFile.buffer);

  res.status(200).json(result);
};
