// Zeichnet eine Etikette mit frei eingegebenem Text (ohne Post-API, ohne Airtable) und wandelt sie
// mit brotherRaster.js in einen Raster-Befehlsstrom fuer den QL-1110NWB.
// Gleiches Format wie die Abholetiketten (server/utils/abholEtikette.js), die bewusst unveraendert bleibt.
// Schrift und Logo kommen aus public/ (siehe netlify.toml included_files).
import * as PImage from "pureimage";
import fs from "fs";
import { bitmapToBrotherRaster, MEDIA, DEFAULT_MEDIA } from "./brotherRaster.js";

// eigene Familiennamen, damit sich die Registrierung nicht mit abholEtikette.js ueberschneidet
const FT_REGULAR = "Freitext Regular";
const FT_BOLD = "Freitext Bold";
const FT_LOGO_PATH = "public/logo_neu.png"; // 2724 x 1011 px

export const FREITEXT_MAX_ZEICHEN = 600;
export const FREITEXT_MAX_ZEILEN = 20;

let ftFontsLoaded = false;
let ftBoldAvailable = false;
let ftLogo = null;

function ftLoadFonts() {
  if (ftFontsLoaded) return;
  PImage.registerFont("public/sourcesanspro-regular.ttf", FT_REGULAR).loadSync();
  try {
    PImage.registerFont("public/sourcesanspro-bold.ttf", FT_BOLD).loadSync();
    ftBoldAvailable = true;
  } catch (e) {
    console.log("freitextEtikette: Bold-Schrift nicht geladen, verwende Regular:", e?.message ?? e);
  }
  ftFontsLoaded = true;
}

async function ftLoadLogo() {
  if (ftLogo) return ftLogo;
  try {
    ftLogo = await PImage.decodePNGFromStream(fs.createReadStream(FT_LOGO_PATH));
  } catch (e) {
    console.log("freitextEtikette: Logo nicht geladen:", e?.message ?? e);
    ftLogo = null;
  }
  return ftLogo;
}

/**
 * Zeichnet den Text so gross wie moeglich in den freien Bereich der Etikette.
 *
 * daten = {
 *   text:   mehrzeiliger Text (Zeilenumbrueche bleiben erhalten)
 *   quer:   true = Querformat wie die Post-Etikette (Text laeuft entlang der langen Seite),
 *           false = Hochformat wie die Abholetikette
 *   links:  true = linksbuendig, false = zentriert
 *   fett:   erste Zeile fett
 *   logo:   Logo unten
 * }
 * Alle Zeilen haben dieselbe Schriftgroesse. Zeilen werden nur dann an Wortgrenzen umbrochen,
 * wenn die Schrift sonst kleiner als MIN_OHNE_UMBRUCH wuerde.
 * Rueckgabe: Ergebnis von bitmapToBrotherRaster (bin, page, previewPng, ...) plus Layout-Infos.
 */
