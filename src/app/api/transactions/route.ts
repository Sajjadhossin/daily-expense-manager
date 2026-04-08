import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const categoryId = searchParams.get("categoryId");

    if (!bookId) {
      return new NextResponse("Book ID is required", { status: 400 });
    }

    // Verify user owns the book
    const bookExists = await prisma.book.findUnique({
      where: { id: bookId, userId: session.user.id },
    });

    if (!bookExists) {
      return new NextResponse("Book not found", { status: 404 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        bookId,
        ...(categoryId && { categoryId }),
      },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        category: true,
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type, amount, date, time, note, bookId, categoryId } = body;

    if (!type || !amount || !date || !bookId || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify ownership of book and category
    const [bookExists, categoryExists] = await Promise.all([
      prisma.book.findUnique({ where: { id: bookId, userId: session.user.id } }),
      prisma.category.findUnique({ where: { id: categoryId, userId: session.user.id } }),
    ]);

    if (!bookExists) {
      return new NextResponse("Book not found", { status: 404 });
    }

    if (!categoryExists) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Create transaction and update book balance in a transaction
    const transaction = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type,
          amount: parseFloat(amount),
          date: new Date(date),
          time,
          note,
          bookId,
          categoryId,
        },
        include: {
          category: true,
        },
      });

      // Update book balance
      const balanceChange = type === 'income' ? parseFloat(amount) : -parseFloat(amount);
      await tx.book.update({
        where: { id: bookId },
        data: {
          balance: {
            increment: balanceChange
          }
        }
      });

      return newTransaction;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSACTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
