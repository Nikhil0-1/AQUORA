import React from 'react';
import { Droplets, ShieldCheck, Heart, MapPin, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#050B14] border-t border-[#1E2C44]/80 py-16 text-slate-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D2FF] to-[#0072FF] flex items-center justify-center text-slate-950">
                <Droplets className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold text-white">AQUORA</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Next-generation touchless liquid sanitizer dispensing network. Precision flow calibrated, 99.9% clinical protection.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Formulas</h4>
            <ul className="text-xs space-y-2">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Classic Medical Grade</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Aloe Vera Hydrating</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Tea Tree Herbal Mist</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Lavender Essence</a></li>
            </ul>
          </div>

          {/* Technology & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">IoT Technology</h4>
            <div className="text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dual ESP32 Microcontrollers</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Single-Pump Safety Interlock</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Station: AQ-DM-001 (Mumbai)</span>
              </div>
            </div>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Need Help?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Facing an issue with your dispensing job? Automatic refunds are triggered for unfulfilled dispenses.
            </p>
            <div className="text-xs font-mono text-cyan-400">
              support@aquora.internal
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1E2C44]/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} AQUORA Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span>Crafted for safety & convenience</span>
              <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500 ml-0.5" />
            </span>
            <a
              href="/admin"
              className="text-slate-600 hover:text-cyan-400 transition-colors flex items-center gap-1"
              title="AQUORA Admin Operations (/admin)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Operations</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
