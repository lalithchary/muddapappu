import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const dir = path.resolve(process.cwd(), 'public');
  await fs.mkdir(dir, { recursive: true });

  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0A0A0B"/><path d="M6 20l6-12 4 7 3-5 3 10" fill="none" stroke="#FF4D2E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  await fs.writeFile(path.join(dir, 'favicon.svg'), favicon, 'utf8');

  const icon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${size / 8}" fill="#0A0A0B"/><path d="M${size * 0.12} ${size * 0.62}l${size * 0.18} -${size * 0.36} ${size * 0.1} ${size * 0.17} ${size * 0.15} -${size * 0.25} ${size * 0.12} ${size * 0.3} ${size * 0.1} ${size * 0.04}" fill="none" stroke="#FF4D2E" stroke-width="${size * 0.05}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  await sharp(Buffer.from(icon(192))).png().toFile(path.join(dir, 'icon-192.png'));
  await sharp(Buffer.from(icon(512))).png().toFile(path.join(dir, 'icon-512.png'));

  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0A0A0B"/><rect x="0" y="0" width="1200" height="630" fill="url(#g)"/><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF4D2E"/><stop offset="1" stop-color="#0A0A0B"/></linearGradient></defs><text x="600" y="340" font-family="system-ui" font-size="72" font-weight="800" fill="white" text-anchor="middle">Sasta<span fill="white">Deal</span></text><text x="600" y="420" font-family="system-ui" font-size="30" fill="#E8E8EC" text-anchor="middle">Best deals in India</text></svg>`;
  await sharp(Buffer.from(og)).png().toFile(path.join(dir, 'og-image.png'));

  console.log('[assets] Wrote favicon.svg, icon-192.png, icon-512.png, og-image.png (real PNGs)');
}

main().catch((err) => { console.error(err); process.exit(1); });