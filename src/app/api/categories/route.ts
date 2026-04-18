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

    const allCategories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // If bookId is provided, return book-specific categories + global ones (bookId = null).
    // Global includes system defaults and legacy user-created categories.
    const categories = bookId
      ? allCategories.filter(c => c.bookId === bookId || c.bookId === null)
      : allCategories;

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
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
    const { name, type, icon, color, bookId } = body;

    if (!name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get highest order across all categories for this user
    const lastCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        order: 'desc',
      },
    });

    const newOrder = lastCategory ? lastCategory.order + 1 : 1;

    const category = await prisma.category.create({
      data: {
        name,
        type: type || "general",
        icon: icon || "Tag",
        color: color || "bg-primary-500",
        order: newOrder,
        isSystem: false,
        userId: session.user.id,
        ...(bookId ? { bookId } : {}),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
