import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname, search } = request.nextUrl
  const pathWithQuery = `${pathname}${search}`
  const isLoggedIn = Boolean(token)
  const role = token?.role as string | undefined

  if (pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("returnUrl", pathWithQuery)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("returnUrl", pathWithQuery)
      return NextResponse.redirect(loginUrl)
    }
    if (role !== "ADMIN") {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("returnUrl", pathWithQuery)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
}
