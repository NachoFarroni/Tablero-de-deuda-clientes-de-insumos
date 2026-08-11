const { head } = require('@vercel/blob');

const LATEST_KEY = 'tablero-deuda/archivos-latest.json';

// GET /api/archivos/latest
// Lo consume el bloque de AUTO-CARGA agregado en index.html.
module.exports = async (req, res) => {
  try {
    const meta = await head(LATEST_KEY);
    const blobRes = await fetch(meta.url, { cache: 'no-store' });
    if (!blobRes.ok) {
      res.status(404).json({ error: 'Todavía no hay ninguna corrida del ETL guardada.' });
      return;
    }
    const data = await blobRes.json();
    res.status(200).json(data);
  } catch {
    res.status(404).json({ error: 'Todavía no hay ninguna corrida del ETL guardada.' });
  }
};
