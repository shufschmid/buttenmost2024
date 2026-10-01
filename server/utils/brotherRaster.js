// Erzeugt aus einem PNG (z. B. Post-Adressetikette A6, 300 dpi) einen
// Raster-Befehlsstrom (.bin) fuer den Brother QL-1110NWB.
// Die Datei kann im Massenspeicher-Modus des Druckers ohne Treiber gedruckt werden.
// Quelle: Brother "Raster Command Reference QL-1100/1110NWB/1115NWB" v1.00
// (Kap. 2.1 Aufbau, 2.3.2 Seitengroessen, 2.3.5 Rasterzeile, Kap. 4 Befehle).
//
// Aufbau einer Datei mit mehreren Etiketten (Kap. 2.1):
//   JOB_INIT + Seite 1 + FF + Seite 2 + FF + ... + letzte Seite + Control-Z
// Jede Seite = Steuerbefehle (ESC i a, ESC i !, ESC i z, ESC i M, ESC i A, ESC i K,
// ESC i d, M) + Rasterzeilen. Das Byte n9 in ESC i z ist 0 fuer die erste, 1 fuer
// weitere Seiten (PAGE_INDICATOR_OFFSET). Siehe mergePages().
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

/** Job-Anfang: Invalidate (350 x 00) + ESC @. Einmal pro Datei, auch bei mehreren Etiketten. */
export const JOB_INIT = Buffer.concat([Buffer.alloc(350), Buffer.from([0x1b, 0x40])]);
/** Position von n9 (ESC i z) in einem Seitenfragment: 0 = erste Seite, 1 = weitere Seiten. */
export const PAGE_INDICATOR_OFFSET = 4 + 4 + 11;
export const PRINT_NEXT_PAGE = Buffer.from([0x0c]); // FF: Seite drucken, es folgen weitere
export const PRINT_LAST_PAGE = Buffer.from([0x1a]); // Control-Z: letzte Seite drucken

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

/**
 * TIFF-/PackBits-Kompression einer Rasterzeile (Raster-Ref. S. 34):
 * gleiche Bytes -> [-(n-1), Byte], verschiedene Bytes -> [n-1, Bytes...], max. 128 je Paket
 * (Standard-PackBits wie in brother_ql; im schlechtesten Fall 164 Bytes je Zeile).
 */
export function packBits(row) {
  const out = [];
  const n = row.length;
  let i = 0;
  while (i < n) {
    let run = 1;
    while (i + run < n && run < 128 && row[i + run] === row[i]) run++;
    if (run >= 2) {
      out.push((256 - (run - 1)) & 0xff, row[i]);
      i += run;
      continue;
    }
    let lit = 1;
    while (i + lit < n && lit < 128) {
      if (i + lit + 1 < n && row[i + lit] === row[i + lit + 1]) break;
      lit++;
    }
    out.push(lit - 1, ...row.subarray(i, i + lit));
    i += lit;
  }
  return Buffer.from(out);
}

/** Eine Rasterzeile als Befehl: "g" 00 n + Daten, bei Kompression leere Zeilen als "Z". */
function rasterLine(row, compress) {
  if (compress) {
    let blank = true;
    for (let k = 0; k < row.length; k++) {
      if (row[k] !== 0) { blank = false; break; }
    }
    if (blank) return Buffer.from([0x5a]);
    const packed = packBits(row);
    return Buffer.concat([Buffer.from([0x67, 0x00, packed.length]), packed]);
  }
  return Buffer.concat([Buffer.from([0x67, 0x00, BYTES_PER_ROW]), row]);
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
    0x00, // n9: erste Seite (bei weiteren Seiten 1, siehe PAGE_INDICATOR_OFFSET)
    0x00,
  ]);
}

