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

  // ===== ✅ 统一安全返回（永不 null）=====
  const safeReturn = (data = {}) => {
    return res.json({
      allowed: true,
      count: 0,
      isPro: false,
      remaining: 0,
      ...data,
      remaining:
        typeof data.remaining === "number"
          ? data.remaining
          : 0
    });
  };

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return safeReturn({ remaining: 1 });
  }

  try {

    // ===== ✅ 参数（统一入口）=====
    const userId =
      req.body?.userId ||
      req.query?.userId ||
      null;

    const execExpireRaw =
      req.body?.execExpire ||
      req.query?.execExpire ||
      0;

    const execExpire = Number(execExpireRaw) || 0;

    const ip = getIP(req);

    // ===== 用户兜底 =====
    if (!userId || userId.length < 10) {
      return safeReturn({ remaining: 2 });
    }

    // ===== IP 限流 =====
    const ipKey = `ip:${ip}`;

    const ipRes = await fetch(`${KV_REST_API_URL}/get/${ipKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const ipJson = await ipRes.json();
    const ipCount = Number(ipJson.result || 0);

    if (ipCount > 30) {
      return safeReturn({
        allowed: false,
        remaining: 0
      });
    }

    await fetch(`${KV_REST_API_URL}/incr/${ipKey}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    // ===== Key =====
    const userKey = userId;
    const today = new Date().toISOString().slice(0, 10);

    const usageKey = `usage:${userKey}:${today}`;
    const proKey = `pro:${userKey}`;

    // ===== KV会员 =====
    const proRes = await fetch(`${KV_REST_API_URL}/get/${proKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const proJson = await proRes.json();
    const proExpire = Number(proJson.result || 0);

    const now = Date.now();

    // ===== ✅ 统一会员逻辑 =====
    const isKvPro = now < proExpire;
    const isExec = execExpire > 0 && now < execExpire;

    const isPro = isKvPro || isExec;

    // ===== 使用次数 =====
    const usageRes = await fetch(`${KV_REST_API_URL}/get/${usageKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });

    const usageJson = await usageRes.json();
    const count = Number(usageJson.result || 0);

    const FREE_LIMIT = 2;

    // ===== ✅ 核心统一 =====
    const allowed = isPro || count < FREE_LIMIT;

    const remaining = isPro
      ? 9999
      : Math.max(0, FREE_LIMIT - count);

    // ===== 返回 =====
    return safeReturn({
      allowed,
      count,
      isPro,
      remaining
    });

  } catch (err) {

    console.error("usage error:", err);

    return safeReturn({ remaining: 1 });
  }
}