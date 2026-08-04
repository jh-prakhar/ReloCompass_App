import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET - search candidates (employers only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Only employers can search candidates" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const skills = searchParams.get("skills") || "";
    const country = searchParams.get("country") || "";
    const experienceMin = searchParams.get("experienceMin");
    const hasVisa = searchParams.get("hasVisa");

    const where: Record<string, unknown> = {
      role: "JOB_SEEKER",
    };

    const prefWhere: Record<string, unknown> = {};
    if (skills) {
      prefWhere.targetJob = { contains: skills };
    }
    if (country) {
      prefWhere.destinationCountry = country;
    }
    if (experienceMin) {
      prefWhere.yearsExperience = { gte: parseInt(experienceMin) };
    }
    if (hasVisa === "true") {
      prefWhere.hasWorkVisa = true;
    }
    if (Object.keys(prefWhere).length > 0) {
      where.preference = prefWhere;
    }

    const candidates = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        role: true,
        preference: true,
      },
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error("Candidates GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
