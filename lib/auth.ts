
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import { SecurityService } from "./security";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          // Rate limiting by IP
          const clientIP = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown';
          if (!SecurityService.checkRateLimit(`login:${clientIP}`, 5, 15 * 60 * 1000)) {
            throw new Error('Too many login attempts. Please try again later.');
          }

          // Rate limiting by email
          if (!SecurityService.checkRateLimit(`email:${credentials.email}`, 3, 10 * 60 * 1000)) {
            throw new Error('Too many attempts for this email. Please try again later.');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await SecurityService.verifyPassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Reset rate limits on successful login
          SecurityService.resetRateLimit(`login:${clientIP}`);
          SecurityService.resetRateLimit(`email:${credentials.email}`);

          console.log("User authenticated successfully:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.sessionId = SecurityService.generateSecureToken();
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string || token.sub!;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
