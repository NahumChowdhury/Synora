import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-12">
      <article className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <Link href="/" className="text-xs text-blue-600 font-semibold hover:underline">← Back to Synora</Link>
          <h1 className="text-2xl font-bold mt-4">Privacy Notice</h1>
          <p className="text-sm text-slate-500 mt-2">Plain-language pilot notice for Synora users.</p>
        </div>
        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="font-bold text-slate-900">What Synora stores</h2>
          <p>Synora stores the verified DIU email linked to your Google identity, profile information you choose to provide, task activity, participant messages, ratings, moderation blocks, and message reports needed to operate the service.</p>
        </section>
        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="font-bold text-slate-900">Google authentication</h2>
          <p>Google authenticates your DIU account. Synora does not receive or store your Google password. Synora stores the Google account subject identifier needed to link future logins to the same Synora account.</p>
        </section>
        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="font-bold text-slate-900">Task identity</h2>
          <p>Task Marketplace is designed to hide participant identity from other task users and uses task-specific aliases. DIU email and profile details are not exposed as task identities.</p>
        </section>
        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="font-bold text-slate-900">Moderation</h2>
          <p>Messages may be reported to administrators. Reports can include the reported message and account information required to review abuse or safety concerns.</p>
        </section>
        <section className="space-y-2 text-sm text-slate-700 leading-relaxed">
          <h2 className="font-bold text-slate-900">Pilot status</h2>
          <p>Before public launch, the project owner should publish a final contact method, retention policy, deletion process, and any university-required privacy terms. This page is a product draft, not legal advice.</p>
        </section>
      </article>
    </main>
  );
}
