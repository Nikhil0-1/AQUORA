import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { api } from '@aquora/api-client';
import { HeroFruitCanvas } from '../components/3d/HeroFruitCanvas';
import { ProductCard } from '../components/ProductCard';
import { Droplet, Zap, ShieldCheck } from 'lucide-react';
export function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await api.getProducts();
                setProducts(data);
            }
            catch (error) {
                console.error('Failed to fetch products', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);
    return (_jsxs("div", { className: "min-h-screen", children: [_jsxs("section", { className: "relative h-screen flex items-center pt-20", children: [_jsx("div", { className: "absolute inset-0 z-0", children: _jsx(HeroFruitCanvas, {}) }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0 pointer-events-none" }), _jsx("div", { className: "container mx-auto px-4 relative z-10", children: _jsxs("div", { className: "max-w-2xl", children: [_jsxs("h1", { className: "text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-tight", children: ["Smart Dispensing. ", _jsx("br", {}), _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600", children: "Pure Convenience." })] }), _jsx("p", { className: "text-xl text-gray-300 mb-8 max-w-lg", children: "Choose your sanitizer. Pay securely. Scan once. Get exactly what you ordered." }), _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx("a", { href: "#menu", className: "bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform", children: "Explore Menu" }), _jsx("a", { href: "#how-it-works", className: "bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold backdrop-blur-md hover:bg-white/20 transition-all", children: "How it Works" })] })] }) })] }), _jsx("section", { className: "py-24 bg-black border-y border-white/5 relative z-10", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-12", children: [_jsx(Feature, { icon: _jsx(ShieldCheck, {}), title: "99.9% Germ Protection", desc: "Formulated for maximum safety." }), _jsx(Feature, { icon: _jsx(Zap, {}), title: "Touchless Dispensing", desc: "Precision pumps for exact volume." }), _jsx(Feature, { icon: _jsx(ShieldCheck, {}), title: "Secure Payments", desc: "Encrypted and safe transactions." }), _jsx(Feature, { icon: _jsx(Droplet, {}), title: "Premium Feel", desc: "Aloe Vera and essential oils." })] }) }) }), _jsx("section", { id: "menu", className: "py-32 relative z-10 bg-zinc-950", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight", children: "Our Selection" }), _jsx("p", { className: "text-gray-400 max-w-2xl mx-auto", children: "Choose from our carefully crafted signature blends." })] }), loading ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" }) })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8", children: products.map(product => (_jsx(ProductCard, { product: product }, product.id))) }))] }) }), _jsx("section", { id: "how-it-works", className: "py-32 bg-black relative z-10", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-20", children: [_jsx("h2", { className: "text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight", children: "How It Works" }), _jsx("p", { className: "text-gray-400", children: "Three simple steps to refreshment." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto", children: [_jsx(Step, { number: "01", title: "Order Online", desc: "Browse our menu and pay securely from your phone." }), _jsx(Step, { number: "02", title: "Get QR Code", desc: "Receive a unique, one-time secure token." }), _jsx(Step, { number: "03", title: "Scan & Dispense", desc: "Scan at any Aquora machine and get your sanitizer." })] })] }) })] }));
}
function Feature({ icon, title, desc }) {
    return (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-cyan-500/10 text-cyan-500 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20", children: React.cloneElement(icon, { className: 'w-8 h-8' }) }), _jsx("h3", { className: "text-xl font-bold text-white mb-2", children: title }), _jsx("p", { className: "text-gray-400", children: desc })] }));
}
function Step({ number, title, desc }) {
    return (_jsxs("div", { className: "relative p-8 rounded-3xl bg-white/5 border border-white/10 text-center", children: [_jsx("div", { className: "absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold font-mono border-4 border-black", children: number }), _jsx("h3", { className: "text-2xl font-bold text-white mb-4 mt-4", children: title }), _jsx("p", { className: "text-gray-400", children: desc })] }));
}
