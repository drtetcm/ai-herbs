import { NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

export function middleware(req) {
  const auth = req.headers.get("authorization")

  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.next()
  }

  try {
    const token = auth.slice(7).trim()
    const payload = verifyToken(token)

    if (!payload || !payload.email) {
      return NextResponse.next()
    }

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-email", payload.email.toLowerCase())

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (e) {
    console.error("middleware error:", e)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/api/:path*"],
}