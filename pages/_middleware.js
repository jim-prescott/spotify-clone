import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req) {
  const secret = process.env.JWT_SECRET
  const token = await getToken({ req, secret })

  const { pathname } = req.nextUrl

  // req for next-auth session or valid token
  if (pathname.includes('/api/auth/') || token) {
    // let them through
    return NextResponse.next()
  }

  // no token and requesting access to protected route
  if (!token && pathname !== '/login') {
    // don't let them through
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
}
