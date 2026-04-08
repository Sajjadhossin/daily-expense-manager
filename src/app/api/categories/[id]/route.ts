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

    const category = await prisma.category.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
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
    const { name, icon, color, order } = body;

    // Verify ownership
    const categoryExists = await prisma.category.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!categoryExists) {
      return new NextResponse("Category not found", { status: 404 });
    }

    const category = await prisma.category.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name,
        icon,
        color,
        order,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
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
    const categoryExists = await prisma.category.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!categoryExists) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Optional: Protect system categories from deletion if you wanted to
    // if (categoryExists.isSystem) {
    //   return new NextResponse("Cannot delete system categories", { status: 400 });
    // }

    const category = await prisma.category.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
