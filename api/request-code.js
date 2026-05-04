import { kv } from "@vercel/kv"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: "Missing email" })
  }

  // 生成6位验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  // 存 KV（5分钟过期）
  await kv.set(`login_code:${email}`, code, { ex: 300 })

  // MVP：直接返回验证码（后面再接邮件）
  res.json({
    success: true,
    code
  })
}