import sharp from 'sharp';
const [out, cols, size, ...files] = process.argv.slice(2);
const c = +cols, s = +size;
const rows = Math.ceil(files.length / c);
const tiles = await Promise.all(files.map(async (f, i) => ({ input: await sharp(f).resize(s, s, { fit: 'contain', background: '#000' }).toBuffer(), left: (i % c) * s, top: Math.floor(i / c) * s })));
await sharp({ create: { width: c * s, height: rows * s, channels: 3, background: '#000' } }).composite(tiles).png().toFile(out);
console.log(out);
