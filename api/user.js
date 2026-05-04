export default function handler(req, res) {
  const email = req.query.email;

  const users = global.users || {};

  // 默认返回结构（统一！）
  const defaultUser = {
    plan: "free",
    isPro: false,
    remaining: 2,
    allowed: true
  };

  if (!email || !users[email]) {
    return res.json(defaultUser);
  }

  const user = users[email];

  return res.json({
    plan: user.plan,
    isPro: user.plan === "pro",
    remaining: user.plan === "pro" ? 9999 : 2,
    allowed: true
  });
}