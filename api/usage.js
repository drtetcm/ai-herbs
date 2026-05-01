export default async function handler(req, res) {
  // ===== 1. 获取用户标识（用 IP + UA 做轻量识别）=====
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown";

  const ua = req.headers["user-agent"] || "unknown";
  const userKey = `${ip}__${ua}`;

  // ===== 2. KV 存储（使用 Vercel KV / Upstash Redis）=====
  // ⚠ 需要在 Vercel 项目里配置 KV 环境变量：KV_REST_API_URL / KV_REST_API_TOKEN
  const { KV_REST_API_URL, KV_REST_API_TOKEN } = process.env;

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return res.status(500).json({
      allowed: false,
      error: "KV not configured"
    });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const usageKey = `usage:${userKey}:${today}`;
  const proKey = `pro:${userKey}`;

  // ===== 3. 读取会员状态 =====
  const proRes = await fetch(`${KV_REST_API_URL}/get/${proKey}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });
  const proData = await proRes.json();
  const proExpire = Number(proData.result || 0);
  const isPro = Date.now() < proExpire;

  // ===== 4. 读取今日使用次数 =====
  const usageRes = await fetch(`${KV_REST_API_URL}/get/${usageKey}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });
  const usageData = await usageRes.json();
  let count = Number(usageData.result || 0);

  // ===== 5. 判断是否允许 =====
  if (!isPro && count >= 1) {
    return res.json({
      allowed: false,
      count,
      isPro: false
    });
  }

  // ===== 6. 允许 → 计数 +1 =====
  if (!isPro) {
    count += 1;

    // 设置过期（当天结束）
    const expireSeconds = Math.floor(
      (new Date(today + "T23:59:59").getTime() - Date.now()) / 1000
    );

    await fetch(`${KV_REST_API_URL}/set/${usageKey}/${count}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    await fetch(`${KV_REST_API_URL}/expire/${usageKey}/${expireSeconds}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });
  }

  return res.json({
    allowed: true,
    count,
    isPro
  });
}