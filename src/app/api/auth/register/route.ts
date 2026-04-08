import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

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

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and initial data in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          hashedPassword,
        },
      });

      // Seed default categories
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          userId: newUser.id,
        })),
      });

      // Create default book
      await tx.book.create({
        data: {
          name: "Personal Wallet",
          description: "My primary daily expenses",
          isDefault: true,
          currency: "BDT",
          userId: newUser.id,
        },
      });

      return newUser;
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