/** Steuerbefehle am Anfang jeder Seite (Raster-Ref. Kap. 2.1, Tabelle "Control codes"). */
function pageControl(m, rows, validate, feedMargin, compress) {
  return Buffer.concat([
    Buffer.from([0x1b, 0x69, 0x61, 0x01]),               // ESC i a  Raster-Modus
    Buffer.from([0x1b, 0x69, 0x21, 0x00]),               // ESC i !  Statusmeldung (Standard)
    printInfo(m, rows, validate),                        // ESC i z  Print-Information
    Buffer.from([0x1b, 0x69, 0x4d, 0x40]),               // ESC i M  Auto cut
    Buffer.from([0x1b, 0x69, 0x41, 0x01]),               // ESC i A  Schnitt nach jeder Etikette
    Buffer.from([0x1b, 0x69, 0x4b, 0x08]),               // ESC i K  Cut at end, 300 dpi
    Buffer.from([0x1b, 0x69, 0x64, feedMargin & 0xff, (feedMargin >> 8) & 0xff]), // ESC i d  Rand
    Buffer.from([0x4d, compress ? 0x02 : 0x00]),         // M  Kompression TIFF / keine
  ]);
}

/**
 * Mehrere Seitenfragmente (aus pngToBrotherRaster().page) zu einer Datei zusammensetzen:
 * JOB_INIT, dann jede Seite mit korrektem n9 und FF bzw. Control-Z am Ende.
 */
export function mergePages(fragments) {
  const parts = [JOB_INIT];
  fragments.forEach((f, i) => {
    const b = Buffer.from(f); // Kopie, n9 wird angepasst
    b[PAGE_INDICATOR_OFFSET] = i === 0 ? 0x00 : 0x01;
    parts.push(b, i < fragments.length - 1 ? PRINT_NEXT_PAGE : PRINT_LAST_PAGE);
  });
  return Buffer.concat(parts);
}

/**
 * PNG -> Brother-Raster.
 * Das Bild wird auf reines Schwarz/Weiss reduziert (Schwellwert), Querformat um 90 Grad
 * gedreht, bei Bedarf symmetrisch auf den Druckbereich beschnitten (nie skaliert),
 * bei Einzeletiketten auf die feste Laenge zentriert und zeilenweise in 1296-Bit-
 * Rasterzeilen gepackt (MSB zuerst, Bit 1 = schwarz, horizontal gespiegelt wie beim
 * Brother-Treiber und brother_ql).
 * Rueckgabe: bin = komplette Datei fuer eine Etikette, page = Seitenfragment fuer mergePages().
 */
export async function pngToBrotherRaster(pngBuffer, opts = {}) {
  const mediaKey = opts.media ?? DEFAULT_MEDIA;
  const m = MEDIA[mediaKey];
  if (!m) throw new Error(`Unbekanntes Medium "${mediaKey}"`);
  const threshold = Math.min(254, Math.max(1, opts.threshold ?? 128));
  const feedMargin = opts.feedMarginDots ?? m.feedMargin;
  const validate = opts.validateMedia ?? true;
  const compress = opts.compress ?? true;

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
  const raw = [];
  for (let y = 0; y < rows; y++) raw.push(Buffer.alloc(BYTES_PER_ROW));
  let croppedDark = 0;

  for (let y = 0; y < sh; y++) {
    const oy = y - cropTop + padTop;
    const rowVisible = oy >= 0 && oy < rows;
    const row = rowVisible ? raw[oy] : null;
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
      row[b >> 3] |= 0x80 >> (b & 7);
    }
  }

  // Die Referenz (S. 34) sieht hoechstens 163 Bytes je komprimierter Zeile vor. Wuerde eine
  // Zeile laenger, wird die ganze Seite sicherheitshalber unkomprimiert gesendet.
  let compressPage = compress;
  let lines = raw.map((row) => rasterLine(row, compressPage));
  if (compressPage && lines.some((l) => l.length > 3 + BYTES_PER_ROW)) {
    compressPage = false;
    lines = raw.map((row) => rasterLine(row, false));
  }
  const page = Buffer.concat([pageControl(m, rows, validate, feedMargin, compressPage), ...lines]);
  const bin = Buffer.concat([JOB_INIT, page, PRINT_LAST_PAGE]);

  const previewPng = await encodeToBuffer((sink) => PImage.encodePNGToStream(preview, sink));

  return {
    bin,
    page,
    previewPng,
    media: mediaKey,
    mediaLabel: m.label,
    validateMedia: validate,
    compressed: compressPage,
    width: dw,
    height: rows,
    imageHeight: sh,
    srcWidth: src.width,
    srcHeight: src.height,
    rotated,
    croppedDark,
  };
}
