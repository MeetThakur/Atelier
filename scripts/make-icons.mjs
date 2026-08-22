import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets');
fs.mkdirSync(outDir, { recursive: true });

const CREAM = [247, 244, 238];
const TERRA = [184, 108, 94];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function heartInside(x, y) {
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}

function drawHeart(size, { background, heartScale }) {
  const rgba = Buffer.alloc(size * size * 4);
  const S = 3;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let hit = 0;
      for (let sy = 0; sy < S; sy++) {
        for (let sx = 0; sx < S; sx++) {
          const x = ((px + (sx + 0.5) / S) / size * 2 - 1) / heartScale;
          const y = -( (py + (sy + 0.5) / S) / size * 2 - 1 ) / heartScale + 0.08;
          if (heartInside(x, y)) hit++;
        }
      }
      const cov = hit / (S * S);
      const i = (py * size + px) * 4;
      const rgb = background
        ? background.map((b, ch) => Math.round(b * (1 - cov) + TERRA[ch] * cov))
        : TERRA;
      rgba[i] = rgb[0]; rgba[i + 1] = rgb[1]; rgba[i + 2] = rgb[2];
      rgba[i + 3] = background ? 255 : Math.round(cov * 255);
    }
  }
  return rgba;
}

fs.writeFileSync(path.join(outDir, 'icon.png'), encodePNG(1024, drawHeart(1024, { background: CREAM, heartScale: 0.62 })));
fs.writeFileSync(path.join(outDir, 'adaptive-icon.png'), encodePNG(1024, drawHeart(1024, { background: CREAM, heartScale: 0.44 })));
fs.writeFileSync(path.join(outDir, 'splash-icon.png'), encodePNG(512, drawHeart(512, { background: null, heartScale: 0.42 })));
console.log('assets written to', outDir);
