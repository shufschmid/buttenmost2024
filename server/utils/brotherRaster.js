// Erzeugt aus einem PNG (z. B. Post-Adressetikette A6, 300 dpi) einen
// Raster-Befehlsstrom (.bin) fuer den Brother QL-1110NWB.
// Die Datei kann im Massenspeicher-Modus des Druckers ohne Treiber gedruckt werden.
// Quelle: Brother "Raster Command Reference QL-1100/1110NWB/1115NWB" v1.00
// (Kap. 2.1 Aufbau, 2.3.2 Seitengroessen, 2.3.5 Rasterzeile, Kap. 4 Befehle).
import * as PImage from "pureimage";
import { Readable, Writable } from "stream";

export const PINS = 1296;         // Pins des Druckkopfs
export const BYTES_PER_ROW = 162; // 1296 / 8 Bytes pro Rasterzeile
export const MIN_ROWS = 301;      // Endlos: min. 25,4 mm
export const MAX_ROWS = 35434;    // Endlos: max. 3000 mm

/**
 * Medienprofile (Raster-Ref. S. 14-16, 19-20, 25).
 * lead        = Pins vor dem Druckbereich im Byte-Strom (in der Referenz "right margin")
 * printWidth  = bedruckbare Pins
 * printLength = bedruckbare Zeilen bei Einzeletiketten, 0 = Endlos (Laenge = Bildhoehe)
 * feedMargin  = Vorschub-Rand in Punkten (Endlos min. 35 = 3 mm, Einzeletiketten immer 0)
 */
export const MEDIA = {
  endlos102: {
    label: "Endlosrolle 102 mm (DK-22243)",
    type: 0x0a, widthMm: 102, lengthMm: 0,
    lead: 56, printWidth: 1164, printLength: 0, feedMargin: 35,
  },
  endlos103: {
    label: "Endlosrolle 103 mm (DK-22246)",
    type: 0x0a, widthMm: 104, lengthMm: 0,
    lead: 38, printWidth: 1200, printLength: 0, feedMargin: 35,
  },
  einzel102x152: {
    label: "Einzeletikette 102 x 152 mm (DK-11241)",
    type: 0x0b, widthMm: 102, lengthMm: 152,
    lead: 56, printWidth: 1164, printLength: 1660, feedMargin: 0,
  },
  einzel103x164: {
    label: "Versandetikette 103 x 164 mm (DK-11247)",
    type: 0x0b, widthMm: 104, lengthMm: 164,
    lead: 38, printWidth: 1200, printLength: 1822, feedMargin: 0,
  },
};
export const DEFAULT_MEDIA = "einzel103x164"; // im Betrieb eingelegt: DK-11247

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
function printInfo(m, rows, validate) {
  // Flags: 0x02 Medientyp | 0x04 Breite | 0x08 Laenge gueltig, 0x80 Recovery immer an.
  // Ohne Validierung (Diagnose) druckt der Drucker auf dem eingelegten Medium, ohne es zu pruefen.
  const flags = validate ? 0x8e : 0x80;
  return Buffer.from([
    0x1b, 0x69, 0x7a,
    flags,
    validate ? m.type : 0x00,
    validate ? m.widthMm : 0x00,
    validate ? m.lengthMm : 0x00,
    rows & 0xff, (rows >> 8) & 0xff, (rows >> 16) & 0xff, (rows >> 24) & 0xff,
    0x00, // erste Seite
    0x00,
  ]);
}

/**
 * PNG -> Brother-Raster.
 * Das Bild wird auf reines Schwarz/Weiss reduziert (Schwellwert), Querformat um 90 Grad
 * gedreht, bei Bedarf symmetrisch auf den Druckbereich beschnitten (nie skaliert),
 * bei Einzeletiketten auf die feste Laenge zentriert und zeilenweise in 1296-Bit-
 * Rasterzeilen gepackt (MSB zuerst, Bit 1 = schwarz, horizontal gespiegelt wie beim
 * Brother-Treiber und brother_ql).
 */
