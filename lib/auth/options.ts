import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ALLOWED_DOMAIN = process.env.ALLOWED_GOOGLE_DOMAIN ?? "yourcompany.com";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { hd: ALLOWED_DOMAIN },
      },
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      return profile?.email?.endsWith(`@${ALLOWED_DOMAIN}`) ?? false;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
