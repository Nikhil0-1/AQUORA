import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@aquora/api-client';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Plus, Droplets } from 'lucide-react';
export function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();
    useEffect(() => {
        const fetchProduct = async () => {
            if (!id)
                return;
            try {
                const data = await api.getProductById(id);
                setProduct(data);
            }
            catch (error) {
                console.error('Failed to fetch product', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen pt-24 pb-12 flex items-center justify-center bg-black", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" }) }));
    }
    if (!product) {
        return (_jsxs("div", { className: "min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-black text-white", children: [_jsx("h1", { className: "text-3xl font-bold mb-4", children: "Product Not Found" }), _jsx("button", { onClick: () => navigate('/'), className: "text-cyan-500 hover:underline", children: "Return Home" })] }));
    }
    return (_jsx("div", { className: "min-h-screen pt-24 pb-12 bg-black", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("button", { onClick: () => navigate('/'), className: "flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors", children: [_jsx(ArrowLeft, { className: "w-5 h-5" }), _jsx("span", { children: "Back to Menu" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", children: [_jsx("div", { className: "aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 relative", children: product.image_url ? (_jsx("img", { src: product.image_url, alt: product.name, className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center text-gray-600", children: "No Image" })) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2 text-cyan-500 mb-4", children: [_jsx(Droplets, { className: "w-5 h-5" }), _jsx("span", { className: "text-sm font-bold tracking-wider uppercase", children: "Signature Blend" })] }), _jsx("h1", { className: "text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight", children: product.name }), _jsxs("p", { className: "text-2xl font-mono text-cyan-400 mb-8", children: ["\u20B9", product.price.toFixed(2)] }), _jsx("p", { className: "text-xl text-gray-400 mb-8 leading-relaxed", children: product.description }), _jsxs("div", { className: "space-y-6 mb-12 p-6 bg-white/5 rounded-2xl border border-white/10", children: [_jsx("h3", { className: "font-bold text-white text-lg", children: "Nutritional Info" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-black/50 p-4 rounded-xl", children: [_jsx("span", { className: "block text-gray-500 text-sm mb-1", children: "Calories" }), _jsx("span", { className: "text-white font-mono text-xl", children: product.nutrition.calories })] }), _jsxs("div", { className: "bg-black/50 p-4 rounded-xl", children: [_jsx("span", { className: "block text-gray-500 text-sm mb-1", children: "Sugar" }), _jsxs("span", { className: "text-white font-mono text-xl", children: [product.nutrition.sugar_g, "g"] })] }), _jsxs("div", { className: "bg-black/50 p-4 rounded-xl", children: [_jsx("span", { className: "block text-gray-500 text-sm mb-1", children: "Protein" }), _jsxs("span", { className: "text-white font-mono text-xl", children: [product.nutrition.protein_g, "g"] })] }), _jsxs("div", { className: "bg-black/50 p-4 rounded-xl", children: [_jsx("span", { className: "block text-gray-500 text-sm mb-1", children: "Fat" }), _jsxs("span", { className: "text-white font-mono text-xl", children: [product.nutrition.fat_g, "g"] })] })] })] }), _jsxs("button", { onClick: () => addItem(product, 250, 1), disabled: !product.is_available, className: "w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20", children: [_jsx(Plus, { className: "w-6 h-6" }), _jsx("span", { children: product.is_available ? 'Add to Cart' : 'Out of Stock' })] })] })] })] }) }));
}
