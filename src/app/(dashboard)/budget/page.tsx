"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, Field } from "@/components/ui/input";
import { COUNTRIES, CITIES } from "@/config/destinations";
import { BUDGET_CATEGORIES } from "@/config/constants";
import { Wallet, TrendingUp, PiggyBank, MapPin } from "lucide-react";

interface BudgetItem {
  id: string;
  category: string;
  monthlyCostUSD: number;
}

export default function BudgetPage() {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [customTweaks, setCustomTweaks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const fetchBudget = useCallback(async () => {
    if (!city) { setBudgetItems([]); return; }
    setLoading(true);
    const params = new URLSearchParams();
    params.set("city", city);
    const res = await fetch(`/api/budget?${params}`);
    const data = await res.json();
    setBudgetItems(data);
    setCustomTweaks({});
    setLoading(false);
  }, [city]);

  useEffect(() => { fetchBudget(); }, [fetchBudget]);

  const cities = country ? CITIES[country] || [] : [];
  const getCost = (category: string) => {
    const item = budgetItems.find((b) => b.category === category);
    if (!item) return 0;
    return customTweaks[category] ?? item.monthlyCostUSD;
  };
  const total = BUDGET_CATEGORIES.reduce((sum, cat) => sum + getCost(cat.key), 0);
  const formatCurrency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-midnight">Budget Planner</h1>
          <p className="text-slate-500 text-sm">Estimate your monthly living costs</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Country">
              <Select value={country} onChange={(e) => { setCountry(e.target.value); setCity(""); }}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="City">
              <Select value={city} onChange={(e) => setCity(e.target.value)} disabled={!country}>
                <option value="">Select city</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>

      {!city && (
        <Card>
          <CardContent className="py-16 text-center">
            <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Select a destination city to see estimated monthly costs</p>
          </CardContent>
        </Card>
      )}

      {city && !loading && budgetItems.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BUDGET_CATEGORIES.map((cat) => {
              const cost = getCost(cat.key);
              return (
                <Card key={cat.key}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-slate-700">{cat.label}</span>
                      <span className="font-bold text-midnight">{formatCurrency(cost)}</span>
                    </div>
                    <input type="range" min={0} max={Math.max(cost * 2, 500)} step={10} value={cost}
                      onChange={(e) => setCustomTweaks((prev) => ({ ...prev, [cat.key]: Number(e.target.value) }))}
                      className="w-full accent-electric" />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>$0</span>
                      <span>{formatCurrency(Math.max(cost * 2, 500))}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-gradient-to-br from-midnight to-navy border-0">
            <CardContent className="py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-cyan" />
                    <p className="text-cyan/80 text-sm">Monthly Expenses</p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(total)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <PiggyBank className="h-4 w-4 text-cyan" />
                    <p className="text-cyan/80 text-sm">Emergency Savings (10%)</p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(total * 0.1)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-4 w-4 text-cyan" />
                    <p className="text-cyan/80 text-sm">Recommended Budget</p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(total + total * 0.1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {city && !loading && budgetItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No cost data available for {city} yet. Try asking the AI Assistant for general estimates!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
