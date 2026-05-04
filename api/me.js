export default function handler(req, res) {
  const email =
    req.headers["x-user-email"] ||
    req.headers["X-User-Email"]

  if (!email) {
    return res.status(401).json({ error: "Not logged in" })
  }

  res.json({
    email
  })
}