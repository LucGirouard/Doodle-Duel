import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the user is authenticated, allow access
    if (req.nextauth.token) {
      return NextResponse.next();
    }

    // Redirect to login page if not authenticated
    return NextResponse.redirect(new URL("/login", req.url));
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Define which routes should be protected
export const config = {
  matcher: [
    /*
     * Only protect quickplay routes - these require authentication
     * All other routes (home, leaderboard, login, etc.) are public
     */
    "/quickplay/:path*",
  ],
};