import React from 'react';
import { Link } from 'react-router-dom';
import { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ShieldCheck, Zap, Droplets, ArrowRight, Award, RefreshCw, Smartphone } from 'lucide-react';

interface Props {
  products: Product[];
  onAddToCart: (product: Product, variant: ProductVariant | undefined, volumeMl: number) => void;
}

export function HomePage({ products, onAddToCart }: Props) {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#0F1A2D] border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-cyan-300 shadow-lg shadow-cyan-500/10">
            <SparkleIcon />
            <span>Next-Generation Touchless Sanitizer Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Pure Protection. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Dispensed In Seconds.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Order your preferred sanitizer formula online, pay seamlessly, and touchlessly dispense exactly what you ordered at any AQUORA IoT vending station.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/products"
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-8 py-4 rounded-2xl text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>ORDER NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto bg-[#0A111E] hover:bg-[#1E2C44] text-slate-200 border border-[#1E2C44] font-semibold px-8 py-4 rounded-2xl text-sm transition-all"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#0A111E] border border-[#1E2C44] rounded-3xl">
          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">99.9% Efficacy</h4>
              <p className="text-[11px] text-slate-400">Certified germ kill</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Touchless Flow</h4>
              <p className="text-[11px] text-slate-400">Zero physical contact</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Precision Pumps</h4>
              <p className="text-[11px] text-slate-400">Accurate to 1ml</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Digital Orders</h4>
              <p className="text-[11px] text-slate-400">Order from anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              Select Your Formula
            </span>
            <h2 className="text-3xl font-extrabold text-white">Available at Station AQ-DM-001</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
          >
            <span>View All Formulas</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-white">How Online Dispensing Works</h2>
          <p className="text-xs text-slate-400">
            No app download required. Order on this web app and collect your sanitizer at the machine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-[#0A111E] border border-[#1E2C44] rounded-3xl p-8 space-y-4">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">01</span>
            <h3 className="text-lg font-bold text-white">Order Online</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your formula, select your volume (50ml to 500ml), and pay securely via Razorpay UPI / Cards.
            </p>
          </div>

          <div className="bg-[#0A111E] border border-[#1E2C44] rounded-3xl p-8 space-y-4">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">02</span>
            <h3 className="text-lg font-bold text-white">Walk to Station</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Approach AQUORA Station <strong>AQ-DM-001</strong> and place your hands or bottle under the nozzle.
            </p>
          </div>

          <div className="bg-[#0A111E] border border-[#1E2C44] rounded-3xl p-8 space-y-4">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">03</span>
            <h3 className="text-lg font-bold text-white">Touchless Dispense</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The precision pump calibrates through high-resolution flow sensors to deliver the exact volume requested.
            </p>
          </div>
        </div>
      </section>

      {/* Station Map & Status */}
      <section id="stations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0A111E] to-[#0F1A2D] border border-[#1E2C44] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Station Active & Connected</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              AQUORA Station AQ-DM-001
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equipped with 5 independent peristaltic liquid channels, hardware safety interlocks, and real-time flow measurement.
            </p>
          </div>

          <Link
            to="/products"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 shrink-0"
          >
            Order at this station
          </Link>
        </div>
      </section>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  );
}
