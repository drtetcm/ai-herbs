import { NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

export function middleware(req) {
  const auth = req.headers.get("authorization")

  // ✅ 必须是 Bearer token 才处理
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.next()
  }

  const token = auth.slice(7).trim()
  const payload = verifyToken(token)

  if (!payload || !payload.email) {
    return NextResponse.next()
  }

  const requestHeaders = new Headers(req.headers)

  // ✅ 统一小写（避免 Node 里大小写问题）
  requestHeaders.set("x-user-email", payload.email.toLowerCase())

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/api/:path*"],
}