export async function pngToBrotherRaster(pngBuffer, opts = {}) {
  const mediaKey = opts.media ?? DEFAULT_MEDIA;
  const m = MEDIA[mediaKey];
  if (!m) throw new Error(`Unbekanntes Medium "${mediaKey}"`);
  const threshold = Math.min(254, Math.max(1, opts.threshold ?? 128));
  const feedMargin = opts.feedMarginDots ?? m.feedMargin;
  const validate = opts.validateMedia ?? true;

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

  // Horizontal: auf Druckbereich beschneiden bzw. darin zentrieren
  const dw = Math.min(sw, m.printWidth);
  const cropLeft = Math.floor((sw - dw) / 2);
  const areaOffset = Math.floor((m.printWidth - dw) / 2);
  const lastBit = m.lead + m.printWidth - 1; // Bit-Position von Bildspalte 0 (Endlos 102: 1219)

  // Vertikal: Endlos = Bildhoehe, Einzeletikette = feste Laenge (zentriert, ggf. beschnitten)
  let rows;
  let cropTop = 0;
  let padTop = 0;
  if (m.printLength > 0) {
    rows = m.printLength;
    if (sh > rows) cropTop = Math.floor((sh - rows) / 2);
    else padTop = Math.floor((rows - sh) / 2);
  } else {
    rows = sh;
    if (rows < MIN_ROWS || rows > MAX_ROWS) {
      throw new Error(`Bildhoehe ${rows} Punkte liegt ausserhalb ${MIN_ROWS}..${MAX_ROWS}`);
    }
  }

  const preview = PImage.make(dw, rows);
  const pd = preview.data;
  pd.fill(255); // weiss
  const lines = [];
  for (let y = 0; y < rows; y++) {
    const line = Buffer.alloc(3 + BYTES_PER_ROW); // "g" 0x00 0xA2 + 162 Bytes Raster
    line[0] = 0x67;
    line[1] = 0x00;
    line[2] = BYTES_PER_ROW;
    lines.push(line);
  }
  let croppedDark = 0;

  for (let y = 0; y < sh; y++) {
    const oy = y - cropTop + padTop;
    const rowVisible = oy >= 0 && oy < rows;
    const line = rowVisible ? lines[oy] : null;
    const srow = y * sw * 4;
    const drow = oy * dw * 4;
    for (let x = 0; x < sw; x++) {
      const i = srow + x * 4;
      const a = sd[i + 3];
      let lum = (sd[i] * 299 + sd[i + 1] * 587 + sd[i + 2] * 114) / 1000;
      lum = (lum * a + 255 * (255 - a)) / 255; // Alpha auf Weiss
      const black = lum < threshold;
      if (!black) continue;
      const dx = x - cropLeft;
      if (!rowVisible || dx < 0 || dx >= dw) {
        croppedDark++;
        continue;
      }
      const o = drow + dx * 4;
      pd[o] = 0;
      pd[o + 1] = 0;
      pd[o + 2] = 0;
      const b = lastBit - (dx + areaOffset);
      line[3 + (b >> 3)] |= 0x80 >> (b & 7);
    }
  }

  const header = Buffer.concat([
    Buffer.alloc(350),                                   // Invalidate
    Buffer.from([0x1b, 0x40]),                           // ESC @  Initialize
    Buffer.from([0x1b, 0x69, 0x61, 0x01]),               // ESC i a  Raster-Modus
    Buffer.from([0x1b, 0x69, 0x21, 0x00]),               // ESC i !  Statusmeldung (Standard)
    printInfo(m, rows, validate),                        // ESC i z  Print-Information
    Buffer.from([0x1b, 0x69, 0x4d, 0x40]),               // ESC i M  Auto cut
    Buffer.from([0x1b, 0x69, 0x41, 0x01]),               // ESC i A  Schnitt nach jeder Etikette
    Buffer.from([0x1b, 0x69, 0x4b, 0x08]),               // ESC i K  Cut at end, 300 dpi
    Buffer.from([0x1b, 0x69, 0x64, feedMargin & 0xff, (feedMargin >> 8) & 0xff]), // ESC i d  Rand
    Buffer.from([0x4d, 0x00]),                           // M  keine Kompression
  ]);
  const bin = Buffer.concat([header, ...lines, Buffer.from([0x1a])]); // Control-Z: drucken + Vorschub

  const previewPng = await encodeToBuffer((sink) => PImage.encodePNGToStream(preview, sink));

  return {
    bin,
    previewPng,
    media: mediaKey,
    mediaLabel: m.label,
    validateMedia: validate,
    width: dw,
    height: rows,
    imageHeight: sh,
    srcWidth: src.width,
    srcHeight: src.height,
    rotated,
    croppedDark,
  };
}
