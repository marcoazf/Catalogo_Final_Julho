// Gera o ícone do CineCatalog Elo (build/icon.png e build/icon.ico)
// Desenha um cartaz de filme com trilha de filme (sprocket holes) e um play.
// Uso: node scripts/make-icon.js
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const S = 256;

function inRoundedRect(px, py, x0, y0, x1, y1, r) {
    const cx = Math.min(Math.max(px, x0 + r), x1 - r);
    const cy = Math.min(Math.max(py, y0 + r), y1 - r);
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= r * r;
}

function inTriangle(px, py, ax, ay, bx, by, cx, cy) {
    function sign(x1, y1, x2, y2, x3, y3) {
        return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
    }
    const d1 = sign(px, py, ax, ay, bx, by);
    const d2 = sign(px, py, bx, by, cx, cy);
    const d3 = sign(px, py, cx, cy, ax, ay);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
}

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function makeArtwork() {
    const png = new PNG({ width: S, height: S });
    const bgTop = hexToRgb('#0a1120');
    const bgBottom = hexToRgb('#132140');
    const border = hexToRgb('#4f8cff');
    const track = hexToRgb('#16233f');
    const hole = hexToRgb('#dfe9ff');
    const frameFill = hexToRgb('#0e1930');
    const play = hexToRgb('#9dbcff');

    for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
            const idx = (y * S + x) * 4;
            const t = y / (S - 1);
            let r = Math.round(bgTop[0] + (bgBottom[0] - bgTop[0]) * t);
            let g = Math.round(bgTop[1] + (bgBottom[1] - bgTop[1]) * t);
            let b = Math.round(bgTop[2] + (bgBottom[2] - bgTop[2]) * t);
            let a = 255;

            // Corpo arredondado
            if (!inRoundedRect(x, y, 4, 4, S - 5, S - 5, 44)) {
                a = 0;
            }

            if (a === 255) {
                // Borda
                if (!inRoundedRect(x, y, 4, 4, S - 5, S - 5, 44 - 7) && inRoundedRect(x, y, 4, 4, S - 5, S - 5, 44)) {
                    r = border[0]; g = border[1]; b = border[2];
                }
                // Trilhas de filme (topo e base)
                for (const stripY of [26, 216]) {
                    if (inRoundedRect(x, y, 14, stripY, S - 15, stripY + 14, 6)) {
                        r = track[0]; g = track[1]; b = track[2];
                    }
                }
                // Sprocket holes
                for (let hx = 34; hx <= 222; hx += 21) {
                    if (inRoundedRect(x, y, hx, 30, hx + 10, 36, 3)) { r = hole[0]; g = hole[1]; b = hole[2]; }
                    if (inRoundedRect(x, y, hx, 220, hx + 10, 226, 3)) { r = hole[0]; g = hole[1]; b = hole[2]; }
                }
                // Cartaz central (frame)
                if (inRoundedRect(x, y, 48, 62, 208, 194, 16)) {
                    r = frameFill[0]; g = frameFill[1]; b = frameFill[2];
                }
                if (inRoundedRect(x, y, 48, 62, 208, 194, 16) && !inRoundedRect(x, y, 56, 70, 200, 186, 11)) {
                    r = border[0]; g = border[1]; b = border[2];
                }
                // Play triângulo
                if (inTriangle(x, y, 108, 96, 108, 160, 168, 128)) {
                    r = play[0]; g = play[1]; b = play[2];
                }
                // Barra de progresso (linha do player)
                if (y >= 176 && y <= 180 && x >= 68 && x <= 188) {
                    r = border[0]; g = border[1]; b = border[2];
                }
                if (y >= 176 && y <= 180 && x >= 188 && x <= 188 + 0) {
                    r = play[0]; g = play[1]; b = play[2];
                }
            }

            png.data[idx] = r;
            png.data[idx + 1] = g;
            png.data[idx + 2] = b;
            png.data[idx + 3] = a;
        }
    }
    return png;
}

function downscale(src, size) {
    const out = new PNG({ width: size, height: size });
    const srcSize = src.width;
    const scale = srcSize / size;
    for (let oy = 0; oy < size; oy++) {
        for (let ox = 0; ox < size; ox++) {
            let rs = 0, gs = 0, bs = 0, as = 0, n = 0;
            const x0 = Math.floor(ox * scale);
            const x1 = Math.min(srcSize, Math.ceil((ox + 1) * scale));
            const y0 = Math.floor(oy * scale);
            const y1 = Math.min(srcSize, Math.ceil((oy + 1) * scale));
            for (let y = y0; y < y1; y++) {
                for (let x = x0; x < x1; x++) {
                    const idx = (y * srcSize + x) * 4;
                    rs += src.data[idx];
                    gs += src.data[idx + 1];
                    bs += src.data[idx + 2];
                    as += src.data[idx + 3];
                    n++;
                }
            }
            const oidx = (oy * size + ox) * 4;
            out.data[oidx] = Math.round(rs / n);
            out.data[oidx + 1] = Math.round(gs / n);
            out.data[oidx + 2] = Math.round(bs / n);
            out.data[oidx + 3] = Math.round(as / n);
        }
    }
    return out;
}

function buildIco(pngs) {
    const count = pngs.length;
    const headerSize = 6;
    const entrySize = 16;
    let offset = headerSize + count * entrySize;
    const entries = [];
    let body = Buffer.alloc(0);
    for (const p of pngs) {
        const buf = PNG.sync.write(p);
        const entry = Buffer.alloc(entrySize);
        entry.writeUInt8(p.width >= 256 ? 0 : p.width, 0);
        entry.writeUInt8(p.height >= 256 ? 0 : p.height, 1);
        entry.writeUInt8(0, 2);
        entry.writeUInt8(0, 3);
        entry.writeUInt16LE(1, 4);
        entry.writeUInt16LE(32, 6);
        entry.writeUInt32LE(buf.length, 8);
        entry.writeUInt32LE(offset, 12);
        entries.push(entry);
        body = Buffer.concat([body, buf]);
        offset += buf.length;
    }
    const header = Buffer.alloc(headerSize);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(count, 4);
    return Buffer.concat([header, ...entries, body]);
}

const outDir = path.join(__dirname, '..', 'build');
fs.mkdirSync(outDir, { recursive: true });

const base = makeArtwork();
const png256 = downscale(base, 256);
fs.writeFileSync(path.join(outDir, 'icon.png'), PNG.sync.write(png256));

const sizes = [16, 24, 32, 48, 64, 128, 256];
const pngs = sizes.map((s) => (s === 256 ? png256 : downscale(base, s)));
fs.writeFileSync(path.join(outDir, 'icon.ico'), buildIco(pngs));

console.log('Ícone gerado em build/icon.png (256x256) e build/icon.ico (' + sizes.join(',') + 'px)');
