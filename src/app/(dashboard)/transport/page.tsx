"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, Field } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES } from "@/config/destinations";
import { Plane, GraduationCap } from "lucide-react";

interface TransportGuide {
  id: string; city: string; country: string; systemName: string; description: string;
  studentPassName: string | null; studentPassCost: number | null; monthlyPassCost: number | null; currency: string;
}

export default function TransportPage() {
  const [guides, setGuides] = useState<TransportGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("");

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    const res = await fetch(`/api/transport?${params}`);
    const data = await res.json();
    setGuides(data);
    setLoading(false);
  }, [country]);

  useEffect(() => { fetchGuides(); }, [fetchGuides]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-500">
          <Plane className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-midnight">Transportation Guide</h1>
          <p className="text-slate-500 text-sm">Local transport systems, travel cards, and student discounts</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="max-w-xs">
            <Field label="Filter by Country">
              <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">All countries</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-slate-500 py-8">Loading...</p>
      ) : guides.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">No transport guides available for this filter.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((g) => (
            <Card key={g.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{g.city}, {g.country}</CardTitle>
                  <Badge variant="info">{g.currency}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-midnight mb-2">{g.systemName}</p>
                <p className="text-sm text-slate-600">{g.description}</p>
                <div className="mt-4 space-y-2">
                  {g.studentPassName && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <GraduationCap className="h-4 w-4" />
                        {g.studentPassName}
                      </span>
                      {g.studentPassCost !== null && g.studentPassCost > 0 && (
                        <span className="font-medium text-midnight">{g.studentPassCost} {g.currency}/mo</span>
                      )}
                    </div>
                  )}
                  {g.monthlyPassCost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Regular monthly pass</span>
                      <span className="font-medium">{g.monthlyPassCost} {g.currency}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
