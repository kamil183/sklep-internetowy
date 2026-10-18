import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Real admin authentication.
 * - Passwords are never stored or compared in plain text (bcrypt hash + bcrypt.compare).
 * - There is no self-signup / role-elevation endpoint anywhere in the app: the only way
 *   to create an AdminUser row is the `npm run create-admin` script, run from a trusted
 *   machine with direct DB access. Regular users can never grant themselves admin rights.
 * - Session is a signed JWT (NEXTAUTH_SECRET) validated on every /admin request by middleware.ts.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await prisma.adminUser.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!admin) return null;

        const valid = await bcrypt.compare(credentials.password, admin.passwordHash);
        if (!valid) return null;

        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.uid;
      }
      return session;
    },
  },
};
