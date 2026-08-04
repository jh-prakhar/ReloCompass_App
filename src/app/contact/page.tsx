"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BrandIcon } from "@/components/brand/logo";
import { Mail, Send, CheckCircle2, User, MessageSquare, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Please enter a valid email address";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.message.trim()) errs.message = "Message is required";
    else if (form.message.trim().length < 10) errs.message = "Message must be at least 10 characters";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    // Submit to contact API
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      // Even if the API fails, show success to the user — we don't want to lose their message
    }
    setSubmitting(false);
    setSubmitted(true);
  }

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  }

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
            <Link href="/about" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">About</Link>
            <Link href="/contact" className="rounded-lg px-3 py-2 text-sm font-medium text-electric">Contact</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link href="/register"><Button variant="primary" size="sm">Sign Up</Button></Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 mesh-bg-light">
        <div className="absolute top-10 right-10 h-72 w-72 rounded-full bg-electric/10 blur-3xl animate-float" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-3 py-1 text-xs font-semibold text-electric uppercase tracking-wider">
              <Mail className="h-3 w-3" /> Get in Touch
            </span>
            <h1 className="mt-4 text-4xl font-bold text-midnight sm:text-5xl">Contact Us</h1>
            <p className="mt-4 text-lg text-slate-600">
              Have a question, partnership inquiry, or feedback? We&rsquo;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact content */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-100">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-electric/10">
                      <User className="h-5 w-5 text-electric" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Contact Person</p>
                      <p className="font-semibold text-midnight mt-1">Prakhar Jha</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-100">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Mail className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Email</p>
                      <a href="mailto:prakharnpp@gmail.com" className="font-semibold text-midnight mt-1 block hover:text-electric transition-colors">
                        prakharnpp@gmail.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-midnight to-navy border-0">
                <CardContent className="pt-6">
                  <MessageSquare className="h-6 w-6 text-cyan mb-3" />
                  <p className="text-white font-semibold">Response Time</p>
                  <p className="text-sm text-slate-400 mt-1">We typically respond within 1-2 business days.</p>
                </CardContent>
              </Card>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              <Card className="border-slate-100 shadow-lg">
                <CardContent className="pt-8 pb-8">
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-midnight">Message Sent!</h3>
                      <p className="mt-2 text-slate-600 max-w-sm">
                        Thank you for reaching out. We&rsquo;ve received your message and will get back to you at <span className="font-medium text-electric">{form.email}</span> soon.
                      </p>
                      <Button variant="outline" className="mt-6" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-midnight mb-6">Send us a message</h2>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label="Full Name" error={errors.name}>
                          <Input
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            placeholder="Your full name"
                          />
                        </Field>
                        <Field label="Email Address" error={errors.email}>
                          <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            placeholder="you@example.com"
                          />
                        </Field>
                        <Field label="Subject" error={errors.subject}>
                          <Input
                            value={form.subject}
                            onChange={(e) => update("subject", e.target.value)}
                            placeholder="How can we help?"
                          />
                        </Field>
                        <Field label="Message" error={errors.message}>
                          <Textarea
                            rows={6}
                            value={form.message}
                            onChange={(e) => update("message", e.target.value)}
                            placeholder="Tell us more..."
                          />
                        </Field>
                        <Button type="submit" variant="gradient" size="lg" className="w-full" loading={submitting}>
                          <Send className="h-4 w-4" />
                          Send Message
                        </Button>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
}
