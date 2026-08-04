"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandIcon } from "@/components/brand/logo";
import {
  Heart, Users, Briefcase, GraduationCap, Sparkles,
  ArrowRight, Shield, Globe2, Rocket, Mail, Building2,
} from "lucide-react";

const problems = [
  { icon: Globe2, title: "Fragmented Information", desc: "Relocation requires juggling dozens of sources — visa portals, university sites, housing platforms, and forums. We bring it all together in one place." },
  { icon: Shield, title: "Trust & Safety Concerns", desc: "International movers are vulnerable to scams, from fake landlords to fraudulent job offers. ReloCompass includes verification tools and scam-prevention guidance." },
  { icon: Heart, title: "Language & Cultural Barriers", desc: "Understanding local norms, tenant rights, and professional etiquette in a new country can be overwhelming. The AI assistant provides culturally-aware guidance." },
  { icon: Users, title: "Social Isolation", desc: "Moving abroad means leaving behind support networks. The community hub helps you connect with people from your home country who understand the journey." },
];

const whoWeHelp = [
  { icon: GraduationCap, title: "Students", desc: "International students preparing for undergraduate or postgraduate studies abroad — from visa applications to finding campus housing." },
  { icon: Briefcase, title: "Job Seekers", desc: "Skilled professionals seeking employment opportunities overseas, including those requiring visa sponsorship and career transition support." },
  { icon: Building2, title: "Employers", desc: "Companies looking to hire talented professionals from India and Nepal, with tools to post jobs and manage applications." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream text-midnight">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandIcon variant="dark" className="h-9 w-9" />
            <span className="text-xl font-bold text-midnight">ReloCompass</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Home</Link>
            <Link href="/#features" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Features</Link>
            <Link href="/about" className="rounded-lg px-3 py-2 text-sm font-medium text-electric">About</Link>
            <Link href="/contact" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Contact</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link href="/register"><Button variant="primary" size="sm">Sign Up</Button></Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 mesh-bg-light">
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-electric/10 blur-3xl animate-float" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge2>About ReloCompass</Badge2>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-midnight sm:text-5xl">
              Built to make global relocation <span className="text-gradient">accessible and safe</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              ReloCompass is an AI-powered platform that helps people from India and Nepal relocate abroad for education or employment. We combine AI guidance, verified listings, job matching, and community support into one integrated platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What is the platform */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-midnight mb-6">What is ReloCompass?</h2>
            <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
              <p>
                ReloCompass is a web platform designed to support the complete relocation journey — from the first decision to move abroad, through preparation, arrival, and settling into a new country. It serves three roles: students pursuing education, skilled workers seeking jobs, and employers looking to hire international talent.
              </p>
              <p>
                The platform offers an AI-powered assistant that answers relocation questions 24/7, an accommodation hub with safety-rated listings, a job board with employer-posted opportunities, transportation guides for major cities, a budget planner for cost-of-living estimation, relocation checklists, and a community hub for cultural and professional support groups.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why it was created */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Badge2>The Problem We Solve</Badge2>
            <h2 className="mt-4 text-3xl font-bold text-midnight mb-6">Why was ReloCompass created?</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Every year, hundreds of thousands of students and professionals from India and Nepal move abroad. The process is complex, stressful, and filled with uncertainty. Here are the key challenges we address:
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {problems.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-electric/10">
                    <p.icon className="h-5 w-5 text-electric" />
                  </div>
                  <h3 className="font-semibold text-midnight">{p.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who it helps */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Badge2>Who We Help</Badge2>
            <h2 className="mt-4 text-3xl font-bold text-midnight mb-10">Designed for three audiences</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {whoWeHelp.map((w, i) => (
                <motion.div
                  key={w.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-cyan">
                    <w.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-midnight">{w.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{w.desc}</p>
    (this is an exact text rendering)
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How AI assists users */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="rounded-3xl bg-gradient-to-br from-midnight to-navy p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric/20">
                  <Sparkles className="h-6 w-6 text-electric" />
                </div>
                <Badge2>AI Assistance</Badge2>
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">How AI assists users</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                The AI assistant is at the heart of ReloCompass. It uses each user&rsquo;s profile — their destination, budget, timeline, career goals, and accommodation preferences — to provide personalized, context-aware guidance.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  "Answers relocation questions in plain language — from visa requirements to housing searches",
                  "Creates personalized checklists based on the user's destination and timeline",
                  "Suggests accommodation options that match the user's budget and preferences",
                  "Helps employers write effective job descriptions and provides candidate matching insights",
                  "Offers cultural tips and practical advice for settling into a new country",
                  "Available 24/7, reducing reliance on expensive immigration consultants",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-slate-300">
                    <ArrowRight className="h-5 w-5 shrink-0 text-cyan mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-slate-500">
                The AI assistant provides guidance only. For visa, immigration, and legal matters, always verify with official government sources.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Future vision */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <Badge2>Our Vision</Badge2>
            </div>
            <h2 className="text-3xl font-bold text-midnight mb-6">Where we're headed</h2>
            <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
              <p>
                ReloCompass started with a focus on India and Nepal, but our vision is to become the global standard for relocation support. Our roadmap includes:
              </p>
              <ul className="space-y-3">
                {[
                  "Expanding to support more source countries and destinations worldwide",
                  "Launching mobile apps for Android and iOS with offline access",
                  "Adding verified landlord and employer partnerships with direct integration",
                  "Building a mentorship network connecting experienced expatriates with newcomers",
                  "Integrating real-time visa processing updates and government API connections",
                  "Developing AI-powered document review (CVs, rental applications, visa forms)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Shield className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-medium text-midnight">
                We believe that everyone deserves access to clear, honest, and reliable guidance when building a new life abroad.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-midnight to-navy p-12 shadow-2xl"
          >
            <h2 className="text-3xl font-bold text-white">Have questions?</h2>
            <p className="mt-4 text-lg text-slate-300">We're happy to help. Reach out to us anytime.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
              <Link href="/contact">
                <Button variant="gradient" size="lg">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Badge2({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-3 py-1 text-xs font-semibold text-electric uppercase tracking-wider">
      {children}
    </span>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-midnight text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <BrandIcon variant="light" className="h-9 w-9" />
              <span className="text-xl font-bold text-white">ReloCompass</span>
            </div>
            <p className="text-sm text-slate-400">Your AI-powered guide to relocating abroad.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Accommodation</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Jobs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <p className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3" />
              <a href="mailto:prakharnpp@gmail.com" className="hover:text-white transition-colors">prakharnpp@gmail.com</a>
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} ReloCompass. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
