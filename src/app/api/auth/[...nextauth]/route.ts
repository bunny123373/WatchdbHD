import NextAuth, { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { compare } from "@/lib/auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()

        const user = await User.findOne({ email: credentials.email.toLowerCase() })
        if (!user || !user.password) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: String(user._id),
          email: user.email,
          name: user.username,
          image: user.avatar,
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/settings",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      await connectDB()

      if (account?.provider === "credentials") {
        return true
      }

      const existing = await User.findOne({ email: user.email.toLowerCase() })
      if (existing) {
        if (!existing.provider) {
          await User.findByIdAndUpdate(existing._id, {
            $set: {
              avatar: user.image || existing.avatar,
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
            },
          })
        }
        return true
      }

      const username = user.name
        ? user.name.replace(/\s+/g, "_").toLowerCase()
        : user.email.split("@")[0]

      await User.create({
        username: `${username}_${Date.now()}`.slice(0, 30),
        email: user.email.toLowerCase(),
        avatar: user.image,
        provider: account?.provider,
        providerAccountId: account?.providerAccountId,
      })

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        await connectDB()
        const dbUser = await User.findById(token.sub).select("-password")
        if (dbUser) {
          (session.user as Record<string, unknown>).id = String(dbUser._id)
          session.user.name = dbUser.username
          session.user.email = dbUser.email
          session.user.image = dbUser.avatar || session.user.image
          ;(session.user as Record<string, unknown>).isAdmin = dbUser.isAdmin
          ;(session.user as Record<string, unknown>).preferences = dbUser.preferences || {}
        }
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
