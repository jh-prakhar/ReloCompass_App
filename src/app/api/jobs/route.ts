import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { jobSchema } from "@/lib/validators";

// GET - list all jobs (for job seekers) or employer's own jobs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const visaOnly = searchParams.get("visaOnly") === "true";
    const jobType = searchParams.get("jobType") || "";
    const skillFilter = searchParams.get("skills") || "";

    const where: Record<string, unknown> = {};

    if (session.user.role === "EMPLOYER") {
      // Employers see only their own jobs
      where.company = { userId: session.user.id };
    } else {
      // Job seekers see all active jobs
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
        ];
      }
      if (location) {
        where.location = { contains: location };
      }
      if (visaOnly) {
        where.visaSponsorship = true;
      }
      if (jobType) {
        where.jobType = jobType;
      }
      if (skillFilter) {
        where.skills = { contains: skillFilter };
      }
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: true,
        applications: session.user.role !== "EMPLOYER"
          ? { where: { userId: session.user.id } }
          : true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Jobs GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - create a new job (employer only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Only employers can post jobs" }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    });
    if (!company) {
      return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        ...parsed.data,
        companyId: company.id,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Jobs POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
