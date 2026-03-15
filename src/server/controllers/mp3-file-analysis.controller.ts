import { Request, Response } from 'express';

const moduleName = '/server/controllers/mp3-file-analysis.controller';

export const fileUpload = async (req: Request, res: Response) => {
  const log = req.logger.child({
    module: moduleName,
    function: 'fileUpload',
  });

  log.verbose('recieved POST /file-upload');

  res.status(200).json({ message: 'file upload received' });
};
