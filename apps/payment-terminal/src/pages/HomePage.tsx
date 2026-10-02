import React, { useEffect, useState } from 'react';
import { api } from '@aquora/api-client';
import { Product } from '@aquora/shared-types';
import { HeroFruitCanvas } from '../components/3d/HeroFruitCanvas';
import { ProductCard } from '../components/ProductCard';
import { Droplet, Leaf, Zap, ShieldCheck } from 'lucide-react';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <HeroFruitCanvas />
        </div>
        
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-tight">
              Smart Dispensing. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                Pure Convenience.
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-lg">
              Choose your sanitizer. Pay securely. Scan once. Get exactly what you ordered.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#menu" className="bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform">
                Explore Menu
              </a>
              <a href="#how-it-works" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold backdrop-blur-md hover:bg-white/20 transition-all">
                How it Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black border-y border-white/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <Feature icon={<ShieldCheck />} title="99.9% Germ Protection" desc="Formulated for maximum safety." />
            <Feature icon={<Zap />} title="Touchless Dispensing" desc="Precision pumps for exact volume." />
            <Feature icon={<ShieldCheck />} title="Secure Payments" desc="Encrypted and safe transactions." />
            <Feature icon={<Droplet />} title="Premium Feel" desc="Aloe Vera and essential oils." />
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-32 relative z-10 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Our Selection</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Choose from our carefully crafted signature blends.</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 bg-black relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">How It Works</h2>
            <p className="text-gray-400">Three simple steps to refreshment.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <Step number="01" title="Order Online" desc="Browse our menu and pay securely from your phone." />
            <Step number="02" title="Get QR Code" desc="Receive a unique, one-time secure token." />
            <Step number="03" title="Scan & Dispense" desc="Scan at any Aquora machine and get your sanitizer." />
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto bg-cyan-500/10 text-cyan-500 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-8 h-8' })}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold font-mono border-4 border-black">
        {number}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 mt-4">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}
