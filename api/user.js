export default async function handler(req, res) {
  const email = req.query.email;

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
    const KV_REST_API_URL = process.env.KV_REST_API_URL;
    const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

    const r = await fetch(`${KV_REST_API_URL}/get/user:${email}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      }
    });

    const json = await r.json();
    const user = json.result;

    if (!user) {
      return res.json(defaultUser);
    }

    const isPro = user.plan === "pro" && Date.now() < user.expires;

    return res.json({
      plan: user.plan,
      isPro,
      remaining: isPro ? 9999 : 2,
      allowed: true
    });

  } catch (e) {
    console.error("user error:", e);
    return res.json(defaultUser);
  }
}