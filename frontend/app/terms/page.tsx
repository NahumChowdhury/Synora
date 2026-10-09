import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-12">
      <article className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <Link href="/" className="text-xs text-blue-600 font-semibold hover:underline">← Back to Synora</Link>
          <h1 className="text-2xl font-bold mt-4">Terms of Use</h1>
          <p className="text-sm text-slate-500 mt-2">Pilot terms for responsible use of Synora.</p>
        </div>
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>Use Synora only with your own verified DIU Google account. Do not impersonate another student, attempt to bypass access controls, or share access to your account.</p>
          <p>Use Task Marketplace for lawful university collaboration. Do not use Synora for fraud, harassment, threats, adult or sexual content, spam, or activity that violates university rules or applicable law.</p>
          <p>Task budgets, agreements, deadlines, and work quality are arrangements between participating students. Synora does not currently provide escrow, payment processing, or a guarantee of performance.</p>
          <p>Administrators may restrict accounts or review reports when needed to protect users and the platform.</p>
          <p>Synora is an independent student platform and should not be represented as an official Daffodil International University service unless formal approval exists.</p>
          <p>These are pilot product terms and should be reviewed and finalized by the project owner before broad public launch.</p>
        </div>
      </article>
    </main>
  );
}
