import { verifyToken } from "../lib/auth";

export default async function handler(req, res) {

  // 🔥🔥🔥 关键：禁止缓存（否则前端拿旧数据）
  res.setHeader("Cache-Control", "no-store");

  // ✅ 从 Authorization 解析用户
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not logged in" });
  }

  let email = null;

  try {
    const token = auth.slice(7);
    const payload = verifyToken(token);
    email = payload?.email;
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (!email) {
    return res.status(401).json({ error: "No email" });
  }

  // ===== KV 配置 =====
  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

  const key = `user:${email}`;

  const defaultUser = {
    plan: "free",
    isPro: false,
    remaining: 30,
    allowed: true,
  };

  try {
    const r = await fetch(`${KV_REST_API_URL}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
    });

    const json = await r.json();
    const raw = json?.result;

    let user = null;

    if (raw) {
      try {
        user = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        user = raw;
      }
    }

    console.log("👤 email:", email);
    console.log("👤 KV user:", user);

    // ✅ 没用户 → 返回默认
    if (!user) {
      return res.json(defaultUser);
    }

    // ✅ 判断会员是否有效
    const isActive =
      user.plan === "pro" &&
      typeof user.expires === "number" &&
      user.expires > Date.now();

    return res.json({
      plan: isActive ? "pro" : "free",
      isPro: isActive,
      remaining: isActive ? 9999 : 30,
      allowed: true,
    });

  } catch (err) {
    console.error("❌ user API error:", err);

    return res.json(defaultUser);
  }
}