import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Every /admin/* route (except /admin/login, which withAuth's `pages.signIn`
// already exempts) requires a valid session. Unauthenticated requests are
// redirected to /admin/login — they never reach the page component, so no
// admin data (orders, customers, products) is ever fetched or rendered for
// an unauthenticated visitor.
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: ["/admin/((?!login).*)"],
};
