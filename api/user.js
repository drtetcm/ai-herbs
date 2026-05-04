export default async function handler(req, res) {
  // ✅ 兼容大小写（Node 有时会变）
  const email =
    req.headers["x-user-email"] ||
    req.headers["X-User-Email"] ||
    null

  const KV_REST_API_URL = process.env.KV_REST_API_URL
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN

  const defaultUser = {
    plan: "free",
    isPro: false,
    remaining: 2,
    allowed: true
  }

  // 🚨 强制必须登录
  if (!email) {
    return res.status(401).json({ error: "Not logged in" })
  }

  const key = `user:${email}`

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    console.warn("⚠️ KV 未配置")
    return res.json(defaultUser)
  }

  try {
    const r = await fetch(`${KV_REST_API_URL}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      }
    })

    const json = await r.json()
    const raw = json.result

    let user = null

    if (raw) {
      try {
        user = JSON.parse(raw)
      } catch (e) {
        console.error("❌ KV解析失败:", raw)
        user = null
      }
    }

    if (!user) {
      return res.json(defaultUser)
    }

    const isActive =
      typeof user.expires === "number" &&
      user.expires > Date.now()

    return res.json({
      plan: isActive ? "pro" : "free",
      isPro: isActive,
      remaining: isActive ? 9999 : 2,
      allowed: true
    })

  } catch (err) {
    console.error("❌ user API error:", err)
    return res.json(defaultUser)
  }
}