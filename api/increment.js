export default async function handler(req, res) {

  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

  const { userId } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: "no userId" });
  }

  const today = new Date().toISOString().slice(0, 10);
  const usageKey = `usage:${userId}:${today}`;

  // ===== 读取当前 =====
  const usageRes = await fetch(`${KV_REST_API_URL}/get/${usageKey}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });

  const usageJson = await usageRes.json();
  let count = Number(usageJson.result || 0);

  count += 1;

  const expireSeconds = Math.floor(
    (new Date(today + "T23:59:59").getTime() - Date.now()) / 1000
  );

  // ===== 写入 =====
  const setRes = await fetch(`${KV_REST_API_URL}/set/${usageKey}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "Content-Type": "application/json"
  },
    body: JSON.stringify({
      value: count,
      ex: expireSeconds
    })
  });

if (!setRes.ok) {
  throw new Error("KV写入失败");
}

  // ===== 🔥 全局统计（新增） =====
  const totalKey = `total:${today}`;

  await fetch(`${KV_REST_API_URL}/incr/${totalKey}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });

  return res.json({ success: true, count });
}