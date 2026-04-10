import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { prisma } from "./db";

const DEFAULT_CATEGORIES = [
  // Income
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: 'bg-emerald-500', isSystem: true, order: 1 },
  { name: 'Business', type: 'income', icon: 'TrendingUp', color: 'bg-blue-500', isSystem: true, order: 2 },
  { name: 'Loan', type: 'income', icon: 'Landmark', color: 'bg-indigo-500', isSystem: true, order: 3 },
  { name: 'Gifts', type: 'income', icon: 'Gift', color: 'bg-pink-500', isSystem: true, order: 4 },
  { name: 'Other', type: 'income', icon: 'PlusCircle', color: 'bg-gray-500', isSystem: true, order: 99 },
  // Expense
  { name: 'Food', type: 'expense', icon: 'Utensils', color: 'bg-orange-500', isSystem: true, order: 1 },
  { name: 'Transport', type: 'expense', icon: 'Car', color: 'bg-yellow-500', isSystem: true, order: 2 },
  { name: 'Rent', type: 'expense', icon: 'Home', color: 'bg-purple-500', isSystem: true, order: 3 },
  { name: 'Bills', type: 'expense', icon: 'FileText', color: 'bg-cyan-500', isSystem: true, order: 4 },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingCart', color: 'bg-rose-500', isSystem: true, order: 5 },
  { name: 'Health', type: 'expense', icon: 'HeartPulse', color: 'bg-red-500', isSystem: true, order: 6 },
  { name: 'Other', type: 'expense', icon: 'MinusCircle', color: 'bg-gray-500', isSystem: true, order: 99 },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  events: {
    async createUser({ user }) {
      if (!user.id) return;

      await prisma.$transaction(async (tx) => {
        await tx.category.createMany({
          data: DEFAULT_CATEGORIES.map(cat => ({
            ...cat,
            userId: user.id!,
          })),
        });

        await tx.book.create({
          data: {
            name: "Personal Wallet",
            description: "My primary daily expenses",
            isDefault: true,
            currency: "BDT",
            userId: user.id!,
          },
        });
      });
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
});
