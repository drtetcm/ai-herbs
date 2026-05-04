import { verifyToken } from "../lib/auth";
import { kv } from "@vercel/kv";

export default async function handler(req, res) {

  // 🔥 禁止缓存
  res.setHeader("Cache-Control", "no-store");

  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not logged in" });
  }

  let email = null;

  try {
    const token = auth.slice(7);
    const payload = verifyToken(token);
    email = payload?.email;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (!email) {
    return res.status(401).json({ error: "No email" });
  }

  try {
    // ✅ 官方 KV（替代你原本 REST fetch）
    let user = await kv.get(`user:${email}`);

    console.log("👤 KV user:", user);

    if (!user) {
      return res.json({
        plan: "free",
        isPro: false,
        remaining: 30,
        allowed: true
      });
    }

    const isActive =
      user.plan === "pro" &&
      typeof user.expires === "number" &&
      user.expires > Date.now();

    const days = isActive
  ? Math.ceil((user.expires - Date.now()) / (1000 * 60 * 60 * 24))
  : 0;

return res.json({
  plan: isActive ? "pro" : "free",
  isPro: isActive,
  remaining: isActive ? 9999 : 30,
  days,
  allowed: true
});

  } catch (err) {
    console.error("❌ KV error:", err);

    return res.status(500).json({
      error: "KV failed"
    });
  }
}