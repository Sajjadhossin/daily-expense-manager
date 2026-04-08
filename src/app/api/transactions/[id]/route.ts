import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        book: true,
        category: true,
      },
    });

    if (!transaction || transaction.book.userId !== session.user.id) {
      return new NextResponse("Transaction not found", { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSACTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { type, amount, date, time, note, categoryId } = body;

    // Verify transaction exists and user owns its book
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!existingTransaction || existingTransaction.book.userId !== session.user.id) {
      return new NextResponse("Transaction not found", { status: 404 });
    }

    // If categoryId is changing, verify the new category belongs to the user
    if (categoryId && categoryId !== existingTransaction.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId, userId: session.user.id },
      });
      if (!categoryExists) {
        return new NextResponse("Category not found", { status: 404 });
      }
    }

    // Update transaction and book balance in a transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Revert old balance
      const oldBalanceChange = existingTransaction.type === 'income' 
        ? -existingTransaction.amount 
        : existingTransaction.amount;
        
      await tx.book.update({
        where: { id: existingTransaction.bookId },
        data: { balance: { increment: oldBalanceChange } }
      });

      // 2. Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          ...(type && { type }),
          ...(amount && { amount: parseFloat(amount) }),
          ...(date && { date: new Date(date) }),
          ...(time !== undefined && { time }),
          ...(note !== undefined && { note }),
          ...(categoryId && { categoryId }),
        },
        include: {
          category: true,
        },
      });

      // 3. Apply new balance
      const newBalanceChange = updatedTransaction.type === 'income' 
        ? updatedTransaction.amount 
        : -updatedTransaction.amount;

      await tx.book.update({
        where: { id: updatedTransaction.bookId },
        data: { balance: { increment: newBalanceChange } }
      });

      return updatedTransaction;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSACTION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!existingTransaction || existingTransaction.book.userId !== session.user.id) {
      return new NextResponse("Transaction not found", { status: 404 });
    }

    // Delete transaction and revert book balance
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Revert balance
      const balanceChange = existingTransaction.type === 'income' 
        ? -existingTransaction.amount 
        : existingTransaction.amount;
        
      await tx.book.update({
        where: { id: existingTransaction.bookId },
        data: { balance: { increment: balanceChange } }
      });

      // 2. Delete transaction
      return await tx.transaction.delete({
        where: { id },
      });
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSACTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
