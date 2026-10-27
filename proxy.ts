
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", request.url);

    // Preserve the page the user originally wanted to visit.
    loginUrl.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*"],
};
