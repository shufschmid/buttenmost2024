// Abholetikette fuer den Brother QL-1110NWB, OHNE Post-API (kein Versandauftrag, kein Mail).
// Zeichnet Menge, "ZUM ABHOLEN" + Datum, Name/Adresse und Logo selbst (server/utils/abholEtikette.js).
//
// Parameter:
//   id         Airtable Record-ID (Pflicht), muss eine Abholbestellung sein
//   preview=1  nur Vorschau, Status in Airtable NICHT aendern
//   raw=1      Antwort ist direkt die .bin (Download) statt JSON
//   media      einzel103x164 (Standard, DK-11247) | einzel102x152 | endlos102 | endlos103
//   check=0    Medienpruefung im Drucker ausschalten (nur Diagnose)
//   compress=0 TIFF-Kompression ausschalten
import Airtable from "airtable";
import { zeichneAbholEtikette, abholDaten } from "../utils/abholEtikette.js";
import { MEDIA, DEFAULT_MEDIA, JOB_INIT, PAGE_INDICATOR_OFFSET } from "../utils/brotherRaster.js";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_TOKEN,
});
const base = new Airtable.base("appGF3k6k6MO8AMkz");
const TABLE = "tblbU1zmZ2kumAXEY";

function isTrue(v) {
  return v === "1" || v === "true" || v === true;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id;
  if (!id) {
    return Response.json({ error: "Parameter id fehlt" }, { status: 400 });
  }
  const vorschau = isTrue(query.preview);
  const raw = isTrue(query.raw);
  const media = query.media || DEFAULT_MEDIA;
  if (!MEDIA[media]) {
    return Response.json(
      { error: `Unbekanntes Medium "${media}"`, erlaubt: Object.keys(MEDIA) },
      { status: 400 }
    );
  }
  const validateMedia = !(query.check === "0" || query.check === "false");
  const compress = !(query.compress === "0" || query.compress === "false");
  let threshold = parseInt(query.threshold);
  if (!(threshold >= 1 && threshold <= 254)) threshold = 128;

  // 1. Bestellung lesen
  let record;
  try {
    record = await base(TABLE).find(id);
  } catch (e) {
    console.log("etikette_abholung Airtable-Fehler", e?.message ?? e);
    return Response.json({ error: "Airtable: " + (e?.message ?? e) }, { status: 502 });
  }
  const daten = abholDaten(record.fields);
  if (daten.vertrieb.toLowerCase() !== "abholung") {
    return Response.json(
      { error: `Keine Abholbestellung (vertrieb = "${daten.vertrieb}")` },
      { status: 400 }
    );
  }

  // 2. Etikette zeichnen und rastern
  let raster;
  try {
    raster = await zeichneAbholEtikette(daten, { media, compress, validateMedia, threshold });
  } catch (e) {
    console.log("etikette_abholung Zeichnen-Fehler", e?.message ?? e);
    return Response.json(
      { error: "Etikette konnte nicht erzeugt werden: " + (e?.message ?? e) },
      { status: 500 }
    );
  }
  console.log(
    `etikette_abholung ${id} vorschau=${vorschau} media=${media} kunde="${daten.name}" ` +
      `liter=${daten.liter} out=${raster.width}x${raster.height} bytes=${raster.bin.length} ` +
      `compressed=${raster.compressed} bold=${raster.bold} logo=${raster.logo}`
  );

  // 3. Status setzen (nicht in der Vorschau)
  let warning = "";
  if (!vorschau) {
    try {
      await base(TABLE).update(id, { Status: "Etikette" });
    } catch (e) {
      warning = "Airtable-Update fehlgeschlagen: " + (e?.message ?? e);
      console.log("etikette_abholung", warning);
    }
  }
  if (!raster.logo) warning += (warning ? " " : "") + "Logo nicht geladen.";

  const kurz = daten.datum.slice(5).replace("-", "");
  const filename = `${vorschau ? "VORS" : "ABHOL"}${kurz}-${id.slice(-5)}.bin`;
  if (raw) {
    return new Response(raster.bin, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }
  return Response.json(
    {
      id,
      kunde: daten.name,
      liter: daten.liter,
      datum: daten.datum,
      vorschau,
      filename,
      media,
      mediaLabel: raster.mediaLabel,
      validateMedia,
      compressed: raster.compressed,
      width: raster.width,
      height: raster.height,
      bytes: raster.bin.length,
      croppedDark: raster.croppedDark,
      warning,
      previewImage: "data:image/png;base64," + raster.previewPng.toString("base64"),
      bin: raster.bin.toString("base64"),
      page: raster.page.toString("base64"),
      jobInit: JOB_INIT.toString("base64"),
      pageIndicatorOffset: PAGE_INDICATOR_OFFSET,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
});
