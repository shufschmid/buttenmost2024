// Erzeugt aus einem PNG (z. B. Post-Adressetikette A6, 300 dpi) einen
// Raster-Befehlsstrom (.bin) fuer den Brother QL-1110NWB auf der Endlosrolle 102 mm.
// Die Datei kann im Massenspeicher-Modus des Druckers ohne Treiber gedruckt werden.
// Quelle: Brother "Raster Command Reference QL-1100/1110NWB/1115NWB" v1.00
// (Kap. 2.1 Aufbau, 2.3.2 Seitengroessen, 2.3.5 Rasterzeile, Kap. 4 Befehle).
import * as PImage from "pureimage";
import { Readable, Writable } from "stream";

export const PINS = 1296;              // Pins des Druckkopfs
export const BYTES_PER_ROW = 162;      // 1296 / 8 Bytes pro Rasterzeile
export const PRINT_AREA = 1164;        // 102 mm Endlos: bedruckbare Pins (98,6 mm)
export const RIGHT_MARGIN = 56;        // Pins vor dem Druckbereich im Byte-Strom (Ref. S. 19)
export const MEDIA_WIDTH_MM = 102;
export const MIN_ROWS = 301;           // Endlos: min. 25,4 mm
export const MAX_ROWS = 35434;         // Endlos: max. 3000 mm
export const DEFAULT_FEED_MARGIN = 35; // 3 mm Vorschub-Rand (Minimum bei Endlos)

/** Sammelt, was ein pureimage-Encoder in einen Stream schreibt, als Buffer. */
export function encodeToBuffer(encode) {
  const chunks = [];
  const sink = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    },
  });
  return encode(sink).then(() => Buffer.concat(chunks));
}

/** ESC i z: Print-Information (Medientyp, Breite, Laenge, Anzahl Rasterzeilen). */
function printInfo(rows) {
  return Buffer.from([
    0x1b, 0x69, 0x7a,
    0x8e,                 // gueltig: 0x02 Medientyp | 0x04 Breite | 0x08 Laenge | 0x80 Recovery
    0x0a,                 // Endlosrolle
    MEDIA_WIDTH_MM, 0x00, // Breite 102 mm, Laenge 0 (Endlos)
    rows & 0xff, (rows >> 8) & 0xff, (rows >> 16) & 0xff, (rows >> 24) & 0xff,
    0x00,                 // erste Seite
    0x00,
  ]);
}

/**
 * PNG -> Brother-Raster.
 * Das Bild wird auf reines Schwarz/Weiss reduziert (Schwellwert), bei Bedarf
 * symmetrisch auf den Druckbereich von 1164 Punkten beschnitten (nie skaliert)
 * und zeilenweise in 1296-Bit-Rasterzeilen gepackt (MSB zuerst, Bit 1 = schwarz,
 * horizontal gespiegelt wie beim Brother-Treiber und brother_ql).
 */
