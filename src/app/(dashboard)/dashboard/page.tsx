import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ROLE_LABELS } from "@/config/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Home, Briefcase, Wallet, CheckSquare, Users, FileText, Search, ArrowRight, Sparkles, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      preference: true,
      company: { include: { jobs: true } },
      applications: { include: { job: { include: { company: true } } } },
    },
  });

  if (!user) redirect("/login");

  const role = user.role;
  const pref = user.preference;

  const quickLinks = role === "EMPLOYER"
    ? [
        { href: "/assistant", icon: MessageSquare, title: "AI Assistant", desc: "Get AI-powered candidate matching insights", color: "from-blue-500 to-cyan-500" },
        { href: "/jobs/post", icon: FileText, title: "Post a Job", desc: "Create a new job posting to attract talent", color: "from-indigo-500 to-blue-500" },
        { href: "/candidates", icon: Search, title: "Find Candidates", desc: "Search and filter job seekers by skills", color: "from-violet-500 to-purple-500" },
      ]
    : [
        { href: "/assistant", icon: MessageSquare, title: "Ask AI Assistant", desc: "Get personalized relocation guidance", color: "from-blue-500 to-cyan-500" },
        { href: "/accommodation", icon: Home, title: "Find Accommodation", desc: "Browse dorms, shared apartments & homestays", color: "from-cyan-500 to-teal-500" },
        { href: "/jobs", icon: Briefcase, title: "Explore Jobs", desc: "Jobs matched to your skills & visa eligibility", color: "from-indigo-500 to-blue-500" },
        { href: "/budget", icon: Wallet, title: "Budget Planner", desc: "Estimate monthly living costs abroad", color: "from-emerald-500 to-green-500" },
        { href: "/checklist", icon: CheckSquare, title: "Relocation Checklist", desc: "Track pre-departure & post-arrival tasks", color: "from-amber-500 to-orange-500" },
        { href: "/community", icon: Users, title: "Community", desc: "Connect with student clubs & groups", color: "from-violet-500 to-purple-500" },
      ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-midnight">Welcome back, {user.name}</h1>
          <Badge variant="info">{ROLE_LABELS[role]}</Badge>
        </div>
        <p className="mt-1 text-slate-500">
          {role === "EMPLOYER"
            ? "Manage your hiring pipeline and find top international talent."
            : "Here's what's happening with your relocation journey."}
        </p>
      </div>

      {/* Profile completeness banner */}
      {!pref?.destinationCountry && role !== "EMPLOYER" && (
        <Card className="border-electric/20 bg-gradient-to-r from-electric/5 to-cyan/5">
          <CardContent className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric/10">
                <Sparkles className="h-6 w-6 text-electric" />
              </div>
              <div>
                <p className="font-semibold text-midnight">Complete your profile</p>
                <p className="text-sm text-slate-600">Tell us about your destination to get personalized recommendations.</p>
              </div>
            </div>
            <Link href="/profile">
              <span className="inline-flex items-center gap-1 font-medium text-electric text-sm hover:gap-2 transition-all whitespace-nowrap">
                Set up <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-midnight">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="group h-full cursor-pointer border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-electric/20">
                <CardContent className="pt-6">
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${link.color}`}>
                    <link.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-midnight">{link.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{link.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Applications / Jobs overview */}
      {role !== "EMPLOYER" && user.applications.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/jobs">
              <span className="text-sm text-electric hover:underline">View all</span>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {user.applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="font-medium text-midnight">{app.job.title}</p>
                    <p className="text-sm text-slate-500">{app.job.company.name} · {app.job.location}</p>
                  </div>
                  <Badge variant={
                    app.status === "OFFERED" ? "success" :
                    app.status === "INTERVIEW" ? "info" :
                    app.status === "REJECTED" ? "danger" :
                    app.status === "REVIEWED" ? "warning" : "default"
                  }>
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {role === "EMPLOYER" && user.company && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Job Postings ({user.company.jobs.length})</CardTitle>
            <Link href="/jobs/post">
              <span className="text-sm text-electric hover:underline">Post new</span>
            </Link>
          </CardHeader>
          <CardContent>
            {user.company.jobs.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-slate-500 mb-4">No jobs posted yet.</p>
                <Link href="/jobs/post">
                  <span className="inline-flex items-center gap-1 text-electric font-medium text-sm hover:gap-2 transition-all">
                    Post your first job <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {user.company.jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="font-medium text-midnight">{job.title}</p>
                      <p className="text-sm text-slate-500">{job.location} · {job.jobType}</p>
                    </div>
                    <Link href={`/jobs/${job.id}`}>
                      <span className="text-sm text-electric hover:underline">View</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
