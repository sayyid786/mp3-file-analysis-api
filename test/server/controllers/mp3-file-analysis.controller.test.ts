import { describe, it } from 'mocha';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { fileUpload } from '../../../src/server/controllers/mp3-file-analysis.controller';
import mockLogger from '../../helpers/logger.helper';

chai.use(sinonChai);

describe('mp3-file-analysis.controller', () => {
  describe('fileUpload', () => {
    it('responds with 200 and an acknowledgement message', async () => {
      const req = {
        logger: mockLogger,
      } as any;
      const jsonStub = sinon.stub();
      const statusStub = sinon.stub().returns({ json: jsonStub });
      const res = { status: statusStub } as any;

      await fileUpload(req, res);

      expect(statusStub).to.be.calledOnceWith(200);
      expect(jsonStub).to.be.calledOnceWith({
        message: 'file upload received',
      });
    });
  });
});
