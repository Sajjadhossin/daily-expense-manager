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

    const book = await prisma.book.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!book) {
      return new NextResponse("Book not found", { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("[BOOK_GET]", error);
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
    const { name, description, currency, isDefault } = body;

    // Verify ownership
    const bookExists = await prisma.book.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!bookExists) {
      return new NextResponse("Book not found", { status: 404 });
    }

    // Handle default book switching
    if (isDefault) {
      await prisma.book.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: id }, // Don't update the current book yet
        },
        data: {
          isDefault: false,
        },
      });
    }

    const book = await prisma.book.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name,
        description,
        currency,
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error("[BOOK_PATCH]", error);
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

    // Verify ownership
    const bookExists = await prisma.book.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!bookExists) {
      return new NextResponse("Book not found", { status: 404 });
    }

    if (bookExists.isDefault) {
      return new NextResponse("Cannot delete the default book", { status: 400 });
    }

    const book = await prisma.book.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error("[BOOK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
