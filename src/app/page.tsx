"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BrandIcon } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu, X, Download, Sparkles, Home, Briefcase, Users, Building2,
  Plane, MessageSquare, ArrowRight, Shield, Globe2,
  CheckCircle2, Wallet, ChevronDown, QrCode, Mail,
} from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Destinations", href: "/#destinations" },
  { label: "Employers", href: "/#employers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const features = [
  { icon: MessageSquare, title: "AI Relocation Assistant", desc: "Get personalized guidance on every step of your move, from visas to finding a flat.", color: "from-blue-500 to-cyan-500" },
  { icon: Home, title: "Accommodation Hub", desc: "Browse student dorms, shared apartments, and homestays with safety ratings.", color: "from-cyan-500 to-teal-500" },
  { icon: Briefcase, title: "Job Matching", desc: "Connect with employers offering visa sponsorship and career opportunities abroad.", color: "from-indigo-500 to-blue-500" },
  { icon: Users, title: "Community Support", desc: "Find student clubs, cultural groups, and mentorship from your home community.", color: "from-violet-500 to-purple-500" },
  { icon: Plane, title: "Transportation Guide", desc: "Navigate your new city with local transit guides and student discount passes.", color: "from-sky-500 to-blue-500" },
  { icon: Wallet, title: "Budget Planner", desc: "Plan your finances with cost-of-living calculators tailored to your destination.", color: "from-emerald-500 to-green-500" },
];

const destinations = [
  { country: "Canada", city: "Toronto", code: "CA", desc: "Popular destination for students & tech workers" },
  { country: "Germany", city: "Berlin", code: "DE", desc: "Affordable education & growing tech sector" },
  { country: "United Kingdom", city: "London", code: "GB", desc: "World-class universities & finance hub" },
  { country: "Australia", city: "Sydney", code: "AU", desc: "High quality of life & post-study work visas" },
  { country: "USA", city: "New York", code: "US", desc: "Global hub for tech, finance & innovation" },
  { country: "Netherlands", city: "Amsterdam", code: "NL", desc: "English-friendly & startup-friendly" },
];

