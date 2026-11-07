// Etikette mit frei eingegebenem Text fuer den Brother QL-1110NWB, gleiches Format wie die
// Abholetiketten. Keine Nebenwirkungen: kein Airtable, keine Post-API.
//
// POST, JSON-Body:
//   text       mehrzeiliger Text (Pflicht, max. FREITEXT_MAX_ZEICHEN Zeichen)
//   quer       true = Querformat wie Post-Etikette, sonst Hochformat wie Abholetikette
//   links      true = linksbuendig, sonst zentriert
//   fett       true = erste Zeile fett
//   logo       true = Logo unten
//   media      einzel103x164 (Standard, DK-11247) | einzel102x152 | endlos102 | endlos103
//   check      false = Medienpruefung im Drucker ausschalten (nur Diagnose)
import {
  zeichneFreitextEtikette,
  FREITEXT_MAX_ZEICHEN,
} from "../utils/freitextEtikette.js";
import { MEDIA, DEFAULT_MEDIA, JOB_INIT, PAGE_INDICATOR_OFFSET } from "../utils/brotherRaster.js";

const ja = (v) => v === true || v === 1 || v === "1" || v === "true";

export default defineEventHandler(async (event) => {
  let body;
  try {
    body = (await readBody(event)) || {};
  } catch (e) {
    return Response.json({ error: "Ungültiger Body: " + (e?.message ?? e) }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text : "";
  if (!text.trim()) {
    return Response.json({ error: "Kein Text eingegeben" }, { status: 400 });
  }
  if (text.length > FREITEXT_MAX_ZEICHEN) {
    return Response.json(
      { error: `Text zu lang (${text.length} Zeichen, max. ${FREITEXT_MAX_ZEICHEN})` },
      { status: 400 }
    );
  }
  const media = body.media || DEFAULT_MEDIA;
  if (!MEDIA[media]) {
    return Response.json(
      { error: `Unbekanntes Medium "${media}"`, erlaubt: Object.keys(MEDIA) },
      { status: 400 }
    );
  }
  const validateMedia = !(body.check === false || body.check === "0" || body.check === "false");

  const daten = {
    text,
    quer: ja(body.quer),
    links: ja(body.links),
    fett: ja(body.fett),
    logo: ja(body.logo),
  };

  let raster;
  try {
    raster = await zeichneFreitextEtikette(daten, { media, validateMedia });
  } catch (e) {
    console.log("etikette_freitext Zeichnen-Fehler", e?.message ?? e);
    return Response.json(
      { error: "Etikette konnte nicht erzeugt werden: " + (e?.message ?? e) },
      { status: 422 }
    );
  }
  console.log(
    `etikette_freitext media=${media} quer=${daten.quer} zeichen=${text.length} ` +
      `schrift=${raster.fontSize} zeilen=${raster.zeilen} umbrochen=${raster.umbrochen} ` +
      `bytes=${raster.bin.length} bold=${raster.bold} logo=${raster.logo}`
  );

  const hinweise = [];
  if (daten.logo && !raster.logo) hinweise.push("Logo nicht geladen.");
  if (daten.fett && !raster.bold) hinweise.push("Fette Schrift nicht geladen.");
  if (raster.croppedDark > 0) hinweise.push("Ein Teil ist abgeschnitten.");

  return Response.json(
    {
      media,
      mediaLabel: raster.mediaLabel,
      validateMedia,
      quer: raster.quer,
      fontSize: raster.fontSize,
      zeilen: raster.zeilen,
      umbrochen: raster.umbrochen,
      width: raster.width,
      height: raster.height,
      bytes: raster.bin.length,
      croppedDark: raster.croppedDark,
      warning: hinweise.join(" "),
      previewImage: "data:image/png;base64," + raster.previewPng.toString("base64"),
      page: raster.page.toString("base64"),
      jobInit: JOB_INIT.toString("base64"),
      pageIndicatorOffset: PAGE_INDICATOR_OFFSET,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
});
