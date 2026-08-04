"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Field } from "@/components/ui/input";
import { COUNTRIES } from "@/config/destinations";
import { Search, Briefcase, MapPin, GraduationCap, Languages, DollarSign, ShieldCheck } from "lucide-react";

interface Candidate {
  id: string; name: string; role: string;
  preference: {
    destinationCountry: string | null; targetJob: string | null; yearsExperience: number | null;
    education: string | null; languages: string | null; hasWorkVisa: boolean | null;
    expectedSalary: number | null; careerGoals: string | null;
  } | null;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skills: "", country: "", experienceMin: "", hasVisa: false });

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.skills) params.set("skills", filters.skills);
    if (filters.country) params.set("country", filters.country);
    if (filters.experienceMin) params.set("experienceMin", filters.experienceMin);
    if (filters.hasVisa) params.set("hasVisa", "true");
    const res = await fetch(`/api/candidates?${params}`);
    const data = await res.json();
    setCandidates(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
          <Search className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-midnight">Find Candidates</h1>
          <p className="text-slate-500 text-sm">Search international talent for your openings</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Skills / Job Title">
              <Input value={filters.skills} onChange={(e) => setFilters(f => ({ ...f, skills: e.target.value }))} placeholder="e.g., React" />
            </Field>
            <Field label="Target Country">
              <Select value={filters.country} onChange={(e) => setFilters(f => ({ ...f, country: e.target.value }))}>
                <option value="">All countries</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Min Experience (years)">
              <Input type="number" value={filters.experienceMin} onChange={(e) => setFilters(f => ({ ...f, experienceMin: e.target.value }))} placeholder="e.g., 3" />
            </Field>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={filters.hasVisa} onChange={(e) => setFilters(f => ({ ...f, hasVisa: e.target.checked }))} className="w-4 h-4 rounded accent-electric" />
                Has work visa
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-slate-500 py-8">Loading...</p>
      ) : candidates.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">No candidates found. Try adjusting your filters.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((c) => {
            const p = c.preference;
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric to-cyan text-white flex items-center justify-center font-semibold">
                      {c.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-midnight">{c.name}</h3>
                      {p?.targetJob && <p className="text-sm text-slate-500">{p.targetJob}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-slate-600">
                    {p?.yearsExperience != null && <p className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-slate-400" /> {p.yearsExperience} years experience</p>}
                    {p?.destinationCountry && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> Wants to work in {p.destinationCountry}</p>}
                    {p?.education && <p className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-slate-400" /> {p.education}</p>}
                    {p?.languages && <p className="flex items-center gap-1.5"><Languages className="h-3.5 w-3.5 text-slate-400" /> {p.languages}</p>}
                    {p?.expectedSalary && <p className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-slate-400" /> Expects ${p.expectedSalary.toLocaleString()}/yr</p>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p?.hasWorkVisa && <Badge variant="success"><ShieldCheck className="h-3 w-3" /> Has Visa</Badge>}
                    {!p?.hasWorkVisa && p?.hasWorkVisa !== null && <Badge variant="warning">Needs Visa</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
