import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
export function ProductCard({ product }) {
    const { addToCart } = useCart();
    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 100, 1);
    };
    return (_jsxs(Link, { to: `/product/${product.id}`, className: "group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-cyan-500/50 transition-all duration-300 block", children: [_jsxs("div", { className: "aspect-square bg-white/5 relative overflow-hidden", children: [product.image_url ? (_jsx("img", { src: product.image_url, alt: product.name, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center text-gray-500", children: "No Image" })), product.is_available && (_jsx("button", { onClick: handleAdd, className: "absolute bottom-4 right-4 bg-cyan-500 text-white p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-cyan-600 shadow-lg", children: _jsx(Plus, { className: "w-6 h-6" }) })), !product.is_available && (_jsx("div", { className: "absolute inset-0 bg-black/60 flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold tracking-widest uppercase text-sm border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm", children: "Out of Stock" }) }))] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h3", { className: "text-xl font-bold text-white", children: product.name }), _jsxs("span", { className: "text-lg font-mono text-cyan-400", children: ["\u20B9", product.price.toFixed(2)] })] }), _jsx("p", { className: "text-gray-400 text-sm line-clamp-2", children: product.description })] })] }));
}
