"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BrandIcon } from "@/components/brand/logo";
import { Sparkles, MessageSquare, Plus, History, AlertTriangle, Send } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Msg[];
}

const QUICK_PROMPTS: Record<string, string[]> = {
  STUDENT: [
    "I'm moving to a new country for studies. Where do I start?",
    "How do I find affordable student accommodation?",
    "What should I pack for my move abroad?",
    "How do I set up a bank account as an international student?",
  ],
  JOB_SEEKER: [
    "I'm looking for jobs abroad. How should I prepare my CV?",
    "What's the visa process for skilled workers?",
    "How do I negotiate salary for an international job offer?",
    "How do I prepare for interviews in a new country?",
  ],
  EMPLOYER: [
    "How do I write a job description that attracts international talent?",
    "What should I know about visa sponsorship?",
    "How do I verify international candidate documents?",
    "Best practices for onboarding international employees?",
  ],
};

export default function AssistantPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "STUDENT";

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = QUICK_PROMPTS[role] || QUICK_PROMPTS.STUDENT;

  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/chat");
    const data = await res.json();
    setSessions(data);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function loadSession(s: ChatSession) {
    setActiveSessionId(s.id);
    setMessages(s.messages || []);
    setShowHistory(false);
  }

  async function sendMessage(text?: string) {
    const content = text || input.trim();
    if (!content || loading) return;

    setInput("");
    const userMsg: Msg = { role: "user", content, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          ...(activeSessionId ? { sessionId: activeSessionId } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg: Msg = {
          role: "assistant",
          content: `${data.error || "Something went wrong. Please try again."}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } else {
        const assistantMsg: Msg = {
          role: "assistant",
          content: data.message,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (data.sessionId) setActiveSessionId(data.sessionId);
      }
    } catch {
      const errMsg: Msg = {
        role: "assistant",
        content: "Network error. Please check your connection and try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      fetchSessions();
    }
  }

  function newChat() {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
  }

  function formatMessage(content: string) {
    const escaped = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    return escaped
      .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-slate-900 mt-3 mb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="font-bold text-slate-900 mt-3 mb-1">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\n/g, "<br />");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-cyan">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-midnight">AI Relocation Assistant</h1>
            <p className="text-slate-500 text-sm">Personalized guidance for your relocation journey</p>
          </div>
        </div>
        <div className="flex gap-2">
          {sessions.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4" />
              History ({sessions.length})
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={newChat}>
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Session history drawer */}
      {showHistory && sessions.length > 0 && (
        <Card className="mb-4 max-h-48 overflow-y-auto">
          <div className="p-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSession(s)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50 ${
                  activeSessionId === s.id ? "bg-electric/8 text-electric" : "text-slate-700"
                }`}
              >
                <p className="font-medium truncate">{s.title || "Untitled conversation"}</p>
                <p className="text-xs text-slate-400">
                  {new Date(s.updatedAt).toLocaleDateString()} · {(s.messages || []).length} messages
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <BrandIcon size={80} />
            <h2 className="text-xl font-semibold text-midnight mt-4 mb-2">How can I help you today?</h2>
            <p className="text-slate-500 mb-6 max-w-md">
              Ask me anything about relocation, accommodation, jobs, visas, transportation, or settling into your new country.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p)}
                  className="text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-electric hover:bg-electric/5 transition-colors text-sm text-slate-700"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-3 ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}`}>
                <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="chat-bubble-assistant px-4 py-3">
              <div className="flex gap-1">
                <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full inline-block" />
                <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full inline-block" />
                <span className="typing-dot w-2 h-2 bg-slate-400 rounded-full inline-block" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask me anything about your relocation..."
            rows={1}
            className="min-h-[48px] max-h-32 resize-none"
            disabled={loading}
          />
          <Button onClick={() => sendMessage()} disabled={loading || !input.trim()} size="lg" className="flex-shrink-0">
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          AI guidance only. Always verify with official sources for visa, immigration, and legal matters.
        </p>
      </div>
    </div>
  );
}
