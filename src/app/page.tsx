import Link from "next/link";
import { TruckIcon, UsersIcon, PlayCircleIcon, BoltIcon, ComputerDesktopIcon, DevicePhoneMobileIcon, TvIcon, DeviceTabletIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const productIcons: Record<string, any> = {
    Laptops: <ComputerDesktopIcon className="h-10 w-10 text-blue-600 z-10" />,
    Smartphones: <DevicePhoneMobileIcon className="h-10 w-10 text-blue-600 z-10" />,
    Monitors: <TvIcon className="h-10 w-10 text-blue-600 z-10" />,
    Tablets: <DeviceTabletIcon className="h-10 w-10 text-blue-600 z-10" />,
  };
  const productSubtitles: Record<string, string> = {
    Laptops: "Explore the newest arrivals",
    Smartphones: "Latest flagship devices",
    Monitors: "Crisp, clear displays",
    Tablets: "Portable productivity",
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-x-hidden">
      {/* Animated Background Shape */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-blue-400/20 rounded-full blur-3xl animate-pulse z-0" />
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-blue-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Distributech</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-blue-600 transition">Login</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
                <span className="block">Streamline Your Tech Distribution</span>
                <span className="block text-blue-600">Across Morocco</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                The all-in-one platform for distributors and retailers. Manage inventory, track shipments, and grow your business with ease.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
                  Start Distributing
                </Link>
                <Link href="#features" className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2">
                  <PlayCircleIcon className="w-6 h-6" />
                  See Demo
                </Link>
              </div>
              <div className="text-blue-500 font-medium mt-4 animate-fade-in-slow">Trusted by tech businesses across Morocco</div>
            </div>
            <div className="relative h-[500px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl transform rotate-3 scale-105" />
              <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-8 transform -rotate-3 flex items-center justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-md">
                  {['Laptops', 'Smartphones', 'Monitors', 'Tablets'].map((item) => (
                    <div
                      key={item}
                      aria-label={item}
                      className="relative bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-lg border border-blue-100 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-200 group cursor-pointer"
                    >
                      <div className="relative z-10 flex flex-col items-center">
                        {productIcons[item]}
                        <h3 className="font-bold text-lg text-gray-900 mt-2 mb-1">{item}</h3>
                        <p className="text-sm text-gray-500 mb-1">{productSubtitles[item]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Distributech?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Inventory",
                description: "Real-time tracking and management of your product inventory",
                icon: <BoltIcon className="w-10 h-10 text-blue-500 mb-4" />
              },
              {
                title: "Efficient Distribution",
                description: "Streamlined shipping and delivery across Morocco",
                icon: <TruckIcon className="w-10 h-10 text-blue-500 mb-4" />
              },
              {
                title: "Retailer Network",
                description: "Connect with trusted retailers nationwide",
                icon: <UsersIcon className="w-10 h-10 text-blue-500 mb-4" />
              }
            ].map((feature) => (
              <div key={feature.title} className="p-8 rounded-2xl bg-blue-50 hover:bg-blue-100 transition shadow-lg flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Sign Up",
                desc: "Create your distributor or retailer account in minutes."
              },
              {
                step: 2,
                title: "Add Products & Inventory",
                desc: "List your products and manage stock in real time."
              },
              {
                step: 3,
                title: "Start Shipping",
                desc: "Connect with retailers and fulfill orders efficiently."
              }
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border-t-4 border-blue-500">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 mb-4">{item.step}</div>
                <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-blue-600">Distributech</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Tech Distribution Platform</span>
          </div>
          <div className="flex gap-6 text-gray-600">
            <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
            <Link href="/dashboard/products" className="hover:text-blue-600 transition">Products</Link>
            <Link href="/dashboard/shipments" className="hover:text-blue-600 transition">Shipments</Link>
            <Link href="/dashboard/inventory" className="hover:text-blue-600 transition">Inventory</Link>
          </div>
          <div className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Distributech. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
