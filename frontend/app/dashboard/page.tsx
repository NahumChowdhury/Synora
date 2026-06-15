export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <h1 className="text-5xl font-bold mb-10">
          Synora Dashboard
        </h1>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold">
              Task Marketplace
            </h2>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold">
              Borrow Hub
            </h2>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold">
              Opportunity Network
            </h2>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold">
              Campus Guide
            </h2>
          </div>

        </div>

      </div>

    </main>
  );
}