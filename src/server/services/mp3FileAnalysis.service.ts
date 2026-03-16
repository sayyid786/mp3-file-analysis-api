import { Mp3AnalysisResult } from '../../types/Mp3Analysis';
import * as winston from '../../utils/winston.util';

const moduleName = '/server/services/mp3FileAnalysis.service';

// MPEG1 Layer 3 stores bitrate as a 4-bit index in the frame header rather than
// the bitrate value itself. This table converts that index into kbps.
// Index 0 means "free bitrate" and 15 is reserved/invalid, so both are treated
// as unusable during validation.
const BITRATE_TABLE = [
  0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1,
] as const;

// MPEG1 stores sample rate as a 2-bit index. The final entry is reserved and is
// rejected later by checking for values less than or equal to zero.
const SAMPLERATE_TABLE = [44100, 48000, 32000, -1] as const;

// Returns the total byte length of a leading ID3v2 tag, or 0 when absent.
// MP3 files often begin with metadata before the first audio frame. The frame
// scanner needs to skip over that region or it may try to parse metadata bytes
// as MPEG headers.
function getId3TagOffset(fileBuffer: Buffer): number {
  if (fileBuffer.length < 10) return 0;
  if (fileBuffer.subarray(0, 3).toString('ascii') !== 'ID3') return 0;

  // ID3v2 stores the tag payload size in bytes 6-9 of the 10-byte header.
  // This value is encoded as a 28-bit "syncsafe" integer, where each byte uses
  // only 7 bits. Rebuilding the number means shifting each 7-bit chunk into its
  // correct position and combining them into one integer.
  //
  // Byte layout:
  //   byte 6 -> bits 27..21
  //   byte 7 -> bits 20..14
  //   byte 8 -> bits 13..7
  //   byte 9 -> bits 6..0
  const id3Size =
    (fileBuffer[6] << 21) |
    (fileBuffer[7] << 14) |
    (fileBuffer[8] << 7) |
    fileBuffer[9];

  // The stored size excludes the 10-byte ID3 header itself, so add it back to
  // get the first possible audio-frame offset.
  return 10 + id3Size;
}

// FrameSize = floor(144 * Bitrate / SampleRate) + Padding
// For MPEG1 Layer 3 this gives the byte length of the current frame, which lets
// the scanner jump directly to the next frame candidate when a header is valid.
function getFrameSize(fileBuffer: Buffer, offset: number): number {
  const header = fileBuffer.readUInt32BE(offset);

  // The first 11 bits of a valid MPEG audio frame header are all 1s.
  // Reject anything that does not begin with that sync pattern.
  if (((header >> 21) & 0x7ff) !== 0x7ff) return 0;

  // This service only supports MPEG Version 1 Audio Layer 3.
  // Version bits must be 0b11 and layer bits must be 0b01.
  if (((header >> 19) & 0x03) !== 0x03 || ((header >> 17) & 0x03) !== 0x01) {
    return 0;
  }

  // Extract bitrate and sample-rate indices from the header, then map them to
  // their real values using the lookup tables above.
  const bitrate = BITRATE_TABLE[(header >> 12) & 0x0f] * 1000;
  const sampleRate = SAMPLERATE_TABLE[(header >> 10) & 0x03];

  // Invalid index combinations map to 0 or -1 and are rejected here.
  if (bitrate <= 0 || sampleRate <= 0) return 0;

  // Bit 9 is the padding bit. When set, one extra byte is added to the frame.
  const frameSize =
    Math.floor((144 * bitrate) / sampleRate) + ((header >> 9) & 0x01);

  return frameSize;
}

// Scans MPEG Version 1 Audio Layer 3 bytes and counts valid audio frames.
// The parser is intentionally tolerant: on invalid data it advances by one byte
// and keeps searching so it can recover after metadata, junk bytes, or partial
// corruption instead of failing the whole file.
// Scalability note: this implementation parses a full in-memory Buffer. For
// larger workloads, prefer a chunked stream parser and consider worker-thread
// offload so CPU-bound parsing does not block the event loop.
export function getMpeg1Layer3FrameCount(bytes: Buffer): Mp3AnalysisResult {
  const log = winston
    .getLogger()
    .child({ module: moduleName, function: 'getMpeg1Layer3FrameCount' });

  log.verbose('starting MPEG1 Layer 3 frame analysis');

  if (!Buffer.isBuffer(bytes) || bytes.length < 4) {
    log.debug('invalid audio buffer for frame analysis');
    return { frameCount: 0 };
  }

  let offset = getId3TagOffset(bytes);
  let frameCount = 0;

  log.debug('starting frame scan at offset: %d', offset);

  while (offset + 4 <= bytes.length) {
    const frameSize = getFrameSize(bytes, offset);

    // Advance one byte when the current position is not a valid frame start, or
    // when the declared frame length would run past the end of the buffer.
    if (frameSize === 0 || offset + frameSize > bytes.length) {
      offset += 1;
      continue;
    }

    // A valid frame lets us skip directly to the next candidate header.
    offset += frameSize;
    frameCount += 1;
  }

  log.verbose(
    'completed MPEG1 Layer 3 frame analysis, frameCount: %d',
    frameCount,
  );

  return { frameCount };
}
