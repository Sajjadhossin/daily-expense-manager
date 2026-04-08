import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        order: 'asc',
      },
    });

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
    const { name, type, icon, color } = body;

    if (!name || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get highest order
    const lastCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        type,
      },
      orderBy: {
        order: 'desc',
      },
    });

    const newOrder = lastCategory ? lastCategory.order + 1 : 1;

    const category = await prisma.category.create({
      data: {
        name,
        type,
        icon: icon || "Tag",
        color: color || "bg-primary-500",
        order: newOrder,
        isSystem: false,
        userId: session.user.id,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
