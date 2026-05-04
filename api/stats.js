export default async function handler(req, res) {

  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
  const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

  // ===== 🔐 API保护（建议开启）=====
  if (
    INTERNAL_API_KEY &&
    req.headers.authorization !== `Bearer ${INTERNAL_API_KEY}`
  ) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // ===== ❗KV保护 =====
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return res.json({
      success: true,
      count: 0
    });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const totalKey = `total:${today}`;

    const r = await fetch(`${KV_REST_API_URL}/get/${totalKey}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      }
    });

    if (!r.ok) {
      throw new Error("KV读取失败");
    }

    const json = await r.json();

    // 🔥 防异常解析
    const count = Number(json?.result ?? 0);

    return res.json({
      success: true,
      count
    });

  } catch (err) {
    console.error("❌ stats error:", err);

    return res.json({
      success: false,
      count: 0
    });
  }
}