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
    return res.status(500).json({
      allowed: true,
      error: "KV not configured"
    });
  }

  try {

    // ===== ✅ 1. 获取 userId + IP =====
    const { userId } = req.body || {};
    const ip = getIP(req);

    // ===== 🔥 IP 限流（放这里）=====
    const ipKey = `ip:${ip}`;

    // 👉 获取当前IP调用次数
    const ipRes = await fetch(`${KV_REST_API_URL}/get/${ipKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const ipJson = await ipRes.json();
    const ipCount = Number(ipJson.result || 0);

    // 👉 限制（建议20~50）
    if (ipCount > 30) {
      return res.json({
      allowed: false,
      error: "Too many requests (IP limited)"
      });
    }  

    // 👉 自增
    await fetch(`${KV_REST_API_URL}/incr/${ipKey}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    if (!userId || userId.length < 10) {
      return res.status(400).json({ allowed: false });
    }

    // 🔥 核心：强绑定
    const userKey = `${userId}:${ip}`;

    // ===== 2. Key =====
    const today = new Date().toISOString().slice(0, 10);

    const usageKey = `usage:${userKey}:${today}`;
    const proKey = `pro:${userKey}`;

    // ===== 3. 查会员 =====
    const proRes = await fetch(`${KV_REST_API_URL}/get/${proKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const proJson = await proRes.json();
    const proExpire = Number(proJson.result || 0);
    const isPro = Date.now() < proExpire;

    // ===== 4. 查使用次数 =====
    const usageRes = await fetch(`${KV_REST_API_URL}/get/${usageKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const usageJson = await usageRes.json();
    let count = Number(usageJson.result || 0);

    // ===== ✅ 5. 限制逻辑（2次免费）=====
    if (!isPro && count >= 2) {
      return res.json({
        allowed: false,
        count,
        isPro: false
      });
    }

    // ===== 6. 返回 =====
    return res.json({
      allowed: true,
      count,
      isPro
    });

  } catch (err) {

    console.error("usage error:", err);

    return res.json({
      allowed: true,
      error: "usage check failed"
    });
  }
}