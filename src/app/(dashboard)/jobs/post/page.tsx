"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { FileText } from "lucide-react";

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", skills: "", salaryMin: "", salaryMax: "",
    location: "", visaSponsorship: false, jobType: "FULL_TIME",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to post job"); return; }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-midnight">Post a Job</h1>
          <p className="text-slate-500 text-sm">Create a new posting to attract international talent</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Job Title">
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g., Senior Software Engineer" required />
            </Field>
            <Field label="Job Description">
              <Textarea rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the role, responsibilities, and requirements..." required />
            </Field>
            <Field label="Required Skills">
              <Input value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="JavaScript, React, Node.js" required />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Salary Min (annual)">
                <Input type="number" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} placeholder="e.g., 60000" />
              </Field>
              <Field label="Salary Max (annual)">
                <Input type="number" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} placeholder="e.g., 90000" />
              </Field>
            </div>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g., Berlin, Germany" required />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Job Type">
                <Select value={form.jobType} onChange={(e) => update("jobType", e.target.value)}>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                </Select>
              </Field>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.visaSponsorship} onChange={(e) => update("visaSponsorship", e.target.checked)} className="w-4 h-4 rounded accent-electric" />
                  Offers visa sponsorship
                </label>
              </div>
            </div>
            <Button type="submit" variant="gradient" size="lg" className="w-full" loading={loading}>Post Job</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
