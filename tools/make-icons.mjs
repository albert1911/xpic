// Generates icon-192.png, icon-512.png (maskable-safe) with no dependencies.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, c]);
};

function png(size) {
  const bg = [15, 17, 21], fg = [214, 51, 127], white = [255, 255, 255];
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const s = size / 512;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let px = bg;
      const X = x / s, Y = y / s;
      // picture frame
      if (X > 136 && X < 376 && Y > 156 && Y < 356) {
        px = white;
        if (X > 152 && X < 360 && Y > 172 && Y < 340) {
          px = fg;
          // sun
          if ((X - 300) ** 2 + (Y - 224) ** 2 < 24 ** 2) px = white;
          // mountain
          if (Y > 270 && Y > 340 - (X - 152) * 0.5 && X < 256) px = white;
          if (Y > 290 && Y > 340 - (360 - X) * 0.45 && X >= 256) px = white;
        }
      }
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = px[0]; raw[o + 1] = px[1]; raw[o + 2] = px[2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0)),
  ]);
}
for (const n of [192, 512]) writeFileSync(`icon-${n}.png`, png(n));
