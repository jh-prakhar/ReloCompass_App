"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Briefcase, Building2, ArrowLeft, ArrowRight, Check } from "lucide-react";

const ROLES = [
  { value: "STUDENT", label: "International Student", Icon: GraduationCap, desc: "Moving abroad for higher education" },
  { value: "JOB_SEEKER", label: "Skilled Worker / Job Seeker", Icon: Briefcase, desc: "Relocating for employment opportunities" },
  { value: "EMPLOYER", label: "Employer / Business", Icon: Building2, desc: "Hire international talent from India & Nepal" },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<string>("");
  const [form, setForm] = useState({ name: "", email: "", password: "", companyName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (step === 1 && !role) { setError("Please select an account type"); return; }
    if (step === 1) { setStep(2); return; }
    if (role === "EMPLOYER" && !form.companyName.trim()) { setError("Company name is required for employer accounts"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }

      const signInRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (signInRes?.ok) { router.push("/dashboard"); router.refresh(); }
      else { router.push("/login"); }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg shadow-xl border-slate-100">
      <CardContent className="pt-8 pb-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-midnight">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1 ? "Choose your account type" : "Tell us about yourself"}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? "bg-electric" : "bg-slate-200"}`} />
          <div className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? "bg-electric" : "bg-slate-200"}`} />
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    role === r.value
                      ? "border-electric bg-electric/5"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${role === r.value ? "bg-electric text-white" : "bg-slate-100 text-slate-600"}`}>
                    <r.Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-midnight">{r.label}</p>
                    <p className="text-sm text-slate-500">{r.desc}</p>
                  </div>
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${role === r.value ? "border-electric bg-electric" : "border-slate-300"}`}>
                    {role === r.value && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              ))}
              <Button type="submit" variant="gradient" className="w-full" size="lg">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {role === "EMPLOYER" && (
                <Field label="Company Name">
                  <Input value={form.companyName} onChange={(e) => updateField("companyName", e.target.value)} placeholder="Acme Corp Inc." required />
                </Field>
              )}
              <Field label="Full Name">
                <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Your full name" required />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="you@example.com" required autoComplete="email" />
              </Field>
              <Field label="Password" error={undefined}>
                <Input type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
                <p className="mt-1 text-xs text-slate-400">At least 8 characters</p>
              </Field>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" variant="gradient" className="flex-1" size="lg" loading={loading}>
                  Create account
                </Button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-electric hover:underline">Log in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
