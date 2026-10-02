import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, Sparkles, Cpu, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMachine } from '../context/MachineContext';

interface NavbarProps {
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { machine, machineCode, selectMachine } = useMachine();
  const [showMachineDropdown, setShowMachineDropdown] = useState(false);

  const handleCartClick = () => {
    if (onOpenCart) onOpenCart();
    else setIsCartOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            AQ
          </div>
          <div>
            <span className="text-xl font-bold tracking-wider text-slate-100 block leading-none">
              AQUORA
            </span>
            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold">
              Smart Sanitizer Kiosk
            </span>
          </div>
        </Link>

        {/* Machine Status Pill */}
        <div className="relative">
          <button
            onClick={() => setShowMachineDropdown(!showMachineDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-100">{machineCode}</span>
            <span className="hidden md:inline text-slate-400 max-w-[140px] truncate">
              {machine?.location || 'India Station 01'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showMachineDropdown && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Connected Machine
              </p>
              <button
                onClick={() => {
                  selectMachine('AQ-VM-001');
                  setShowMachineDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                  machineCode === 'AQ-VM-001' ? 'bg-cyan-500/15 font-bold text-cyan-400 border border-cyan-500/30' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-semibold">AQ-VM-001 (CyberHub Kiosk)</div>
                  <div className="text-[10px] text-slate-400">5 Tanks Active • Online</div>
                </div>
                {machineCode === 'AQ-VM-001' && <span className="text-cyan-400">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Navigation & Cart Action */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCartClick}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors shadow-sm"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
