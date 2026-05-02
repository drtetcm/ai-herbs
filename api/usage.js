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

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return res.json({
      allowed: true,
      remaining: 1
    });
  }

  try {

    // ===== 1. 用户识别 =====
    const { userId } = req.body || {};
    const ip = getIP(req);

    if (!userId || userId.length < 10) {
      return res.json({
        allowed: true,
        count: 0,
        isPro: false,
        remaining: 2
      });
    }

    // ===== 🔥 2. IP 限流 =====
    const ipKey = `ip:${ip}`;

    const ipRes = await fetch(`${KV_REST_API_URL}/get/${ipKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const ipJson = await ipRes.json();
    const ipCount = Number(ipJson.result || 0);

    if (ipCount > 30) {
      return res.json({
        allowed: false,
        error: "Too many requests (IP limited)"
      });
    }

    await fetch(`${KV_REST_API_URL}/incr/${ipKey}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    // ===== 3. 强绑定 user =====
    const userKey = `${userId}:${ip}`;

    // ===== 4. Key =====
    const today = new Date().toISOString().slice(0, 10);
    const usageKey = `usage:${userKey}:${today}`;
    const proKey = `pro:${userKey}`;

    // ===== 5. 查会员 =====
    const proRes = await fetch(`${KV_REST_API_URL}/get/${proKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const proJson = await proRes.json();
    const proExpire = Number(proJson.result || 0);
    const isPro = Date.now() < proExpire;

    // ===== 6. 查使用次数 =====
    const usageRes = await fetch(`${KV_REST_API_URL}/get/${usageKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const usageJson = await usageRes.json();
    const count = Number(usageJson.result || 0);

    // ===== 🔥 7. 免费额度 =====
    const FREE_LIMIT = 2;

    // ===== 🔥 8. 剩余次数（核心）=====
    const remaining = isPro ? "∞" : Math.max(0, FREE_LIMIT - count);

    // ===== 9. 限制 =====
    if (!isPro && count >= FREE_LIMIT) {
      return res.json({
        allowed: false,
        count,
        isPro: false,
        remaining
      });
    }

    // ===== 10. 返回 =====
    return res.json({
      allowed: true,
      count,
      isPro,
      remaining
    });

  } catch (err) {

    console.error("usage error:", err);

    return res.json({
      allowed: true,
      remaining: 1
    });
  }
}