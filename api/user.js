export default async function handler(req, res) {
  const email = req.query.email;

  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

  const defaultUser = {
    plan: "free",
    isPro: false,
    remaining: 2,
    allowed: true
  };

  if (!email) {
    return res.json(defaultUser);
  }

  try {
    // 🔥 从 KV 读取
    const key = `user:${email}`;

    const r = await fetch(`${KV_REST_API_URL}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      }
    });

    const json = await r.json();

    const user = json.result
      ? JSON.parse(json.result)
      : null;

    if (!user) {
      return res.json(defaultUser);
    }

    // 🔥 过期判断
    const isActive = Date.now() < user.expires;

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