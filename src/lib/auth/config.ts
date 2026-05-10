import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/config/env";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID ?? "",
      clientSecret: env.AUTH_GOOGLE_SECRET ?? "",
    }),
    GitHub({
      clientId: env.AUTH_GITHUB_ID ?? "",
      clientSecret: env.AUTH_GITHUB_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        if (user.isSuspended) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" || account?.provider === "google") {
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const emailLocal = user.email.split("@")[0];
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          let username = `${emailLocal}${randomSuffix}`;

          let isUnique = false;
          while (!isUnique) {
            const duplicate = await prisma.user.findUnique({
              where: { username },
            });
            if (!duplicate) {
              isUnique = true;
            } else {
              const newSuffix = Math.floor(1000 + Math.random() * 9000);
              username = `${emailLocal}${newSuffix}`;
            }
          }

          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              username,
              name: user.name || emailLocal,
              image: user.image,
              emailVerified: new Date(),
            },
          });

          user.id = newUser.id;
        } else {
          user.id = existingUser.id;
        }
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { username: true, isAdmin: true, isSuspended: true, plan: true },
          });
          if (dbUser) {
            token.username = dbUser.username;
            token.isAdmin = dbUser.isAdmin;
            token.isSuspended = dbUser.isSuspended;
            token.plan = dbUser.plan;
          }
        }
      }

      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { username: true, isAdmin: true, isSuspended: true, plan: true },
        });
        if (dbUser) {
          token.username = dbUser.username;
          token.isAdmin = dbUser.isAdmin;
          token.isSuspended = dbUser.isSuspended;
          token.plan = dbUser.plan;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isSuspended = token.isSuspended as boolean;
        session.user.plan = (token.plan as string) ?? "free";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
};
