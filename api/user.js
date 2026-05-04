export default async function handler(req, res) {
  const email = req.headers["x-user-email"];

  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

  const key = `user:${email}`;

  const defaultUser = {
    plan: "free",
    isPro: false,
    remaining: 2,
    allowed: true
  };

  if (!email) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const r = await fetch(`${KV_REST_API_URL}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      }
    });

    const json = await r.json();
    let user = json.result;

    // ✅ 关键修复（兼容 string / object）
    if (typeof user === "string") {
      try {
        user = JSON.parse(user);
      } catch (e) {
        console.error("❌ JSON parse error:", user);
        user = null;
      }
    }

    console.log("👤 email:", email);
    console.log("👤 user:", user);

    if (!user) {
      return res.json(defaultUser);
    }

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