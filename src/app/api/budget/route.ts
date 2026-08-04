import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET - budget estimates, optionally filtered by city/country
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city") || "";
    const country = searchParams.get("country") || "";

    const where: Record<string, unknown> = {};
    if (city) where.city = { contains: city };
    if (country) where.country = country;

    const estimates = await prisma.budgetEstimate.findMany({
      where,
      orderBy: { category: "asc" },
    });

    return NextResponse.json(estimates);
  } catch (error) {
    console.error("Budget GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
