export default async function handler(req, res) {

  // ===== 1. 环境变量检查 =====
  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return res.status(500).json({
      allowed: true, // 👉 fallback：不阻塞用户
      error: "KV not configured"
    });
  }

  try {

    // ===== 2. 用户标识（轻量防刷）=====
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "unknown";

    const ua = req.headers["user-agent"] || "unknown";
    const userKey = `${ip}_${ua}`;

    // ===== 3. Key =====
    const today = new Date().toISOString().slice(0, 10);
    const usageKey = `usage:${userKey}:${today}`;
    const proKey = `pro:${userKey}`;

    // ===== 4. 查会员 =====
    const proRes = await fetch(`${KV_REST_API_URL}/get/${proKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const proJson = await proRes.json();
    const proExpire = Number(proJson.result || 0);
    const isPro = Date.now() < proExpire;

    // ===== 5. 查使用次数 =====
    const usageRes = await fetch(`${KV_REST_API_URL}/get/${usageKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const usageJson = await usageRes.json();
    let count = Number(usageJson.result || 0);

    // ===== 6. 判断是否允许 =====
    if (!isPro && count >= 1) {
      return res.json({
        allowed: false,
        count,
        isPro: false
      });
    }

    // ===== 7. 允许 → 写入 +1 =====
    if (!isPro) {
      count += 1;

      const expireSeconds = Math.floor(
        (new Date(today + "T23:59:59").getTime() - Date.now()) / 1000
      );

      // 👉 关键：正确写入（带TTL）
      await fetch(`${KV_REST_API_URL}/set/${usageKey}`, {
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
    }

    // ===== 8. 返回 =====
    return res.json({
      allowed: true,
      count,
      isPro
    });

  } catch (err) {

    console.error("usage error:", err);

    // 👉 fallback（绝不影响主功能）
    return res.json({
      allowed: true,
      error: "usage check failed"
    });
  }
}