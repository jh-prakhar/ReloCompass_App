import { ReactNode } from "react";
import Link from "next/link";
import { BrandIcon } from "@/components/brand/logo";
import { Sparkles, Shield, Users, ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 mesh-bg overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-electric/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-cyan/10 blur-3xl animate-floatSlow" />

        <Link href="/" className="relative flex items-center gap-2 group">
          <BrandIcon variant="light" className="h-9 w-9" />
          <span className="text-xl font-bold text-white">ReloCompass</span>
        </Link>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Your compass to a <br />
            <span className="text-gradient">new life abroad</span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-md">
            AI-powered relocation guidance, verified accommodation, job matching, and a supportive community.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: Sparkles, text: "Personalized AI relocation assistant" },
              { icon: Shield, text: "Verified employers, landlords & listings" },
              { icon: Users, text: "Growing community of relocators from India & Nepal" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4 text-cyan" />
                </div>
                <span className="text-slate-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-slate-500">
          © 2025 ReloCompass · Made for India & Nepal
        </div>
      </div>

      {/* Right: Form area */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-cream">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-midnight">
              <ArrowLeft className="h-4 w-4" />
              <BrandIcon variant="dark" className="h-8 w-8" />
              <span className="font-bold text-midnight">ReloCompass</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
