// Note: Next.js 16 deprecates middleware.ts in favor of proxy.ts (Node.js runtime only).
// We keep middleware.ts here because next-auth's withAuth requires the edge runtime.
// Migrate to proxy.ts once next-auth supports Node.js runtime for auth guards.
import { withAuth } from "next-auth/middleware";

const ALLOWED_DOMAIN = process.env.ALLOWED_GOOGLE_DOMAIN ?? "yourcompany.com";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      if (!token?.email) return false;
      return token.email.endsWith(`@${ALLOWED_DOMAIN}`);
    },
  },
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|auth).*)"],
};
