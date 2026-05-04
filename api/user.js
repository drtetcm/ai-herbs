export default async function handler(req, res) {
  const email = decodeURIComponent(req.query.email || "")
    .trim()
    .toLowerCase();
  const key = `user:${email}`;

  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

  // ✅ 默认返回（统一结构）
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

  // ❌ 没 KV（本地/异常环境）
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    console.warn("⚠️ KV 未配置");
    return res.json(defaultUser);
  }

  try {
    // 🔥 从 KV 读取
    const r = await fetch(`${KV_REST_API_URL}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      }
    });

    const json = await r.json();
    let raw = json.result;
    let user = null;

    // ✅ 兼容所有历史数据格式（关键）
    if (raw) {
      try {
        // 情况1：标准 JSON
        user = JSON.parse(raw);
      } catch {
        try {
          // 情况2：被包了一层字符串（你之前的 bug）
          user = JSON.parse(JSON.parse(raw));
        } catch (e) {
          console.error("❌ KV解析失败:", raw);
          user = null;
        }
      }
    }

    // 🔍 调试日志（建议保留）
    console.log("👤 KV原始:", raw);
    console.log("👤 解析后:", user);

    // ❌ 没用户
    if (!user) {
      return res.json(defaultUser);
    }

    // 🔥 过期判断（最终稳定写法）
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