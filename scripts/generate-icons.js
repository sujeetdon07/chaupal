import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, body, crcBuf]);
}

function createPng(size) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8);   // bit depth 8
  ihdr.writeUInt8(6, 9);   // RGBA
  ihdr.writeUInt8(0, 10);  // deflate
  ihdr.writeUInt8(0, 11);  // filter
  ihdr.writeUInt8(0, 12);  // no interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Generate image data (Chaupal Radio icon with dark green background and amber accents)
  const rowBytes = 1 + size * 4;
  const rawData = Buffer.alloc(rowBytes * size);

  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.44;
  const rInner = size * 0.40;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter 0

    for (let x = 0; x < size; x++) {
      const p = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Base background: #182019
      let r = 24;
      let g = 32;
      let b = 25;
      let a = 255;

      // Outer gold circle ring
      if (dist >= rInner && dist <= rOuter) {
        r = 215; g = 167; b = 92; // #d7a75c
      } else if (dist < rInner) {
        // Subtle radial gradient
        const t = dist / rInner;
        r = Math.round(36 * (1 - t) + 20 * t);
        g = Math.round(48 * (1 - t) + 26 * t);
        b = Math.round(37 * (1 - t) + 21 * t);

        // Radio box: width 0.45 * size, height 0.32 * size
        const bw = size * 0.45;
        const bh = size * 0.32;
        const bx0 = cx - bw / 2;
        const bx1 = cx + bw / 2;
        const by0 = cy - bh / 4;
        const by1 = by0 + bh;

        if (x >= bx0 && x <= bx1 && y >= by0 && y <= by1) {
          // Inside radio body
          const border = 3 * (size / 192);
          if (x < bx0 + border || x > bx1 - border || y < by0 + border || y > by1 - border) {
            r = 215; g = 167; b = 92; // Gold border
          } else {
            // Speaker grill
            const spX = bx0 + bw * 0.32;
            const spY = by0 + bh * 0.52;
            const spDist = Math.sqrt((x - spX) * (x - spX) + (y - spY) * (y - spY));
            const spR = bh * 0.32;
            if (spDist <= spR) {
              if (spDist <= spR * 0.4) {
                r = 215; g = 167; b = 92;
              } else if (spDist >= spR * 0.8) {
                r = 215; g = 167; b = 92;
              } else {
                r = 15; g = 20; b = 16;
              }
            } else {
              // Screen / Dial
              const scX0 = bx0 + bw * 0.65;
              const scX1 = bx0 + bw * 0.88;
              const scY0 = by0 + bh * 0.28;
              const scY1 = by0 + bh * 0.52;
              if (x >= scX0 && x <= scX1 && y >= scY0 && y <= scY1) {
                r = 239; g = 197; b = 121; // Glow screen
              } else {
                r = 30; g = 38; b = 30;
              }
            }
          }
        }

        // Radio antenna
        const ax0 = cx - bw * 0.25;
        const ay0 = cy - bh / 4;
        const ax1 = ax0 - size * 0.08;
        const ay1 = ay0 - size * 0.15;
        // distance to line segment
        const l2 = (ax1 - ax0) * (ax1 - ax0) + (ay1 - ay0) * (ay1 - ay0);
        const lT = Math.max(0, Math.min(1, ((x - ax0) * (ax1 - ax0) + (y - ay0) * (ay1 - ay0)) / l2));
        const px = ax0 + lT * (ax1 - ax0);
        const py = ay0 + lT * (ay1 - ay0);
        const lineDist = Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
        if (lineDist <= 2 * (size / 192)) {
          r = 215; g = 167; b = 92;
        }
      }

      rawData[p] = r;
      rawData[p + 1] = g;
      rawData[p + 2] = b;
      rawData[p + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const icon192 = createPng(192);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
console.log('Created icon-192.png (' + icon192.length + ' bytes)');

const icon512 = createPng(512);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
console.log('Created icon-512.png (' + icon512.length + ' bytes)');
