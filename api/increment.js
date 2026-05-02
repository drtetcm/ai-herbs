function getIP(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return xf.split(",")[0].trim();

  const xr = req.headers["x-real-ip"];
  if (xr) return xr;

  return req.socket?.remoteAddress || "unknown";
}

export default async function handler(req, res) {

  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

  const { userId } = req.body || {};

  // ✅ 基础校验（防伪造）
  if (!userId || userId.length < 8) {
    return res.status(400).json({ error: "invalid userId" });
  }

  // ✅ 获取IP
  const ip = getIP(req);

  // 🔥 核心绑定
  const userKey = `${userId}:${ip}`;

  const today = new Date().toISOString().slice(0, 10);

  const usageKey = `usage:${userKey}:${today}`;

  // ===== 读取当前 =====
  const usageRes = await fetch(`${KV_REST_API_URL}/get/${usageKey}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });

  const usageJson = await usageRes.json();
  let count = Number(usageJson.result || 0);

  count += 1;

  // ===== 计算TTL（到当天结束）=====
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

  // ===== 🔥 全局统计 =====
  const totalKey = `total:${today}`;

  await fetch(`${KV_REST_API_URL}/incr/${totalKey}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });

  return res.json({ success: true, count });

}