import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-[family-name:var(--font-geist-sans)]">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">CD</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Chauhan Dairies
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamlining Dairy Management with Precision Analytics
          </p>
          
          {/* Admin Dashboard Button */}
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/dashboard/admin"
              className="relative group inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <span className="relative z-10">Access Admin Dashboard</span>
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 px-2 py-1 text-xs rounded-full shadow-md">
                Testing
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-gray-600">Monitor milk production, sales, and inventory with live updates</p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-blue-600 text-xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Loss Management</h3>
            <p className="text-gray-600">Track and analyze chillar loss, purchase discrepancies, and TS loss</p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-blue-600 text-xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Financial Insights</h3>
            <p className="text-gray-600">Detailed expense vs revenue tracking with visual reports</p>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Why Choose MilkChillar?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <div className="text-4xl mb-4">🥛</div>
              <h3 className="text-xl font-semibold mb-2">Precision Tracking</h3>
              <p className="text-blue-200">Accurate measurement down to the last milliliter</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-semibold mb-2">Instant Updates</h3>
              <p className="text-blue-200">Real-time data synchronization across all devices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 MilkChillar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}