import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const books = await prisma.book.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("[BOOKS_GET]", error);
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
    const { name, description, currency, isDefault } = body;

    if (!name || !currency) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // If making this book default, unset the old default
    if (isDefault) {
      await prisma.book.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const book = await prisma.book.create({
      data: {
        name,
        description,
        currency,
        isDefault: isDefault || false,
        userId: session.user.id,
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error("[BOOKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
