import { verifyToken } from "../lib/auth"

function getUserEmail(req) {
  const auth = req.headers.authorization

  if (!auth || !auth.startsWith("Bearer ")) {
    return null
  }

  try {
    const token = auth.slice(7)
    const payload = verifyToken(token)
    return payload?.email || null
  } catch {
    return null
  }
}

import { kv } from "@vercel/kv"
import { signToken } from "../lib/auth"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  let { email, code } = req.body
  email = email.trim().toLowerCase()

  if (!email || !code) {
    return res.status(400).json({ error: "Missing params" })
  }

  const savedCode = await kv.get(`login_code:${email}`)

  if (!savedCode || savedCode.toString() !== code.toString()) {
    return res.status(400).json({ error: "Invalid code" })
  }

  let user = await kv.get(`user:${email}`)

  if (!user) {
    user = {
      email,
      plan: "free",
      createdAt: Date.now()
    }
    await kv.set(`user:${email}`, user)
  }

  const token = signToken(email)

  res.json({ token, user })
}