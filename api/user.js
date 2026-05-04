export default async function handler(req, res) {
  const email = (req.query.email || "").trim().toLowerCase();
  const key = `user:${email}`;

  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

  const defaultUser = {
    plan: "free",
    isPro: false,
    remaining: 2,
    allowed: true
  };

  if (!email) return res.json(defaultUser);
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return res.json(defaultUser);

  try {
    const r = await fetch(`${KV_REST_API_URL}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      }
    });

    const json = await r.json();

    let user = null;

    if (json.result) {
      try {
        // ✅ 新格式（推荐）
        user = JSON.parse(json.result);
      } catch {
        try {
          // ✅ 兼容旧格式（你之前的 bug）
          user = JSON.parse(JSON.parse(json.result));
        } catch {
          user = null;
        }
      }
    }

    if (!user) return res.json(defaultUser);

    const isActive =
      user.expires &&
      Number.isFinite(user.expires) &&
      Date.now() < user.expires;

    return res.json({
      plan: isActive ? "pro" : "free",
      isPro: isActive,
      remaining: isActive ? 9999 : 2,
      allowed: true
    });

  } catch (err) {
    console.error("user error:", err);
    return res.json(defaultUser);
  }
}