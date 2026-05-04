import { kv } from "@vercel/kv"
import { signToken } from "../lib/auth"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ error: "Missing params" })
  }

  // 读取验证码
  const savedCode = await kv.get(`login_code:${email}`)

  if (!savedCode || savedCode !== code) {
    return res.status(400).json({ error: "Invalid code" })
  }

  // 获取或创建用户
  let user = await kv.get(`user:${email}`)

  if (!user) {
    user = {
      email,
      plan: "free",
      createdAt: Date.now()
    }

    await kv.set(`user:${email}`, user)
  }

  // 生成 JWT
  const token = signToken(email)

  res.json({
    token,
    user
  })
}