import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white py-12 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold tracking-tighter mb-4">
              <Droplet className="w-8 h-8 text-cyan-500" />
              <span>AQUORA</span>
            </Link>
            <p className="text-gray-400 text-sm">
              The future of hydration. Premium, smart, and fully automated sanitizer vending.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-cyan-500 transition-colors">Menu</Link></li>
              <li><Link to="/" className="hover:text-cyan-500 transition-colors">Locations</Link></li>
              <li><Link to="/" className="hover:text-cyan-500 transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-cyan-500 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-cyan-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-cyan-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-cyan-500 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Connect</h4>
            <div className="flex space-x-4">
              {/* Social Icons Placeholder */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Insta</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Aquora Vending Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
