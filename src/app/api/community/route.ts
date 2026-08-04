import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET - community groups + events
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

    const [groups, events] = await Promise.all([
      prisma.communityGroup.findMany({
        where: Object.keys(where).length > 0 ? where : {},
        orderBy: { memberCount: "desc" },
      }),
      prisma.communityEvent.findMany({
        where: {
          date: { gte: new Date() },
        },
        orderBy: { date: "asc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({ groups, events });
  } catch (error) {
    console.error("Community GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