export async function zeichneFreitextEtikette(daten, opts = {}) {
  const mediaKey = opts.media ?? DEFAULT_MEDIA;
  const m = MEDIA[mediaKey];
  if (!m) throw new Error(`Unbekanntes Medium "${mediaKey}"`);
  ftLoadFonts();
  const logo = daten.logo ? await ftLoadLogo() : null;

  // Druckbereich: kurze Seite = Breite des Druckkopfs, lange Seite = Etikettenlaenge
  const kurz = m.printWidth;
  const lang = m.printLength || 1748; // Endlosrolle: Laenge wie A6
  const W = daten.quer ? lang : kurz;
  const H = daten.quer ? kurz : lang;
  const img = PImage.make(W, H);
  const ctx = img.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "black";

  const bold = ftBoldAvailable ? FT_BOLD : FT_REGULAR;
  const regular = FT_REGULAR;
  const RAND = 60; // 5 mm bei 300 dpi
  const maxW = W - 2 * RAND;

  // Logo unten, Textbereich darueber
  let textBottom = H - RAND;
  let logoBox = null;
  if (logo) {
    const lw = daten.quer ? 560 : 760;
    const lh = Math.round((logo.height * lw) / logo.width);
    logoBox = { x: (W - lw) / 2, y: H - lh - RAND, w: lw, h: lh };
    textBottom = logoBox.y - 50;
  }
  const textTop = RAND;
  const areaH = textBottom - textTop;

  // ohne Anfuehrungszeichen: pureimage 0.4 uebernimmt sie sonst in den Familiennamen, findet die
  // Schrift nicht und nimmt still die zuerst registrierte (Regular)
  function setFont(size, family) {
    ctx.font = `${size}pt ${family}`;
  }
  function width(text, size, family) {
    if (!text) return 0;
    setFont(size, family);
    return ctx.measureText(text).width;
  }

  const LINE = 1.22; // Zeilenabstand relativ zur Schriftgroesse
  const MAX_SIZE = 320;
  const MIN_SIZE = 28;
  const MIN_OHNE_UMBRUCH = 90;

  const quellZeilen = String(daten.text ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((z) => z.replace(/\s+$/, ""))
    .slice(0, FREITEXT_MAX_ZEILEN);
  // fuehrende und abschliessende Leerzeilen weglassen
  while (quellZeilen.length && !quellZeilen[0].trim()) quellZeilen.shift();
  while (quellZeilen.length && !quellZeilen[quellZeilen.length - 1].trim()) quellZeilen.pop();
  const zeilen = quellZeilen.map((text, i) => ({ text, family: daten.fett && i === 0 ? bold : regular }));

  // Zeile an Wortgrenzen auf maxW umbrechen; null, wenn ein einzelnes Wort nicht passt
  function umbrechen(z, size) {
    if (width(z.text, size, z.family) <= maxW) return [z];
    const woerter = z.text.trim().split(/\s+/);
    const out = [];
    let akt = "";
    for (const w of woerter) {
      const probe = akt ? akt + " " + w : w;
      if (width(probe, size, z.family) <= maxW) {
        akt = probe;
      } else {
        if (!akt) return null;
        out.push({ text: akt, family: z.family });
        akt = w;
        if (width(akt, size, z.family) > maxW) return null;
      }
    }
    if (akt) out.push({ text: akt, family: z.family });
    return out;
  }

  function layout(size, mitUmbruch) {
    const out = [];
    for (const z of zeilen) {
      if (!z.text.trim()) {
        out.push(z);
        continue;
      }
      if (!mitUmbruch) {
        if (width(z.text, size, z.family) > maxW) return null;
        out.push(z);
        continue;
      }
      const teile = umbrechen(z, size);
      if (!teile) return null;
      out.push(...teile);
    }
    if (out.length * size * LINE > areaH) return null;
    return out;
  }

  let size = 0;
  let gesetzt = null;
  let umbrochen = false;
  if (zeilen.length) {
    for (let s = MAX_SIZE; s >= MIN_OHNE_UMBRUCH; s -= 4) {
      gesetzt = layout(s, false);
      if (gesetzt) {
        size = s;
        break;
      }
    }
    if (!gesetzt) {
      for (let s = MAX_SIZE; s >= MIN_SIZE; s -= 4) {
        gesetzt = layout(s, true);
        if (gesetzt) {
          size = s;
          umbrochen = gesetzt.length > zeilen.length;
          break;
        }
      }
    }
    if (!gesetzt) throw new Error("Der Text ist zu lang für die Etikette.");
  }

  // vertikal im Textbereich zentrieren; Grundlinie bei ca. 0,95 x Schriftgroesse
  if (gesetzt) {
    const lh = size * LINE;
    const blockH = gesetzt.length * lh;
    let y = textTop + (areaH - blockH) / 2 + size * 0.95;
    for (const z of gesetzt) {
      if (z.text.trim()) {
        setFont(size, z.family);
        const w = ctx.measureText(z.text).width;
        ctx.fillText(z.text, daten.links ? RAND : (W - w) / 2, y);
      }
      y += lh;
    }
  }

  if (logo && logoBox) {
    ctx.drawImage(logo, 0, 0, logo.width, logo.height, logoBox.x, logoBox.y, logoBox.w, logoBox.h);
  }

  const raster = await bitmapToBrotherRaster(img, {
    media: mediaKey,
    compress: opts.compress,
    validateMedia: opts.validateMedia,
    threshold: opts.threshold,
  });
  return {
    ...raster,
    bold: ftBoldAvailable,
    logo: !!logo,
    fontSize: size,
    zeilen: gesetzt ? gesetzt.length : 0,
    umbrochen,
    quer: !!daten.quer,
  };
}
