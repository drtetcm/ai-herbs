import { NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

export function middleware(req) {
  const auth = req.headers.get("authorization")

  if (!auth) {
    return NextResponse.next()
  }

  const token = auth.replace("Bearer ", "")
  const payload = verifyToken(token)

  if (!payload) {
    return NextResponse.next()
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-user-email", payload.email)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/api/:path*"],
}