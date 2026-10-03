import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, ShoppingBag, ShieldCheck } from 'lucide-react';

interface Props {
  cartCount: number;
  onOpenCart: () => void;
}

export function Navbar({ cartCount, onOpenCart }: Props) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#050B14]/85 backdrop-blur-xl border-b border-[#1E2C44]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00D2FF] to-[#0072FF] flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-all duration-300">
            <Droplets className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-wider text-white block leading-none">
              AQUORA
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#00D2FF] font-mono font-bold mt-1 block">
              Smart Dispensing
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <Link to="/" className="hover:text-[#00D2FF] transition-colors">Home</Link>
          <Link to="/products" className="hover:text-[#00D2FF] transition-colors">Catalog</Link>
          <a href="#how-it-works" className="hover:text-[#00D2FF] transition-colors">How It Works</a>
          <a href="#stations" className="hover:text-[#00D2FF] transition-colors">Stations</a>
        </nav>

        {/* Right CTA / Cart */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-[#0A111E] border border-[#1E2C44] px-3.5 py-1.5 rounded-full text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-200">Station AQ-DM-001 Online</span>
          </div>

          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-[#0F1A2D] hover:bg-[#1E2C44] border border-[#1E2C44] text-slate-200 transition-all hover:scale-105"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5 text-[#00D2FF]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          <Link
            to="/admin"
            className="p-2.5 rounded-xl bg-[#0F1A2D] hover:bg-[#1E2C44] border border-[#1E2C44] text-slate-400 hover:text-cyan-400 transition-all hover:scale-105"
            title="Admin Portal (/admin)"
          >
            <ShieldCheck className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
