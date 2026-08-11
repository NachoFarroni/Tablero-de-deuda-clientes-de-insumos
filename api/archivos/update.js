const { put, head } = require('@vercel/blob');

const LATEST_KEY = 'tablero-deuda/archivos-latest.json';

// POST /api/archivos/update
// Lo llama el HTTP Request final del workflow de n8n ("Enviar Archivos al Tablero (Vercel)").
// Body esperado: { fecha, archivos: { cta_cte: {nombre, base64}, cheques: {...}, negocios: {...}, contratos: {...} } }
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const secretEsperado = process.env.TABLERO_API_SECRET;
  const secretRecibido = req.headers['x-api-secret'];

  if (!secretEsperado) {
    res.status(500).json({ error: 'TABLERO_API_SECRET no está configurado en el proyecto de Vercel.' });
    return;
  }
  if (secretRecibido !== secretEsperado) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  const data = req.body;
  if (!data || !data.archivos) {
    res.status(400).json({ error: "El body debe tener un campo 'archivos'" });
    return;
  }

  const requeridos = ['cta_cte', 'cheques', 'negocios', 'contratos'];
  const faltantes = requeridos.filter((k) => !data.archivos[k] || !data.archivos[k].base64);
  if (faltantes.length) {
    res.status(400).json({ error: `Faltan archivos: ${faltantes.join(', ')}` });
    return;
  }

  await put(LATEST_KEY, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
  });

  res.status(200).json({ ok: true, fecha: data.fecha });
};
