export default async function handler(req, res) {
  const email = decodeURIComponent(req.query.email || "")
    .trim()
    .toLowerCase();

  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

  const key = `user:${email}`;

  // ===== ✅ 默认返回（统一结构）=====
  const defaultUser = {
    plan: "free",
    isPro: false,
    remaining: 2,
    allowed: true
  };

  // ❌ 没 email
  if (!email) {
    return res.json(defaultUser);
  }

  // ❌ KV 未配置
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    console.warn("⚠️ KV 未配置");
    return res.json(defaultUser);
  }

  try {
    // ===== 🔥 读取 KV =====
    const r = await fetch(`${KV_REST_API_URL}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      }
    });

    const json = await r.json();
    const raw = json.result;

    let user = null;

    // ===== ✅ 正确解析（单层 JSON）=====
    if (raw) {
      try {
        user = JSON.parse(raw);
      } catch (e) {
        console.error("❌ KV解析失败:", raw);
        user = null;
      }
    }

    // 🔍 调试（建议保留一段时间）
    console.log("👤 KV原始:", raw);
    console.log("👤 解析后:", user);

    // ❌ 没用户
    if (!user) {
      return res.json(defaultUser);
    }

    // ===== 🔥 会员判断（最终稳定写法）=====
    const isActive =
      typeof user.expires === "number" &&
      user.expires > Date.now();

    return res.json({
      plan: isActive ? "pro" : "free",
      isPro: isActive,
      remaining: isActive ? 9999 : 2,
      allowed: true
    });

  } catch (err) {
    console.error("❌ user API error:", err);
    return res.json(defaultUser);
  }
}