const faqs = [
  { q: "Is ReloCompass free to use?", a: "Yes. Core features like the AI assistant, accommodation search, community access, and budget tools are free for students and job seekers. Employers can post jobs at no cost during our launch period." },
  { q: "Which countries are supported?", a: "The platform currently includes destination guides for Canada, Germany, the United Kingdom, Australia, the United States, and the Netherlands. More destinations are being added regularly." },
  { q: "How does the AI assistant work?", a: "Our AI assistant uses your profile and destination preferences to provide personalized guidance on visas, accommodation, jobs, cultural tips, and relocation logistics — available whenever you need it." },
  { q: "Are the employers and listings verified?", a: "Employer profiles carry a verified badge after manual review. Accommodation listings include safety ratings, and we provide scam-prevention guidance throughout the platform." },
  { q: "Can employers post jobs directly?", a: "Yes. Employers can create an account, post job opportunities, and use AI-powered candidate matching to find the best talent from India and Nepal." },
  { q: "Is the mobile app available?", a: "The mobile apps for Android and iOS are in development. You can join the waitlist to be notified when they launch. In the meantime, all features are fully accessible via the web platform." },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-cream text-midnight">
      {/* ===== NAVBAR ===== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-sm py-2" : "py-4"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandIcon variant="dark" className="h-9 w-9" />
            <span className="text-xl font-bold text-midnight">ReloCompass</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-midnight transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Sign Up Free</Button>
            </Link>
            <a href="#download">
              <Button variant="gradient" size="sm">
                <Download className="h-4 w-4" />
                Download App
              </Button>
            </a>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="mx-4 mb-4 rounded-2xl bg-white p-4 shadow-lg space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full">Sign Up Free</Button>
                  </Link>
                  <a href="#download" onClick={() => setMobileOpen(false)}>
                    <Button variant="gradient" className="w-full">
                      <Download className="h-4 w-4" />
                      Download App
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden pt-32 pb-20 mesh-bg-light">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-electric/10 blur-3xl animate-float" />
        <div className="absolute top-40 right-10 h-96 w-96 rounded-full bg-cyan/10 blur-3xl animate-floatSlow" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-electric/20 bg-electric/5 px-4 py-1.5 text-xs font-medium text-electric mb-6">
                <Globe2 className="h-3.5 w-3.5" />
                For students & professionals from India & Nepal
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-midnight sm:text-5xl lg:text-6xl">
                Your compass to a{" "}
                <span className="text-gradient">new life abroad</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600">
                AI-powered relocation guidance, accommodation search, job matching, and a supportive community — everything you need to relocate with confidence.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register">
                  <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#download">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Download className="h-4 w-4" />
                    Download App
                  </Button>
                </a>
              </div>
              {/* Trust indicators — honest messaging */}
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm text-slate-600">Verified listings & employers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-electric" />
                  <span className="text-sm text-slate-600">AI-powered guidance</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl bg-gradient-to-br from-midnight to-navy p-8 shadow-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/20">
                    <Sparkles className="h-5 w-5 text-electric" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI Assistant</p>
                    <p className="text-xs text-slate-400">Relocation Expert</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl rounded-tl-sm bg-white/10 p-3 text-sm text-slate-200">
                    &ldquo;I&rsquo;m moving to Toronto for my master&rsquo;s. What documents do I need?&rdquo;
                  </div>
                  <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-electric to-cyan p-3 text-sm text-white">
                    &ldquo;Great choice! You&rsquo;ll need: 1) Study permit, 2) Acceptance letter, 3) Proof of funds, 4) Medical exam, 5) Passport valid beyond stay. I can create a personalized checklist for you!&rdquo;
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white/10 p-3 text-sm text-slate-200">
                    &ldquo;Can you find me accommodation near U of T?&rdquo;
                  </div>
                  <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-electric to-cyan p-3 text-sm text-white">
                    &ldquo;I found several verified listings near U of T within a student budget. The safest option is a student dorm at $750/mo. Want to see the full list?&rdquo;
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== PLATFORM FEATURES ===== */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge2>Platform Features</Badge2>
            <h2 className="mt-4 text-3xl font-bold text-midnight sm:text-4xl">Everything you need to relocate</h2>
            <p className="mt-4 text-lg text-slate-600">One platform, all the tools to make your international move successful.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group rounded-2xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-electric/20"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-midnight">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DESTINATIONS ===== */}
      <section id="destinations" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge2>Supported Destinations</Badge2>
            <h2 className="mt-4 text-3xl font-bold text-midnight sm:text-4xl">Where would you like to go?</h2>
            <p className="mt-4 text-lg text-slate-600">Explore guides and listings for these relocation destinations.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.city}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-midnight to-navy p-6 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white/90">{dest.code}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-midnight">{dest.city}, {dest.country}</h3>
                  <p className="mt-1 text-sm text-slate-500">{dest.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EMPLOYERS ===== */}
      <section id="employers" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge2>For Employers</Badge2>
              <h2 className="mt-4 text-3xl font-bold text-midnight sm:text-4xl">Hire talent from India & Nepal</h2>
              <p className="mt-4 text-lg text-slate-600">Post jobs, get AI-matched candidates, and manage applications all in one place.</p>
              <ul className="mt-6 space-y-3">
                {[
                  "AI-powered candidate matching based on skills and preferences",
                  "Verified employer badge to build trust with applicants",
                  "Direct application management dashboard",
                  "Reach students and professionals from India & Nepal",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="text-slate-600">{item}</span>
                  </motion.li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 inline-block">
                <Button variant="primary" size="lg">
                  Post Your First Job
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Sample employer listing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-midnight">Example Job Listing</h3>
                <Badge variant="warning">SAMPLE</Badge>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <Building2 className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-midnight">Software Engineer</h4>
                    <p className="text-sm text-slate-500">Example Tech Solutions</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> Full-Time</span>
                      <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" /> Toronto, Canada</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      This is a demonstration listing showing how employers can post job opportunities on the platform. Salary information available upon application.
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400 text-center">
                This is a sample listing for demonstration purposes. Real job postings will appear once employers join the platform.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== COMMUNITY GROWING MESSAGE ===== */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-electric/10 mb-6">
              <Users className="h-8 w-8 text-electric" />
            </div>
            <h2 className="text-3xl font-bold text-midnight sm:text-4xl">A growing community</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              ReloCompass is a new platform. Statistics, user reviews, and success stories will appear here as our community grows.
            </p>
            <p className="mt-3 text-slate-500">
              Be among the first to join and shape the future of global relocation support.
            </p>
            <Link href="/register" className="mt-8 inline-block">
              <Button variant="gradient" size="lg">
                Join the Community
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== DOWNLOAD APP ===== */}
      <section id="download" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-midnight via-navy to-midnight p-8 sm:p-12 lg:p-16">
            <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-electric/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-cyan/20 blur-3xl" />

            <div className="relative grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge variant="electric" className="mb-4">Coming Soon</Badge>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">Take ReloCompass with you</h2>
                <p className="mt-4 text-lg text-slate-300">The ReloCompass mobile app for Android and iOS is in development. Join the waitlist to be notified when it launches.</p>
                <ul className="mt-6 space-y-2">
                  {["Instant job alerts & application updates", "AI assistant in your pocket 24/7", "Community messaging & local events", "Offline checklist access"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-cyan" />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Download buttons — clearly labeled placeholders */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {/* App Store Button (placeholder) */}
                  <a
                    href="https://apps.apple.com/app/relocompass"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download on the App Store (coming soon)"
                    className="inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 transition-transform hover:scale-105"
                  >
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-3.1 2.53-4.59 2.64-4.66-1.44-2.11-3.68-2.4-4.47-2.43-1.9-.19-3.72 1.12-4.68 1.12-.97 0-2.46-1.09-4.04-1.06-2.08.03-4 1.21-5.07 3.07-2.16 3.75-.55 9.31 1.55 12.37 1.03 1.5 2.24 3.18 3.83 3.12 1.53-.06 2.11-.99 3.96-.99 1.84 0 2.37.99 3.99.96 1.65-.03 2.69-1.52 3.69-3.03 1.16-1.72 1.64-3.38 1.67-3.47-.04-.02-3.2-1.23-3.23-4.87zM14.08 3.28c.85-1.03 1.42-2.46 1.26-3.88-1.22.05-2.7.81-3.57 1.84-.78.91-1.47 2.37-1.28 3.76 1.36.1 2.74-.69 3.59-1.72z"/></svg>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-500">Download on the</p>
                      <p className="text-sm font-bold text-midnight">App Store</p>
                    </div>
                  </a>
                  {/* Google Play Button (placeholder) */}
                  <a
                    href="https://play.google.com/store/apps/details=ai.relocompass.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get it on Google Play (coming soon)"
                    className="inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 transition-transform hover:scale-105"
                  >
                    <svg className="h-7 w-7" viewBox="0 0 24 24"><path fill="#00D7FE" d="M3.61 1.81C3.23 2.2 3 2.8 3 3.6v16.8c0 .8.23 1.4.61 1.79L3.7 22.3l9.3-9.3v-.2L3.7 3.3z"/><path fill="#00C800" d="M16.8 14.93l-3.1-3.1v-.2l3.1-3.1.07.04 3.67 2.08c1.05.6 1.05 1.58 0 2.18l-3.67 2.08z"/><path fill="#FFCE00" d="M16.87 14.89L13.7 11.7 3.61 21.79c.35.37.92.41 1.56.05l11.7-6.65"/><path fill="#FF0033" d="M16.87 8.51L5.17 1.86c-.64-.36-1.21-.32-1.56.05L13.7 11.7z"/></svg>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-500">GET IT ON</p>
                      <p className="text-sm font-bold text-midnight">Google Play</p>
                    </div>
                  </a>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Apps are in development. Links will be activated when published.
                </p>
              </div>

              {/* Phone mockup */}
              <div className="relative flex justify-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative"
                >
                  <div className="rounded-[2rem] border-8 border-slate-800 bg-midnight p-2 shadow-2xl w-64">
                    <div className="rounded-[1.5rem] bg-gradient-to-b from-navy to-midnight overflow-hidden">
                      <div className="flex justify-center pt-2"><div className="h-1 w-16 rounded-full bg-slate-700" /></div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <BrandIcon variant="light" className="h-7 w-7" />
                          <span className="text-sm font-bold text-white">ReloCompass</span>
                        </div>
                        <div className="rounded-xl bg-white/10 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-cyan" />
                            <span className="text-xs text-slate-300">AI Assistant</span>
                          </div>
                          <div className="rounded-lg bg-gradient-to-r from-electric to-cyan p-2 text-xs text-white">
                            Your relocation checklist is ready!
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-white/5 p-3 text-center">
                            <Home className="h-5 w-5 mx-auto mb-1 text-cyan" />
                            <span className="text-[10px] text-slate-400">Housing</span>
                          </div>
                          <div className="rounded-lg bg-white/5 p-3 text-center">
                            <Briefcase className="h-5 w-5 mx-auto mb-1 text-electric" />
                            <span className="text-[10px] text-slate-400">Jobs</span>
                          </div>
                          <div className="rounded-lg bg-white/5 p-3 text-center">
                            <Users className="h-5 w-5 mx-auto mb-1 text-violet-400" />
                            <span className="text-[10px] text-slate-400">Community</span>
                          </div>
                          <div className="rounded-lg bg-white/5 p-3 text-center">
                            <Wallet className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
                            <span className="text-[10px] text-slate-400">Budget</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <Badge2>FAQ</Badge2>
            <h2 className="mt-4 text-3xl font-bold text-midnight sm:text-4xl">Frequently asked questions</h2>
          </div>
          <div className="mt-12 space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-midnight">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-slate-600">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-midnight to-navy p-12 shadow-2xl"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to start your journey?</h2>
            <p className="mt-4 text-lg text-slate-300">Create your free account and get personalized relocation guidance today.</p>
            <Link href="/register" className="mt-8 inline-block">
              <Button variant="gradient" size="lg">
                Create Your Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200 bg-midnight text-slate-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <BrandIcon variant="light" className="h-9 w-9" />
                <span className="text-xl font-bold text-white">ReloCompass</span>
              </div>
              <p className="text-sm text-slate-400">Your AI-powered guide to relocating abroad for education and employment.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-white transition-colors">AI Assistant</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Accommodation</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Jobs</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Community</Link></li>
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
              <h4 className="font-semibold text-white mb-3">Get the App</h4>
              <a
                href="#download"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition-colors"
              >
                <Download className="h-4 w-4" />
                Coming Soon
              </a>
              <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Mail className="h-3 w-3" />
                <a href="mailto:prakharnpp@gmail.com" className="hover:text-white transition-colors">prakharnpp@gmail.com</a>
              </p>
            </div>
 (this is exact line-encoding + whitespace)
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} ReloCompass. All rights reserved. Made with care for India & Nepal.
          </div>
        </div>
      </footer>
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
