import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

// 生成 token
export function signToken(email) {
  return jwt.sign(
    { email },
    JWT_SECRET,
    { expiresIn: "7d" }
  )
}

// 校验 token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}