import { NextResponse } from "next/server"
import NextAuth from "next-auth"

import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = Boolean(req.auth)
  const role = req.auth?.user?.role

  if (pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin)
      loginUrl.searchParams.set("returnUrl", pathname + req.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin)
      loginUrl.searchParams.set("returnUrl", pathname + req.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }
    if (role !== "ADMIN") {
      const loginUrl = new URL("/login", req.nextUrl.origin)
      loginUrl.searchParams.set("returnUrl", pathname + req.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
}
