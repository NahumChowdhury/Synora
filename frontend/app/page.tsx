import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">

      {/* FLOATING HEADER BAR */}
      <header className="sticky top-4 z-50 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs rounded-full px-5 py-3 flex items-center justify-between transition-all">

          {/* Left: Brand Logo & DIU Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-base shadow-xs">
                S
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Synora</span>
            </Link>
            <span className="hidden sm:inline-block bg-slate-100 text-slate-600 rounded-md px-2.5 py-0.5 text-[11px] font-bold border border-slate-200/60 uppercase tracking-wider">
              DIU Campus
            </span>
          </div>

          {/* Center: Module Navigation Links (2 Major Pillars) */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Task Board
            </Link>
            <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Team Match
            </Link>
            <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Messages
            </Link>
          </nav>

          {/* Right: Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors hidden sm:block"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-full shadow-xs transition-all"
            >
              Register
            </Link>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-12 sm:pt-16 pb-16 px-4 sm:px-8 max-w-7xl mx-auto relative overflow-hidden">

        {/* Background Accent Blobs */}
        <div className="absolute top-10 -left-20 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6">

            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Your campus.
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Your network.
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-600 tracking-tight leading-[1.1] relative inline-block">
                Your opportunities.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-500/40" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 9C50 3 150 3 198 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </h1>
            </div>

            <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed font-normal">
              The unified university platform for student task hiring and professional opportunity matching at Daffodil International University. Get academic help or find teammates for projects, startups, research, and competitions.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 group text-sm"
              >
                <span>Explore Synora</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>

              <Link
                href="/login"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold px-6 py-3.5 rounded-full shadow-2xs transition-all flex items-center gap-2 text-sm"
              >
                <span>How It Works</span>
                <span className="text-xs text-slate-400">▷</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-slate-600 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>DIU Students Only</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">🛡️</span>
                <span>Secure & Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">👥</span>
                <span>Opportunity Driven</span>
              </div>
            </div>

          </div>

          {/* Right Column: Layered 2-Pillar Product Showcase (No People) */}
          <div className="lg:col-span-6 relative">

            {/* Dot Matrix Patterns */}
            <div className="absolute -top-6 -right-6 grid grid-cols-5 gap-2 opacity-30 pointer-events-none">
              {[...Array(25)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              ))}
            </div>
            <div className="absolute -bottom-6 -left-6 grid grid-cols-5 gap-2 opacity-30 pointer-events-none">
              {[...Array(25)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              ))}
            </div>

            {/* Main Window Container */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl p-5 sm:p-6 space-y-4 relative z-10">

              {/* Window Title Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="bg-slate-100 rounded-md px-3 py-1 text-[11px] text-slate-500 font-mono font-medium">
                  app.synora.diu/hub
                </div>
                <div className="text-xs text-slate-400 font-semibold">DIU Verified ✓</div>
              </div>

              {/* Showcase Widgets (2 Pillars) */}
              <div className="space-y-3.5">

                {/* Pillar 1: Task Marketplace Widget */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                      📋
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">CSE Algorithm Presentation Help</span>
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">OPEN</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Anonymous requester: <span className="font-semibold text-slate-700">Student #102</span> • 2 hrs ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-emerald-700">৳500</span>
                    <div className="text-[10px] text-slate-400 font-semibold">3 Applicants</div>
                  </div>
                </div>

                {/* Pillar 2: Team Match Opportunity Widget */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:border-purple-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                      👥
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">National AI Hackathon Teammate</span>
                        <span className="bg-purple-100 text-purple-800 font-bold text-[10px] px-2 py-0.5 rounded-full">CSE Batch 58</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Skills needed: <span className="font-semibold text-slate-700">Python, React, Machine Learning</span></p>
                    </div>
                  </div>
                  <button className="bg-slate-900 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                    Connect
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* TWO CORE FEATURES SECTION */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">

        {/* Section Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-emerald-600 font-extrabold text-xs tracking-widest uppercase block">
            OUR CORE FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight relative inline-block pb-3">
            Designed for everyday campus life
            <svg className="absolute bottom-0 left-1/4 w-1/2 h-2 text-emerald-500/50" viewBox="0 0 100 8" fill="none" preserveAspectRatio="none">
              <path d="M0 5C30 2 70 2 100 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base pt-2 font-normal">
            Two purpose-built modules designed specifically for DIU students to solve academic tasks and form professional collaborations.
          </p>
        </div>

        {/* 2-Column Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* FEATURE 1 — TASK MARKETPLACE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between group">
            <div className="space-y-5">

              <div className="flex items-center justify-between">
                {/* Squircle Green Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform">
                  🧰
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Task Marketplace</h3>
                <p className="text-slate-600 text-sm leading-relaxed mt-2">
                  Post tasks or find help for assignments, presentations, thesis research, coding, and productivity work while keeping worker identity anonymous.
                </p>
              </div>

              {/* Mini UI Feature Preview Box */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-2.5 pt-4">
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                  <span>Anonymous Task Hiring</span>
                  <span className="text-emerald-700 font-bold">Student #102</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex justify-between items-center font-semibold text-slate-800 text-xs">
                  <span>Academic Presentation Design</span>
                  <span className="text-emerald-600 font-extrabold">৳450</span>
                </div>
              </div>

            </div>

            <div className="pt-8">
              <Link href="/dashboard" className="text-emerald-600 font-semibold text-sm hover:underline inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Explore Tasks</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* FEATURE 2 — TEAM MATCH */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between group">
            <div className="space-y-5">

              <div className="flex items-center justify-between">
                {/* Squircle Purple Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform">
                  👥
                </div>
                <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Team Match & Opportunity Network</h3>
                <p className="text-slate-600 text-sm leading-relaxed mt-2">
                  Find teammates for capstone projects, course work, clubs, startups, research, tours, competitions, and business collaborations using verified student profiles.
                </p>
              </div>

              {/* Mini UI Feature Preview Box */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-2.5 pt-4">
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                  <span>Structured Categories</span>
                  <span className="text-purple-700 font-bold">5 Categories</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex justify-between items-center font-semibold text-slate-800 text-xs">
                  <span>Academic · Club · Startup · Tour · Skills</span>
                  <span className="text-purple-600 font-bold">Connect →</span>
                </div>
              </div>

            </div>

            <div className="pt-8">
              <Link href="/dashboard" className="text-purple-600 font-semibold text-sm hover:underline inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Find Teammates</span>
                <span>→</span>
              </Link>
            </div>
          </div>

        </div>

      </section>

      {/* BOTTOM STATS BANNER */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto pt-4">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">

            <div className="pt-4 lg:pt-0 space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2">
                <span className="text-emerald-400">👥</span>
                <span>10K+</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">DIU Students</p>
            </div>

            <div className="pt-4 lg:pt-0 space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2">
                <span className="text-blue-400">📋</span>
                <span>5K+</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Tasks Completed</p>
            </div>

            <div className="pt-4 lg:pt-0 space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2">
                <span className="text-amber-400">⭐</span>
                <span>4.8/5</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Average Rating</p>
            </div>

            <div className="pt-4 lg:pt-0 space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2">
                <span className="text-purple-400">🛡️</span>
                <span>100%</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">DIU Verified</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
