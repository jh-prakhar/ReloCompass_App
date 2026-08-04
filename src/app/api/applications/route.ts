import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { applicationSchema } from "@/lib/validators";

// POST - apply to a job
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role === "EMPLOYER") {
      return NextResponse.json({ error: "Employers cannot apply to jobs" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const existing = await prisma.application.findUnique({
      where: { jobId_userId: { jobId: parsed.data.jobId, userId: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: {
        jobId: parsed.data.jobId,
        userId: session.user.id,
        coverLetter: parsed.data.coverLetter ?? null,
      },
      include: { job: { include: { company: true } } },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Application POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET - list user's applications (job seeker) or applicants for employer's jobs
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "EMPLOYER") {
      const company = await prisma.company.findUnique({
        where: { userId: session.user.id },
      });
      if (!company) return NextResponse.json([]);

      const applications = await prisma.application.findMany({
        where: { job: { companyId: company.id } },
        include: {
          user: { include: { preference: true } },
          job: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(applications);
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Applications GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
