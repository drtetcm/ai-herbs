export default async function handler(req, res) {

  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

  const today = new Date().toISOString().slice(0, 10);
  const totalKey = `total:${today}`;

  try {
    const r = await fetch(`${KV_REST_API_URL}/get/${totalKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const json = await r.json();
    const count = Number(json.result || 0);

    return res.json({ count });

  } catch {
    return res.json({ count: 0 });
  }
}