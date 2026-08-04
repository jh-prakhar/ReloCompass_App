import { NextResponse } from "next/server";

interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

// In-memory store for contact submissions.
// In production, this would be replaced with a database table or email service.
const submissions: ContactSubmission[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name?.trim() || !body.email?.trim() || !body.subject?.trim() || !body.message?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const submission: ContactSubmission = {
      name: body.name.trim(),
      email: body.email.trim(),
      subject: body.subject.trim(),
      message: body.message.trim(),
      createdAt: new Date().toISOString(),
    };

    submissions.push(submission);

    // In production, you would:
    // 1. Send an email notification to prakharnpp@gmail.com
    // 2. Store in a database
    // 3. Send an auto-reply to the submitter
    console.log(`[Contact] New submission from ${submission.name} <${submission.email}>: ${submission.subject}`);

    return NextResponse.json({ success: true, message: "Message received" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
