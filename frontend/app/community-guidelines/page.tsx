import Link from "next/link";

export default function CommunityGuidelinesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-12">
      <article className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <Link href="/" className="text-xs text-blue-600 font-semibold hover:underline">← Back to Synora</Link>
          <h1 className="text-2xl font-bold mt-4">Community Guidelines</h1>
          <p className="text-sm text-slate-500 mt-2">Keep Synora useful, professional, and safe for students.</p>
        </div>
        <ul className="list-disc pl-5 space-y-3 text-sm text-slate-700 leading-relaxed">
          <li>Use your own verified DIU identity and keep your account information accurate.</li>
          <li>Respect Task Marketplace anonymity. Do not pressure another participant to reveal private identity details.</li>
          <li>Do not send adult or sexual content, threats, harassment, hate, spam, scams, or requests for unsafe activity.</li>
          <li>Keep task descriptions relevant to legitimate student collaboration.</li>
          <li>Use Block when you do not want further contact and Report when a message needs administrator review.</li>
          <li>Do not share passwords, authentication tokens, financial credentials, or other sensitive personal information in messages.</li>
        </ul>
        <p className="text-sm text-slate-600">Automated message checks are only one safeguard and cannot detect every harmful message. Reporting and administrator review remain important.</p>
      </article>
    </main>
  );
}
