"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, Input, Field } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES, CITIES, ACCOMMODATION_TYPES, ACCOMMODATION_TYPE_LABELS } from "@/config/destinations";
import { SAFETY_TIPS } from "@/config/constants";
import { Home, Heart, ShieldAlert, X, Star, MapPin } from "lucide-react";

interface Accommodation {
  id: string; title: string; type: string; city: string; country: string;
  monthlyRent: number; currency: string; distanceToCenterKm: number | null;
  amenities: string; safetyRating: number; description: string | null; favorites: { id: string }[];
}

export default function AccommodationPage() {
  const [listings, setListings] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScamAlert, setShowScamAlert] = useState(true);
  const [filters, setFilters] = useState({ country: "", city: "", type: "", maxRent: "" });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.country) params.set("country", filters.country);
    if (filters.city) params.set("city", filters.city);
    if (filters.type) params.set("type", filters.type);
    if (filters.maxRent) params.set("maxRent", filters.maxRent);
    const res = await fetch(`/api/accommodation?${params}`);
    const data = await res.json();
    setListings(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  async function toggleFavorite(id: string) {
    await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accommodationId: id }) });
    fetchListings();
  }

  const cities = filters.country ? CITIES[filters.country] || [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500">
          <Home className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-midnight">Accommodation</h1>
          <p className="text-slate-500 text-sm">Find your home away from home</p>
        </div>
      </div>

      {/* Scam awareness */}
      {showScamAlert && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-900">Stay safe — beware of rental scams</p>
                <ul className="mt-2 text-sm text-amber-700 space-y-1">
                  {SAFETY_TIPS.slice(0, 3).map((tip, i) => (<li key={i}>• {tip}</li>))}
                </ul>
              </div>
              <button onClick={() => setShowScamAlert(false)} className="text-amber-400 hover:text-amber-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Country">
              <Select value={filters.country} onChange={(e) => setFilters(f => ({ ...f, country: e.target.value, city: "" }))}>
                <option value="">All countries</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="City">
              <Select value={filters.city} onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))} disabled={!filters.country}>
                <option value="">All cities</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Type">
              <Select value={filters.type} onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}>
                <option value="">All types</option>
                {ACCOMMODATION_TYPES.map((t) => <option key={t} value={t}>{ACCOMMODATION_TYPE_LABELS[t]}</option>)}
              </Select>
            </Field>
            <Field label="Max Monthly Rent (USD)">
              <Input type="number" value={filters.maxRent} onChange={(e) => setFilters(f => ({ ...f, maxRent: e.target.value }))} placeholder="No limit" />
            </Field>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-slate-500 py-8">Loading...</p>
      ) : listings.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">No accommodations found. Try adjusting your filters.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((acc) => (
            <Card key={acc.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="info">{ACCOMMODATION_TYPE_LABELS[acc.type] || acc.type}</Badge>
                  <button onClick={() => toggleFavorite(acc.id)} className={`p-1 rounded-lg transition-colors ${acc.favorites.length > 0 ? "text-red-500" : "text-slate-300 hover:text-red-400"}`}>
                    <Heart className={`h-5 w-5 ${acc.favorites.length > 0 ? "fill-red-500" : ""}`} />
                  </button>
                </div>
                <h3 className="font-semibold text-midnight">{acc.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {acc.city}, {acc.country}</p>
                {acc.description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{acc.description}</p>}
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="font-bold text-midnight">${acc.monthlyRent}/mo</span>
                  {acc.distanceToCenterKm && <span className="text-slate-500">{acc.distanceToCenterKm}km to center</span>}
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < acc.safetyRating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                    ))}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {acc.amenities.split(",").slice(0, 4).map((a, i) => (<Badge key={i} variant="default">{a.trim()}</Badge>))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
