import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET - user's favorite accommodation IDs
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { accommodation: true },
    });
    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Favorites GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - toggle favorite
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accommodationId } = await request.json();
    if (!accommodationId) {
      return NextResponse.json({ error: "accommodationId is required" }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_accommodationId: {
          userId: session.user.id,
          accommodationId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    } else {
      await prisma.favorite.create({
        data: { userId: session.user.id, accommodationId },
      });
      return NextResponse.json({ favorited: true }, { status: 201 });
    }
  } catch (error) {
    console.error("Favorites POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
