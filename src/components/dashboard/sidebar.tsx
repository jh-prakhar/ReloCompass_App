"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MessageSquare, Home, Briefcase, Building, Users, Plane, Wallet, CheckSquare, Settings, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BrandIcon } from "@/components/brand/logo";

const studentNav = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "AI Assistant", href: "/assistant", icon: MessageSquare },
  { label: "Accommodation", href: "/accommodation", icon: Building },
  { label: "Transport", href: "/transport", icon: Plane },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Community", href: "/community", icon: Users },
  { label: "Budget Planner", href: "/budget", icon: Wallet },
  { label: "Relocation Checklist", href: "/checklist", icon: CheckSquare },
];

const employerNav = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Post a Job", href: "/jobs/post", icon: Briefcase },
  { label: "AI Assistant", href: "/assistant", icon: MessageSquare },
];

export function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const items = role === "EMPLOYER" ? employerNav : studentNav;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-100">
        <BrandIcon variant="dark" className="h-8 w-8" />
        <span className="text-lg font-bold text-midnight">ReloCompass</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Menu</p>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-electric/8 text-electric"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-electric"
                />
              )}
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 px-3 py-4 space-y-0.5">
        <Link
          href="/profile"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/profile"
              ? "bg-electric/8 text-electric"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Settings className="h-[18px] w-[18px]" />
          <span>Settings & Profile</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
