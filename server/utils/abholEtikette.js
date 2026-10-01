// Zeichnet eine Abholetikette ohne Post-API (Menge, "ZUM ABHOLEN" + Datum, Kunde, Logo)
// und wandelt sie mit brotherRaster.js in einen Raster-Befehlsstrom fuer den QL-1110NWB.
// Kein Netzwerkzugriff: Schrift und Logo kommen aus public/ (siehe netlify.toml included_files).
import * as PImage from "pureimage";
import fs from "fs";
import { bitmapToBrotherRaster, MEDIA, DEFAULT_MEDIA } from "./brotherRaster.js";

const FONT_REGULAR = "Source Sans Pro";
const FONT_BOLD = "Source Sans Pro Bold";
const LOGO_PATH = "public/logo_neu.png"; // 2724 x 1011 px

let fontsLoaded = false;
let boldAvailable = false;
let logoBitmap = null;

function loadFonts() {
  if (fontsLoaded) return;
  PImage.registerFont("public/sourcesanspro-regular.ttf", FONT_REGULAR).loadSync();
  try {
    PImage.registerFont("public/sourcesanspro-bold.ttf", FONT_BOLD).loadSync();
    boldAvailable = true;
  } catch (e) {
    console.log("abholEtikette: Bold-Schrift nicht geladen, verwende Regular:", e?.message ?? e);
  }
  fontsLoaded = true;
}

async function loadLogo() {
  if (logoBitmap) return logoBitmap;
  try {
    logoBitmap = await PImage.decodePNGFromStream(fs.createReadStream(LOGO_PATH));
  } catch (e) {
    console.log("abholEtikette: Logo nicht geladen:", e?.message ?? e);
    logoBitmap = null;
  }
  return logoBitmap;
}

const str = (v) => (Array.isArray(v) ? v.join(" ") : v == null ? "" : String(v)).trim();

/** Name/Adresse wie auf dem Lieferschein (utils/bezeichnung.js, Art "Lieferung"). */
export function abholDaten(f) {
  const name =
    str(f.Lieferung_Bezeichnung) ||
    str(f.b2b_Bezeichnung) ||
    [str(f.Vorname), str(f.Name)].filter(Boolean).join(" ");
  const adresse = str(f.Lieferung_Adresse) || str(f.b2b_Adresse) || str(f.Adresse);
  const zusatz = str(f.Lieferung_Adresszusatz) || str(f.b2b_Adresszusatz) || str(f.Adresszusatz);
  let plzOrt;
  if (str(f.Lieferung_Ort)) plzOrt = `${str(f.Lieferung_PLZ)} ${str(f.Lieferung_Ort)}`;
  else if (str(f.b2b_Ort)) plzOrt = `${str(f.b2b_PLZ)} ${str(f.b2b_Ort)}`;
  else plzOrt = `${str(f.PLZ)} ${str(f.Ort)}`;
  return {
    name,
    adresse,
    zusatz,
    plzOrt: plzOrt.trim(),
    liter: f.Menge,
    datum: str(f.Lieferdatum),
    vertrieb: str(f.vertrieb),
    status: str(f.Status),
  };
}

export function formatDatum(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("de-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Zeichnet die Etikette in der Groesse des Druckbereichs des Mediums (DK-11247: 1200 x 1822)
 * und liefert das Ergebnis von bitmapToBrotherRaster (bin, page, previewPng, ...).
 */
export async function zeichneAbholEtikette(daten, opts = {}) {
  const mediaKey = opts.media ?? DEFAULT_MEDIA;
  const m = MEDIA[mediaKey];
  if (!m) throw new Error(`Unbekanntes Medium "${mediaKey}"`);
  loadFonts();
  const logo = await loadLogo();

  const W = m.printWidth;
  const H = m.printLength || 1748; // Endlosrolle: Laenge wie A6
  const img = PImage.make(W, H);
  const ctx = img.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "black";

  const bold = boldAvailable ? FONT_BOLD : FONT_REGULAR;
  const regular = FONT_REGULAR;
  const maxW = W - 120;

  function setFont(size, family) {
    ctx.font = `${size}pt '${family}'`;
  }
  function width(text, size, family) {
    setFont(size, family);
    return ctx.measureText(text).width;
  }
  // zentriert, verkleinert die Schrift bei Bedarf bis minSize
  function centered(text, y, size, family, minSize = 28) {
    if (!text) return;
    let s = size;
    while (s > minSize && width(text, s, family) > maxW) s -= 4;
    setFont(s, family);
    const w = ctx.measureText(text).width;
    ctx.fillText(text, (W - w) / 2, y);
  }
  function rule(y) {
    ctx.fillRect(60, y, W - 120, 5);
  }

  // Kopf
  centered("ZUM ABHOLEN", 185, 120, bold);
  centered(formatDatum(daten.datum), 300, 62, regular);
  rule(350);

  // Menge: grosse Zahl + "Liter"
  const zahl = daten.liter == null || daten.liter === "" ? "?" : String(daten.liter);
  let zahlSize = 380;
  const literSize = 120;
  const gap = 30;
  while (zahlSize > 120 && width(zahl, zahlSize, bold) + gap + width("Liter", literSize, regular) > maxW) {
    zahlSize -= 10;
  }
  const wZahl = width(zahl, zahlSize, bold);
  const wLiter = width("Liter", literSize, regular);
  const x0 = (W - (wZahl + gap + wLiter)) / 2;
  const yMenge = 800;
  setFont(zahlSize, bold);
  ctx.fillText(zahl, x0, yMenge);
  setFont(literSize, regular);
  ctx.fillText("Liter", x0 + wZahl + gap, yMenge);
  rule(900);

  // Kunde
  let y = 1030;
  centered(daten.name, y, 84, bold, 40);
  y += 95;
  for (const zeile of [daten.adresse, daten.zusatz, daten.plzOrt]) {
    if (!zeile) continue;
    centered(zeile, y, 62, regular, 30);
    y += 80;
  }

  // Logo unten
  if (logo) {
    const lw = 760;
    const lh = Math.round((logo.height * lw) / logo.width);
    const ly = H - lh - 60;
    if (ly > y + 20) {
      ctx.drawImage(logo, 0, 0, logo.width, logo.height, (W - lw) / 2, ly, lw, lh);
    }
  }

  const raster = await bitmapToBrotherRaster(img, {
    media: mediaKey,
    compress: opts.compress,
    validateMedia: opts.validateMedia,
    threshold: opts.threshold,
  });
  return { ...raster, bold: boldAvailable, logo: !!logo };
}
