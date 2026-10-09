import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      <header className="sticky top-4 z-50 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs rounded-full px-5 py-3 flex items-center justify-between transition-all">
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

          <nav className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Link href="/dashboard?tab=tasks" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Task Marketplace
            </Link>
            <Link href="/dashboard?tab=chat" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Messages
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors hidden sm:block">
              Login
            </Link>
            <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-full shadow-xs transition-all">
              Register
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-12 sm:pt-16 pb-16 px-4 sm:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <div className="absolute top-10 -left-20 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">Campus tasks.</h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">Verified students.</h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-600 tracking-tight leading-[1.1] relative inline-block">
                One focused marketplace.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-500/40" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 9C50 3 150 3 198 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </h1>
            </div>

            <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed font-normal">
              Synora is a DIU student task marketplace. Post a task, apply anonymously, assign a worker, coordinate in private messages, complete the work, and rate the experience.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 group text-sm">
                <span>Register</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
              <Link href="#how-it-works" className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold px-6 py-3.5 rounded-full shadow-2xs transition-all flex items-center gap-2 text-sm">
                <span>How It Works</span>
                <span className="text-xs text-slate-400">▷</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-slate-600 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Verified DIU Google Account</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">🛡️</span>
                <span>Anonymous Task Identity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">💬</span>
                <span>Participant-Only Messaging</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="absolute -top-6 -right-6 grid grid-cols-5 gap-2 opacity-30 pointer-events-none">
              {[...Array(25)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-600" />)}
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl p-5 sm:p-6 space-y-4 relative z-10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="bg-slate-100 rounded-md px-3 py-1 text-[11px] text-slate-500 font-mono font-medium">Synora • Task Marketplace</div>
                <div className="text-xs text-slate-400 font-semibold">Product preview</div>
              </div>

              <div className="space-y-3.5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">📋</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Example task: Presentation Help</span>
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">OPEN</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Requester posts the work, deadline, requirements, and budget.</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-700">৳500</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["1", "Apply", "Anonymous worker alias"],
                    ["2", "Assign", "Private task chat opens"],
                    ["3", "Complete", "Both sides can rate"],
                  ].map(([step, title, text]) => (
                    <div key={step} className="border border-slate-200 rounded-xl p-3 bg-white">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center mb-2">{step}</div>
                      <div className="font-bold text-xs text-slate-900">{title}</div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-emerald-600 font-extrabold text-xs tracking-widest uppercase block">ONE CORE FEATURE</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight relative inline-block pb-3">
            Task Marketplace, end to end
            <svg className="absolute bottom-0 left-1/4 w-1/2 h-2 text-emerald-500/50" viewBox="0 0 100 8" fill="none" preserveAspectRatio="none">
              <path d="M0 5C30 2 70 2 100 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base pt-2 font-normal">
            Everything in Synora now supports one focused workflow: students posting tasks and verified DIU students applying to complete them.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center text-2xl shadow-2xs">🧰</div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Task Marketplace</h3>
                <p className="text-slate-600 text-sm leading-relaxed mt-2">
                  Post assignments, presentation work, research help, design, coding, and other student tasks. Applicants appear through task-specific anonymous aliases instead of exposing their DIU email or profile identity.
                </p>
              </div>
              <Link href="/dashboard?tab=tasks" className="text-emerald-600 font-semibold text-sm hover:underline inline-flex items-center gap-1.5">
                <span>Explore Tasks</span><span>→</span>
              </Link>
            </div>

            <div className="space-y-3">
              {[
                ["Post", "Create a task with category, requirements, deadline, and budget."],
                ["Apply", "Verified students apply while their task identity stays anonymous."],
                ["Assign", "The requester selects one worker and a private task conversation opens."],
                ["Complete", "Move through Assigned → In Progress → Completed, then rate within the allowed window."],
              ].map(([title, text], index) => (
                <div key={title} className="flex gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">{index + 1}</div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{title}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 max-w-7xl mx-auto pt-4">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div><div className="text-xl font-bold">Verified DIU identity</div><p className="text-sm text-slate-400 mt-1">Students authenticate with an official DIU Google account.</p></div>
            <div><div className="text-xl font-bold">Anonymous task identity</div><p className="text-sm text-slate-400 mt-1">Worker email and profile identity are not exposed in task flows.</p></div>
            <div><div className="text-xl font-bold">Private task messaging</div><p className="text-sm text-slate-400 mt-1">Chat is available only to the requester and selected worker, with blocking and reporting controls.</p></div>
          </div>
        </div>
      </section>

      <footer className="px-4 sm:px-8 max-w-7xl mx-auto pt-12">
        <div className="border-t border-slate-200 py-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">Synora</p>
            <p className="mt-1 max-w-2xl">An independent student task marketplace for the DIU community. It should not be presented as an official university service unless formally approved by Daffodil International University.</p>
          </div>
          <div className="flex flex-wrap gap-4 font-semibold">
            <Link href="/community-guidelines" className="hover:text-slate-900">Community Guidelines</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
