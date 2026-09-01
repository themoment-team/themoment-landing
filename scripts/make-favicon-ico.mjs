/* Packs public/icon-16.png, -32 and -48 into public/favicon.ico.
 *
 * /favicon.ico is the one icon nobody links to and everything asks for: a
 * browser requests it at the root whether or not the document says to, and
 * it is the fallback for anything that will not read an SVG. It was a 404
 * here, which is not fatal but is a request answered with the whole 12KB
 * not-found page.
 *
 * An .ico is a tiny directory of images. Since Vista those images are
 * allowed to be PNGs rather than BMPs, and every browser in use reads them,
 * so this is a header and three files copied in behind it — no encoder, and
 * the three sizes stay pixel-identical to the PNGs beside them.
 *
 *   node scripts/make-favicon-ico.mjs
 *
 * Run it after re-rendering the PNGs with scripts/search-icon.html.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SIZES = [16, 32, 48];
const HEADER = 6;
const ENTRY = 16;

const images = SIZES.map((size) => ({
  size,
  png: readFileSync(new URL(`../public/icon-${size}.png`, import.meta.url)),
}));

const header = Buffer.alloc(HEADER);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // 1 = icon, 2 = cursor
header.writeUInt16LE(images.length, 4);

/* Every image sits after the header and the whole directory. */
let offset = HEADER + ENTRY * images.length;

const entries = images.map(({ size, png }) => {
  const entry = Buffer.alloc(ENTRY);
  /* One byte per side, so 256 is written as 0. Nothing here is that big. */
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt8(0, 2); // palette size, 0 for truecolour
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});

const ico = Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
const out = new URL("../public/favicon.ico", import.meta.url);
writeFileSync(out, ico);

console.log(`favicon.ico ${ico.length} bytes — ${SIZES.join(", ")}`);
