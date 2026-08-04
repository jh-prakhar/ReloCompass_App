"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, Field } from "@/components/ui/input";
import { COUNTRIES } from "@/config/destinations";
import { COMMUNITY_TYPES } from "@/config/constants";
import { Users, Calendar, MapPin, User, Building2 } from "lucide-react";

interface CommunityGroup {
  id: string; name: string; type: string; city: string | null; country: string | null; description: string; memberCount: number;
}
interface CommunityEvent {
  id: string; title: string; description: string | null; date: string; location: string; organizer: string | null;
}

export default function CommunityPage() {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const params = new URLSearchParams();
      if (country) params.set("country", country);
      const res = await fetch(`/api/community?${params}`);
      const data = await res.json();
      setGroups(data.groups || []);
      setEvents(data.events || []);
      setLoading(false);
    }
    fetchData();
  }, [country]);

  const typeLabel = (t: string) => COMMUNITY_TYPES.find((c) => c.key === t)?.label || t;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-midnight">Community</h1>
          <p className="text-slate-500 text-sm">Connect with student clubs, cultural groups, and events</p>
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

      {events.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-midnight mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-electric" />
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <Card key={ev.id}>
                <CardContent className="py-4">
                  <h3 className="font-semibold text-midnight">{ev.title}</h3>
                  {ev.description && <p className="text-sm text-slate-600 mt-1">{ev.description}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {ev.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {ev.organizer && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {ev.organizer}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-midnight mb-3 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-electric" />
          Community Groups
        </h2>
        {loading ? (
          <p className="text-slate-500 py-4">Loading...</p>
        ) : groups.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-slate-500">No community groups found for this filter.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <Card key={g.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="electric">{typeLabel(g.type)}</Badge>
                    <span className="text-xs text-slate-400">{g.memberCount.toLocaleString()} members</span>
                  </div>
                  <h3 className="font-semibold text-midnight">{g.name}</h3>
                  <p className="text-sm text-slate-500">{g.city ? `${g.city}, ` : ""}{g.country}</p>
                  <p className="text-sm text-slate-600 mt-2">{g.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
