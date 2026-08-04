import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET - list accommodations with optional filters
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || "";
    const country = searchParams.get("country") || "";
    const type = searchParams.get("type") || "";
    const maxRent = searchParams.get("maxRent");
    const minSafety = searchParams.get("minSafety");

    const where: Record<string, unknown> = {};
    if (city) where.city = { contains: city };
    if (country) where.country = country;
    if (type) where.type = type;
    if (maxRent) where.monthlyRent = { lte: parseFloat(maxRent) };
    if (minSafety) where.safetyRating = { gte: parseInt(minSafety) };

    const accommodations = await prisma.accommodation.findMany({
      where,
      orderBy: { monthlyRent: "asc" },
      include: {
        favorites: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    return NextResponse.json(accommodations);
  } catch (error) {
    console.error("Accommodation GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
