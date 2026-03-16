import { describe, it } from 'mocha';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { fileUpload } from '../../../src/server/controllers/mp3FileAnalysis.controller';
import mockLogger from '../../helpers/logger.helper';

chai.use(sinonChai);

describe('mp3FileAnalysis.controller', () => {
  describe('fileUpload', () => {
    it('responds with 200 and returns the frame count', async () => {
      const fileBytes = Buffer.from([
        0xff,
        0xfb,
        0x90,
        0x00,
        ...new Array(413).fill(0x00),
      ]);
      const req = {
        logger: mockLogger,
        file: {
          buffer: fileBytes,
          mimetype: 'audio/mpeg',
        },
      } as any;

      const jsonStub = sinon.stub();
      const statusStub = sinon.stub().returns({ json: jsonStub });
      const res = { status: statusStub } as any;

      await fileUpload(req, res);

      expect(statusStub).to.be.calledOnceWith(200);
      expect(jsonStub).to.be.calledOnceWith({ frameCount: 1 });
    });

    it('responds with 400 when no file is provided', async () => {
      const req = {
        logger: mockLogger,
        file: undefined,
      } as any;

      const jsonStub = sinon.stub();
      const statusStub = sinon.stub().returns({ json: jsonStub });
      const res = { status: statusStub } as any;

      await fileUpload(req, res);

      expect(statusStub).to.be.calledOnceWith(400);
      expect(jsonStub).to.be.calledOnceWith({
        message: 'No MP3 file found in request',
      });
    });

    it('responds with 400 when uploaded file is not an mp3', async () => {
      const req = {
        logger: mockLogger,
        file: {
          buffer: Buffer.from([0x00, 0x01]),
          mimetype: 'audio/wav',
        },
      } as any;

      const jsonStub = sinon.stub();
      const statusStub = sinon.stub().returns({ json: jsonStub });
      const res = { status: statusStub } as any;

      await fileUpload(req, res);

      expect(statusStub).to.be.calledOnceWith(400);
      expect(jsonStub).to.be.calledOnceWith({
        message: 'Only MP3 files are supported',
      });
    });

    it('responds with 400 when uploaded file is empty', async () => {
      const req = {
        logger: mockLogger,
        file: {
          buffer: Buffer.alloc(0),
          mimetype: 'audio/mpeg',
        },
      } as any;

      const jsonStub = sinon.stub();
      const statusStub = sinon.stub().returns({ json: jsonStub });
      const res = { status: statusStub } as any;

      await fileUpload(req, res);

      expect(statusStub).to.be.calledOnceWith(400);
      expect(jsonStub).to.be.calledOnceWith({
        message: 'Uploaded MP3 file is empty',
      });
    });
  });
});
