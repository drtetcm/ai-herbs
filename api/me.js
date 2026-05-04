import { verifyToken } from "../lib/auth"

export default function handler(req, res) {
  const auth = req.headers.authorization

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not logged in" })
  }

  try {
    const token = auth.slice(7)
    const payload = verifyToken(token)

    return res.json({
      email: payload.email
    })
  } catch {
    return res.status(401).json({ error: "Invalid token" })
  }
}