export async function pngToBrotherRaster(pngBuffer, opts = {}) {
  const threshold = Math.min(254, Math.max(1, opts.threshold ?? 128));
  const feedMargin = opts.feedMarginDots ?? DEFAULT_FEED_MARGIN;

  const src = await PImage.decodePNGFromStream(Readable.from(pngBuffer));
  let sw = src.width;
  let sh = src.height;
  let sd = src.data; // RGBA, 8 Bit je Kanal

  // Querformat (z. B. Post-A6 kommt als 1748 x 1240 px) um 90 Grad im Uhrzeigersinn
  // drehen, damit die kurze Seite ueber den Druckkopf laeuft und nichts skaliert wird.
  let rotated = false;
  if ((opts.rotate ?? "auto") === "auto" && sw > sh) {
    const nw = sh;
    const nh = sw;
    const nd = new Uint8Array(nw * nh * 4);
    for (let y = 0; y < nh; y++) {
      for (let x = 0; x < nw; x++) {
        const si = ((sh - 1 - x) * sw + y) * 4; // Quelle (sx = y, sy = sh - 1 - x)
        const di = (y * nw + x) * 4;
        nd[di] = sd[si];
        nd[di + 1] = sd[si + 1];
        nd[di + 2] = sd[si + 2];
        nd[di + 3] = sd[si + 3];
      }
    }
    sw = nw;
    sh = nh;
    sd = nd;
    rotated = true;
  }

  if (sh < MIN_ROWS || sh > MAX_ROWS) {
    throw new Error(`Bildhoehe ${sh} Punkte liegt ausserhalb ${MIN_ROWS}..${MAX_ROWS}`);
  }

  const dw = Math.min(sw, PRINT_AREA);
  const dh = sh;
  const cropLeft = Math.floor((sw - dw) / 2);         // links weggeschnittene Spalten
  const areaOffset = Math.floor((PRINT_AREA - dw) / 2); // Zentrierung im Druckbereich
  const lastBit = RIGHT_MARGIN + PRINT_AREA - 1;        // 1219: Bit-Position von Bildspalte 0

  const preview = PImage.make(dw, dh);
  const pd = preview.data;
  const parts = [];
  let croppedDark = 0;

  for (let y = 0; y < sh; y++) {
    const line = Buffer.alloc(3 + BYTES_PER_ROW); // "g" 0x00 0xA2 + 162 Bytes Raster
    line[0] = 0x67;
    line[1] = 0x00;
    line[2] = BYTES_PER_ROW;
    const srow = y * sw * 4;
    const drow = y * dw * 4;
    for (let x = 0; x < sw; x++) {
      const i = srow + x * 4;
      const a = sd[i + 3];
      let lum = (sd[i] * 299 + sd[i + 1] * 587 + sd[i + 2] * 114) / 1000;
      lum = (lum * a + 255 * (255 - a)) / 255; // Alpha auf Weiss
      const black = lum < threshold;
      const dx = x - cropLeft;
      if (dx < 0 || dx >= dw) {
        if (black) croppedDark++;
        continue;
      }
      const o = drow + dx * 4;
      const v = black ? 0 : 255;
      pd[o] = v;
      pd[o + 1] = v;
      pd[o + 2] = v;
      pd[o + 3] = 255;
      if (black) {
        const b = lastBit - (dx + areaOffset);
        line[3 + (b >> 3)] |= 0x80 >> (b & 7);
      }
    }
    parts.push(line);
  }

  const header = Buffer.concat([
    Buffer.alloc(350),                                   // Invalidate
    Buffer.from([0x1b, 0x40]),                           // ESC @  Initialize
    Buffer.from([0x1b, 0x69, 0x61, 0x01]),               // ESC i a  Raster-Modus
    Buffer.from([0x1b, 0x69, 0x21, 0x00]),               // ESC i !  Statusmeldung (Standard)
    printInfo(dh),                                       // ESC i z  Print-Information
    Buffer.from([0x1b, 0x69, 0x4d, 0x40]),               // ESC i M  Auto cut
    Buffer.from([0x1b, 0x69, 0x41, 0x01]),               // ESC i A  Schnitt nach jeder Etikette
    Buffer.from([0x1b, 0x69, 0x4b, 0x08]),               // ESC i K  Cut at end, 300 dpi
    Buffer.from([0x1b, 0x69, 0x64, feedMargin & 0xff, (feedMargin >> 8) & 0xff]), // ESC i d  Rand
    Buffer.from([0x4d, 0x00]),                           // M  keine Kompression
  ]);
  const bin = Buffer.concat([header, ...parts, Buffer.from([0x1a])]); // Control-Z: drucken + Vorschub

  const previewPng = await encodeToBuffer((sink) => PImage.encodePNGToStream(preview, sink));

  return {
    bin,
    previewPng,
    width: dw,
    height: dh,
    srcWidth: src.width,
    srcHeight: src.height,
    rotated,
    croppedDark,
  };
}
