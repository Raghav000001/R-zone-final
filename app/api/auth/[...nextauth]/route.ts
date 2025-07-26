import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextRequest, NextResponse } from "next/server";

// Minimal NextAuth configuration. Replace with your providers as needed.
const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        // Replace with your own logic
        if (credentials?.username === "admin" && credentials?.password === "admin") {
          return { id: "1", name: "Admin" };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET || "changeme",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
