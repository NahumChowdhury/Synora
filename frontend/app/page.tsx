export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Synora</h1>

          <div className="flex gap-4">
            <button className="px-4 py-2 rounded-lg border border-slate-700">
              Login
            </button>

            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700">
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-6xl font-bold mb-6">
          Campus Life, Unified.
        </h2>

        <p className="text-slate-400 text-xl max-w-3xl mx-auto">
          A complete student platform for tasks, borrowing,
          opportunities and campus reviews.
        </p>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h3 className="text-2xl font-semibold mb-3">
              💰 Task Marketplace
            </h3>
            <p>
              Anonymous task hiring with worker selection,
              payment tracking and dual ratings.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h3 className="text-2xl font-semibold mb-3">
              🔄 Borrow Hub
            </h3>
            <p>
              Borrow and lend campus items using the
              Synora credit system.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h3 className="text-2xl font-semibold mb-3">
              👥 Opportunity Network
            </h3>
            <p>
              Find project members, club recruits,
              travel partners and business teammates.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl">
            <h3 className="text-2xl font-semibold mb-3">
              🏪 Campus Guide
            </h3>
            <p>
              Discover and review campus restaurants,
              hotels and shops.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}