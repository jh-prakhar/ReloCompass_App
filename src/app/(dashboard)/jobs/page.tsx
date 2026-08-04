"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Field, Textarea } from "@/components/ui/input";
import { Briefcase, MapPin, CheckCircle2, DollarSign, Building2 } from "lucide-react";

interface Job {
  id: string; title: string; description: string; skills: string;
  salaryMin: number | null; salaryMax: number | null; currency: string;
  location: string; visaSponsorship: boolean; jobType: string; createdAt: string;
  company: { name: string }; applications?: { id: string }[];
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", location: "", visaOnly: false, jobType: "" });
  const [applyingJob, setApplyingJob] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.location) params.set("location", filters.location);
    if (filters.visaOnly) params.set("visaOnly", "true");
    if (filters.jobType) params.set("jobType", filters.jobType);
    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function handleApply() {
    if (!applyingJob) return;
    await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: applyingJob, coverLetter }) });
    setApplyingJob(null); setCoverLetter(""); fetchJobs();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500">
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-midnight">Jobs</h1>
          <p className="text-slate-500 text-sm">Find opportunities matched to your skills</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Search">
              <Input value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Job title or keyword..." />
            </Field>
            <Field label="Location">
              <Input value={filters.location} onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))} placeholder="City or country..." />
            </Field>
            <Field label="Job Type">
              <Select value={filters.jobType} onChange={(e) => setFilters(f => ({ ...f, jobType: e.target.value }))}>
                <option value="">All types</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
              </Select>
            </Field>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={filters.visaOnly} onChange={(e) => setFilters(f => ({ ...f, visaOnly: e.target.checked }))} className="w-4 h-4 rounded accent-electric" />
                Visa sponsorship only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-slate-500 py-8">Loading...</p>
      ) : jobs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">No jobs found. Try adjusting your filters.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const alreadyApplied = job.applications && job.applications.length > 0;
            return (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-midnight">{job.title}</h3>
                        {job.title.toLowerCase().includes("sample") && <Badge variant="warning">SAMPLE</Badge>}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {job.company.name} · {job.location}</p>
                    </div>
                    {job.visaSponsorship && <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Visa Sponsorship</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.skills.split(",").map((s, i) => (<Badge key={i}>{s.trim()}</Badge>))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm">
                      {job.salaryMin && (
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <DollarSign className="h-3.5 w-3.5" />
                          {job.currency} {job.salaryMin.toLocaleString()}
                          {job.salaryMax && ` - ${job.salaryMax.toLocaleString()}`}
                        </span>
                      )}
                      <span className="text-slate-400 ml-2">{job.jobType.replace("_", " ")}</span>
                    </div>
                    {alreadyApplied ? (
                      <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Applied</Badge>
                    ) : (
                      <Button size="sm" variant="gradient" onClick={() => setApplyingJob(job.id)}>Apply</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Apply modal */}
      {applyingJob && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setApplyingJob(null)}>
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardContent className="pt-6 pb-6">
              <h3 className="text-lg font-semibold mb-4">Apply for this job</h3>
              <Field label="Cover Letter (optional)">
                <Textarea rows={6} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Dear Hiring Manager..." />
              </Field>
              <p className="text-xs text-slate-400 mb-4">Tell the employer why you&apos;t a great fit.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setApplyingJob(null)}>Cancel</Button>
                <Button variant="gradient" className="flex-1" onClick={handleApply}>Submit Application</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
