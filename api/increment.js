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

  // ===== ❗KV保护 =====
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return res.status(200).json({
      success: true,
      count: 1
    });
  }

  try {
    const { userId } = req.body || {};

    // ===== 🔥 强校验（防刷）=====
    if (!userId || !/^[a-zA-Z0-9_-]{10,}$/.test(userId)) {
      return res.status(400).json({ error: "invalid userId" });
    }

    const ip = getIP(req);

    // ===== 🔥 绑定用户 + IP =====
    const userKey = `${userId}:${ip}`;
    const today = new Date().toISOString().slice(0, 10);
    const usageKey = `usage:${userKey}:${today}`;

    // ===== 🔥 原子递增 =====
    const incrRes = await fetch(`${KV_REST_API_URL}/incr/${usageKey}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      }
    });

    if (!incrRes.ok) {
      throw new Error("KV incr失败");
    }

    const incrJson = await incrRes.json();

    // ❗防 NaN
    const count = Number(incrJson.result ?? incrJson ?? 1);

    // ===== 🔥 设置TTL（仅首次）=====
    if (count === 1) {
      const expireSeconds = Math.floor(
        (new Date(today + "T23:59:59").getTime() - Date.now()) / 1000
      );

      const expireRes = await fetch(
        `${KV_REST_API_URL}/expire/${usageKey}/${expireSeconds}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${KV_REST_API_TOKEN}`
          }
        }
      );

      if (!expireRes.ok) {
        console.warn("⚠️ TTL设置失败:", usageKey);
      }
    }

    // ===== 🔥 全局统计（容错）=====
    const totalKey = `total:${today}`;

    try {
      await fetch(`${KV_REST_API_URL}/incr/${totalKey}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KV_REST_API_TOKEN}`
        }
      });
    } catch (e) {
      console.warn("⚠️ total统计失败:", e.message);
    }

    return res.json({
      success: true,
      count
    });

  } catch (err) {
    console.error("❌ increment error:", err);

    return res.status(200).json({
      success: false,
      count: 1
    });
  }
}