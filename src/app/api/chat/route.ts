import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { chatSchema } from "@/lib/validators";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import type { ChatMessage } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { message, sessionId } = parsed.data;

    // Load user profile with preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { preference: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const systemPrompt = buildSystemPrompt({
      name: user.name,
      role: user.role,
      preference: user.preference,
    });

    // Load or create chat session
    let chatSession;
    let history: ChatMessage[] = [];

    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: session.user.id },
      });
      if (chatSession) {
        history = (chatSession.messages as unknown as ChatMessage[]) || [];
      }
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          title: message.slice(0, 60),
          messages: [],
        },
      });
    }

    // Build message list for the LLM
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    const llmMessages = [
      { role: "system" as const, content: systemPrompt },
      ...history.slice(-20).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Call the OpenAI-compatible API
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://llm.drytis.ai";

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 503 }
      );
    }

    const llmResponse = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "z-ai/glm-5",
        messages: llmMessages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error("LLM API error:", llmResponse.status, errText);
      return NextResponse.json(
        { error: "The AI assistant is temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const llmData = await llmResponse.json();
    const assistantContent =
      llmData.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: assistantContent,
      timestamp: new Date().toISOString(),
    };

    // Save updated conversation
    const updatedMessages = [...history, userMessage, assistantMessage];
    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: {
        messages: updatedMessages as never,
        title:
          history.length === 0 ? message.slice(0, 60) : chatSession.title,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      sessionId: chatSession.id,
      message: assistantContent,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong with the AI assistant." },
      { status: 500 }
    );
  }
}

// GET - list chat sessions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        messages: true,
      },
      take: 20,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Chat sessions GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
