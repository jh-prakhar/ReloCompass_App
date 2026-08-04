import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assistant/:path*",
    "/accommodation/:path*",
    "/transport/:path*",
    "/jobs/:path*",
    "/candidates/:path*",
    "/community/:path*",
    "/budget/:path*",
    "/checklist/:path*",
    "/profile/:path*",
  ],
};
