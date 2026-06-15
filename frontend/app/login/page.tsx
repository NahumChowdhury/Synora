export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Login to Synora
        </h1>

        <form className="space-y-4">

          <input
            type="email"
            placeholder="DIU Email"
            className="w-full p-3 rounded-lg bg-slate-800"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-slate-800"
          />

          <button
            className="w-full bg-blue-600 py-3 rounded-lg"
          >
            Login
          </button>

        </form>

      </div>
    </main>
  );
}