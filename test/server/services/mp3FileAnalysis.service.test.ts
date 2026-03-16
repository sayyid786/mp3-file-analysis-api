import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { getMpeg1Layer3FrameCount } from '../../../src/server/services/mp3FileAnalysis.service';
import * as winstonUtil from '../../../src/utils/winston.util';
import mockLogger from '../../helpers/logger.helper';

function createMpeg1Layer3Frame(options?: {
  padding?: number;
  sampleRateIndex?: 0 | 1 | 2;
}): Buffer {
  const padding = options?.padding ?? 0;
  const sampleRateIndex = options?.sampleRateIndex ?? 0;
  const header = Buffer.from([
    0xff,
    0xfb,
    0x90 | (sampleRateIndex << 2) | (padding << 1),
    0x00,
  ]);

  const sampleRateLookup = {
    0: 44100,
    1: 48000,
    2: 32000,
  } as const;
  const sampleRate = sampleRateLookup[sampleRateIndex];
  const frameLength = Math.floor((144 * 128000) / sampleRate) + padding;

  return Buffer.concat([header, Buffer.alloc(frameLength - 4)]);
}

describe('mp3FileAnalysis.service', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(winstonUtil, 'getLogger').returns(mockLogger);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getMpeg1Layer3FrameCount', () => {
    it('returns 0 for an empty buffer', () => {
      expect(getMpeg1Layer3FrameCount(Buffer.alloc(0))).to.deep.equal({
        frameCount: 0,
      });
    });

    it('returns frame count for valid MPEG1 Layer3 bytes', () => {
      const bytes = Buffer.concat([
        createMpeg1Layer3Frame(),
        createMpeg1Layer3Frame({ padding: 1 }),
      ]);

      expect(getMpeg1Layer3FrameCount(bytes)).to.deep.equal({ frameCount: 2 });
    });

    it('skips ID3v2 tag and counts frames after tag', () => {
      const id3Header = Buffer.from([
        0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x05,
      ]);
      const id3Body = Buffer.alloc(5, 0x00);
      const bytes = Buffer.concat([
        id3Header,
        id3Body,
        createMpeg1Layer3Frame(),
      ]);

      expect(getMpeg1Layer3FrameCount(bytes)).to.deep.equal({ frameCount: 1 });
    });

    it('ignores invalid or truncated frames', () => {
      const invalidHeader = Buffer.from([0xff, 0xfb, 0xf0, 0x00]);
      const truncatedFrame = Buffer.from([0xff, 0xfb, 0x90, 0x00, 0x00]);
      const bytes = Buffer.concat([invalidHeader, truncatedFrame]);

      expect(getMpeg1Layer3FrameCount(bytes)).to.deep.equal({ frameCount: 0 });
    });

    it('ignores sync words that do not have a complete 4-byte header', () => {
      const bytes = Buffer.from([0x00, 0x00, 0x00, 0xff, 0xe0, 0x00]);

      expect(getMpeg1Layer3FrameCount(bytes)).to.deep.equal({ frameCount: 0 });
    });

    it('skips headers with invalid MPEG version or layer bits', () => {
      const invalidVersionLayerHeader = Buffer.from([0xff, 0xe2, 0x90, 0x00]);
      const bytes = Buffer.concat([
        invalidVersionLayerHeader,
        createMpeg1Layer3Frame(),
      ]);

      expect(getMpeg1Layer3FrameCount(bytes)).to.deep.equal({ frameCount: 1 });
    });

    it('counts multiple valid frames with the same sample rate', () => {
      const bytes = Buffer.concat([
        createMpeg1Layer3Frame(),
        createMpeg1Layer3Frame(),
        createMpeg1Layer3Frame(),
      ]);

      expect(getMpeg1Layer3FrameCount(bytes)).to.deep.equal({ frameCount: 3 });
    });

    it('counts valid frames even when sample rates differ', () => {
      const bytes = Buffer.concat([
        createMpeg1Layer3Frame({ sampleRateIndex: 0 }),
        createMpeg1Layer3Frame({ sampleRateIndex: 1 }),
      ]);

      expect(getMpeg1Layer3FrameCount(bytes)).to.deep.equal({ frameCount: 2 });
    });
  });
});
