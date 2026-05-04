function getIP(req) {
  return (
    req.headers["x-vercel-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

export default async function handler(req, res) {
  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

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
          : 0,
    });
  };

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return safeReturn({ remaining: 1 });
  }

  try {
    // ===== 参数 =====
    const userId =
      req.body?.userId ||
      req.query?.userId ||
      null;

    const emailRaw =
      req.body?.email ||
      req.query?.email ||
      "";

    const email = decodeURIComponent(emailRaw || "")
      .trim()
      .toLowerCase();

    const execExpireRaw =
      req.body?.execExpire ||
      req.query?.execExpire ||
      0;

    const execExpire = Number(execExpireRaw || 0);

    const ip = getIP(req);

    // ===== userId校验（加强）=====
    if (!userId || !/^[a-zA-Z0-9_-]{8,}$/.test(userId)) {
      return safeReturn({ remaining: 2 });
    }

    // ===== IP 限流 =====
    const ipKey = `ip:${ip}`;

    const ipRes = await fetch(`${KV_REST_API_URL}/get/${ipKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    });

    const ipJson = await ipRes.json();
    const ipCount = Number(ipJson.result || 0);

    if (ipCount > 30) {
      return safeReturn({
        allowed: false,
        isPro: false,
        remaining: 0,
      });
    }

    await fetch(`${KV_REST_API_URL}/incr/${ipKey}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    });

    // ===== 🔥 KV会员判断（唯一可信来源）=====
    let isKvPro = false;

    if (email) {
      try {
        const userRes = await fetch(
          `${KV_REST_API_URL}/get/user:${email}`,
          {
            headers: {
              Authorization: `Bearer ${KV_REST_API_TOKEN}`,
            },
          }
        );

        const userJson = await userRes.json();
        const raw = userJson.result;

        if (raw) {
          let user = null;

          // ✅ 兼容历史数据格式
          try {
            user = JSON.parse(raw);
          } catch {
            try {
              user = JSON.parse(JSON.parse(raw));
            } catch {
              user = null;
            }
          }

          if (
            user &&
            typeof user.expires === "number" &&
            user.expires > Date.now()
          ) {
            isKvPro = true;
          }
        }
      } catch (e) {
        console.error("❌ KV user读取失败:", e);
      }
    }

    // ===== Executive（仅作为补充，不可信）=====
    const isExec =
      execExpire > 0 &&
      Number.isFinite(execExpire) &&
      Date.now() < execExpire;

    // ===== 最终会员状态 =====
    const isPro = Boolean(isKvPro || isExec);

    // ===== 使用次数 =====
    const today = new Date().toISOString().slice(0, 10);
    const usageKey = `usage:${userId}:${today}`;

    const usageRes = await fetch(`${KV_REST_API_URL}/get/${usageKey}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    });

    const usageJson = await usageRes.json();
    const count = Number(usageJson.result || 0);

    const FREE_LIMIT = 2;

    const allowed = isPro || count < FREE_LIMIT;

    const remaining = isPro
      ? 9999
      : Math.max(0, FREE_LIMIT - count);

    return safeReturn({
      allowed,
      count,
      isPro,
      remaining,
    });

  } catch (err) {
    console.error("usage error:", err);
    return safeReturn({ remaining: 1 });
  }
}