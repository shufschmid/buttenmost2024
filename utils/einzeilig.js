// Schrift einer einzeiligen Kopfzeile (z.B. "Datum: ... | Firmenname") verkleinern, wenn der Text
// laenger ist als die linke Spalte (cols=7) im A4-Druck fasst (~48 Zeichen bei 16px).
// Sonst laeuft er ins Logo der rechten Spalte.
export default function (text, maxZeichen = 48) {
  const n = String(text || "").length;
  return n > maxZeichen ? { fontSize: (maxZeichen / n).toFixed(3) + "em" } : {};
}
