"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, Input } from "@/components/ui/input";
import { CheckSquare, ClipboardList, Plane, Home, Check, X, Plus } from "lucide-react";

interface ChecklistItem {
  id: string; task: string; category: string; completed: boolean;
}

const DEFAULT_ITEMS: Record<string, string[]> = {
  PRE_DEPARTURE: [
    "Apply for passport (if not already done)",
    "Apply for student/work visa",
    "Book flight tickets",
    "Arrange initial accommodation (first 2 weeks)",
    "Get travel and health insurance",
    "Arrange finances: forex card, international banking",
    "Get all required vaccinations",
    "Notify your bank about international usage",
    "Make copies of important documents (digital + physical)",
    "Research mobile/SIM options at destination",
  ],
  PACKING: [
    "Passport + visa documents (carry in hand luggage)",
    "University admission / employment offer letter",
    "Academic transcripts and certificates",
    "Medical prescriptions and records",
    "Adapter plugs for electronics",
    "Warm clothing (check destination climate)",
    "Traditional/cultural attire for events",
    "Basic medicines (painkillers, first aid)",
    "Power bank and charging cables",
    "Cash in local currency for first few days",
  ],
  POST_ARRIVAL: [
    "Register with local authorities (if required)",
    "Activate local SIM card",
    "Open a bank account",
    "Register with university / employer",
    "Find long-term accommodation",
    "Get local transport card / pass",
    "Register with your embassy",
    "Find nearby hospitals and clinics",
    "Set up utilities (internet, electricity)",
    "Join local community groups",
  ],
};

const CATEGORY_META: Record<string, { label: string; icon: typeof Plane; color: string }> = {
  PRE_DEPARTURE: { label: "Pre-Departure", icon: ClipboardList, color: "from-blue-500 to-cyan-500" },
  PACKING: { label: "Packing", icon: Plane, color: "from-violet-500 to-purple-500" },
  POST_ARRIVAL: { label: "Post-Arrival", icon: Home, color: "from-emerald-500 to-green-500" },
};

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState("PRE_DEPARTURE");
  const [seeded, setSeeded] = useState(false);

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/checklist");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (!loading && items.length === 0 && !seeded) {
      (async () => {
        for (const [category, tasks] of Object.entries(DEFAULT_ITEMS)) {
          for (const task of tasks) {
            await fetch("/api/checklist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ task, category }),
            });
          }
        }
        setSeeded(true);
        fetchItems();
      })();
    }
  }, [loading, items.length, seeded, fetchItems]);

  async function toggleItem(id: string, completed: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed } : i)));
    await fetch("/api/checklist", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, completed }) });
  }

  async function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/checklist?id=${id}`, { method: "DELETE" });
  }

  async function addTask() {
    if (!newTask.trim()) return;
    const res = await fetch("/api/checklist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task: newTask, category: newCategory }) });
    if (res.ok) { setNewTask(""); fetchItems(); }
  }

  const grouped = ["PRE_DEPARTURE", "PACKING", "POST_ARRIVAL"].map((cat) => ({ category: cat, items: items.filter((i) => i.category === cat) }));
  const totalDone = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? Math.round((totalDone / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
          <CheckSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-midnight">Relocation Checklist</h1>
          <p className="text-slate-500 text-sm">Track your tasks before and after arrival</p>
        </div>
      </div>

      {items.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-700">Overall Progress</span>
              <span className="text-sm font-bold text-electric">{progress}% ({totalDone}/{items.length})</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div className="h-3 rounded-full bg-gradient-to-r from-electric to-cyan transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a custom task..." onKeyDown={(e) => e.key === "Enter" && addTask()} />
            <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="sm:w-auto">
              <option value="PRE_DEPARTURE">Pre-Departure</option>
              <option value="PACKING">Packing</option>
              <option value="POST_ARRIVAL">Post-Arrival</option>
            </Select>
            <Button variant="gradient" onClick={addTask}><Plus className="h-4 w-4" />Add</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-slate-500 py-8">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {grouped.map((group) => {
            const meta = CATEGORY_META[group.category];
            const Icon = meta.icon;
            return (
              <Card key={group.category}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${meta.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    {meta.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-2 group">
                        <button
                          onClick={() => toggleItem(item.id, !item.completed)}
                          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? "bg-electric border-electric" : "border-slate-300 hover:border-electric"}`}
                        >
                          {item.completed && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`text-sm flex-1 ${item.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{item.task}</span>
                        <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {group.items.length === 0 && <p className="text-sm text-slate-400 py-2">No tasks in this category</p>}
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
