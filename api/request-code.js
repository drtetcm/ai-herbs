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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  let { email } = req.body
  email = email.trim().toLowerCase()

  if (!email) {
    return res.status(400).json({ error: "Missing email" })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()

  await kv.set(`login_code:${email}`, code, { ex: 300 })

  res.json({ success: true, code })
}