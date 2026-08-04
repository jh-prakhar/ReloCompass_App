"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Field, Label } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { COUNTRIES, CITIES, ACCOMMODATION_TYPES, ACCOMMODATION_TYPE_LABELS } from "@/config/destinations";
import { MapPin, Home, Briefcase, ClipboardList, Save } from "lucide-react";

interface PreferenceData {
  destinationCountry: string | null;
  destinationCity: string | null;
  university: string | null;
  employer: string | null;
  monthlyBudget: number | null;
  accommodationType: string | null;
  transportPreference: string | null;
  arrivalDate: string | null;
  targetJob: string | null;
  yearsExperience: number | null;
  education: string | null;
  languages: string | null;
  hasWorkVisa: boolean | null;
  expectedSalary: number | null;
  careerGoals: string | null;
  dietaryRestrictions: string | null;
  accessibilityNeeds: string | null;
}

const EMPTY: PreferenceData = {
  destinationCountry: null, destinationCity: null, university: null, employer: null,
  monthlyBudget: null, accommodationType: null, transportPreference: null, arrivalDate: null,
  targetJob: null, yearsExperience: null, education: null, languages: null, hasWorkVisa: null,
  expectedSalary: null, careerGoals: null, dietaryRestrictions: null, accessibilityNeeds: null,
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "STUDENT";
  const [prefs, setPrefs] = useState<PreferenceData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.preference) {
          const p = data.preference;
          setPrefs({ ...EMPTY, ...p, arrivalDate: p.arrivalDate ? new Date(p.arrivalDate).toISOString().split("T")[0] : null });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function update(key: keyof PreferenceData, value: string | number | boolean | null) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prefs) });
      if (res.ok) { setMessage("Saved successfully!"); setTimeout(() => setMessage(""), 3000); }
      else { setMessage("Failed to save. Please try again."); }
    } catch { setMessage("Something went wrong."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="text-center text-slate-500 py-12">Loading...</div>;

  const cities = prefs.destinationCountry ? CITIES[prefs.destinationCountry] || [] : [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
          <ClipboardList className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-midnight">Profile & Preferences</h1>
          <p className="text-slate-500 text-sm">We use these to personalize your AI assistant and recommendations.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Destination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4 text-electric" /> Destination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Destination Country">
                <Select value={prefs.destinationCountry || ""} onChange={(e) => { update("destinationCountry", e.target.value || null); update("destinationCity", null); }}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Destination City">
                <Select value={prefs.destinationCity || ""} onChange={(e) => update("destinationCity", e.target.value || null)} disabled={!prefs.destinationCountry}>
                  <option value="">Select city</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
            {role === "STUDENT" && (
              <Field label="University / Institution">
                <Input value={prefs.university || ""} onChange={(e) => update("university", e.target.value || null)} placeholder="e.g., University of Toronto" />
              </Field>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Monthly Budget (USD)">
                <Input type="number" value={prefs.monthlyBudget ?? ""} onChange={(e) => update("monthlyBudget", e.target.value ? Number(e.target.value) : null)} placeholder="e.g., 1500" />
              </Field>
              <Field label="Expected Arrival Date">
                <Input type="date" value={prefs.arrivalDate || ""} onChange={(e) => update("arrivalDate", e.target.value || null)} />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Accommodation & Transport */}
        {role !== "EMPLOYER" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Home className="h-4 w-4 text-electric" /> Accommodation & Transport</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Preferred Accommodation Type">
                <Select value={prefs.accommodationType || ""} onChange={(e) => update("accommodationType", e.target.value || null)}>
                  <option value="">No preference</option>
                  {ACCOMMODATION_TYPES.map((t) => <option key={t} value={t}>{ACCOMMODATION_TYPE_LABELS[t]}</option>)}
                </Select>
              </Field>
              <Field label="Transportation Preference">
                <Select value={prefs.transportPreference || ""} onChange={(e) => update("transportPreference", e.target.value || null)}>
                  <option value="">No preference</option>
                  <option value="PUBLIC">Public Transport</option>
                  <option value="BICYCLE">Bicycle</option>
                  <option value="WALKING">Walking</option>
                  <option value="RIDESHARE">Ride-sharing</option>
                  <option value="CAR">Car</option>
                </Select>
              </Field>
            </CardContent>
          </Card>
        )}

        {/* Career info */}
        {role !== "STUDENT" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Briefcase className="h-4 w-4 text-electric" /> Career Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Target Job / Role">
                <Input value={prefs.targetJob || ""} onChange={(e) => update("targetJob", e.target.value || null)} placeholder="e.g., Software Engineer" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Years of Experience">
                  <Input type="number" min="0" max="60" value={prefs.yearsExperience ?? ""} onChange={(e) => update("yearsExperience", e.target.value ? Number(e.target.value) : null)} placeholder="e.g., 5" />
                </Field>
                <Field label="Expected Salary (USD)">
                  <Input type="number" value={prefs.expectedSalary ?? ""} onChange={(e) => update("expectedSalary", e.target.value ? Number(e.target.value) : null)} placeholder="e.g., 70000" />
                </Field>
              </div>
              <Field label="Education">
                <Input value={prefs.education || ""} onChange={(e) => update("education", e.target.value || null)} placeholder="e.g., M.Sc. Computer Science" />
              </Field>
              <Field label="Languages Spoken">
                <Input value={prefs.languages || ""} onChange={(e) => update("languages", e.target.value || null)} placeholder="e.g., English, Hindi, Nepali" />
              </Field>
              <div>
                <Label>Do you have a work visa?</Label>
                <Select value={prefs.hasWorkVisa === null ? "" : prefs.hasWorkVisa ? "yes" : "no"} onChange={(e) => update("hasWorkVisa", e.target.value === "" ? null : e.target.value === "yes")}>
                  <option value="">Not specified</option>
                  <option value="yes">Yes</option>
                  <option value="no">No / Not yet</option>
                </Select>
              </div>
              <Field label="Career Goals">
                <Textarea rows={3} value={prefs.careerGoals || ""} onChange={(e) => update("careerGoals", e.target.value || null)} placeholder="Tell us about your career aspirations..." />
              </Field>
            </CardContent>
          </Card>
        )}

        {/* Additional info */}
        {role !== "EMPLOYER" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><ClipboardList className="h-4 w-4 text-electric" /> Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Dietary Restrictions">
                <Input value={prefs.dietaryRestrictions || ""} onChange={(e) => update("dietaryRestrictions", e.target.value || null)} placeholder="e.g., Vegetarian, Halal, Vegan" />
                <p className="mt-1 text-xs text-slate-400">Helps us recommend suitable communities and grocery options.</p>
              </Field>
              <Field label="Accessibility Needs">
                <Textarea rows={2} value={prefs.accessibilityNeeds || ""} onChange={(e) => update("accessibilityNeeds", e.target.value || null)} placeholder="Any accessibility requirements we should know about?" />
              </Field>
            </CardContent>
          </Card>
        )}

        {/* Save bar */}
        <div className="flex items-center gap-4">
          <Button type="submit" variant="gradient" size="lg" loading={saving}>
            <Save className="h-4 w-4" />
            Save Preferences
          </Button>
          {message && (
            <span className={`text-sm ${message.includes("success") ? "text-emerald-600" : "text-red-500"}`}>{message}</span>
          )}
        </div>
      </form>
    </div>
  );
}
