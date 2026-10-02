import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Product } from '@aquora/shared-types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 100, 1);
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-cyan-500/50 transition-all duration-300 block"
    >
      <div className="aspect-square bg-white/5 relative overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
        
        {product.is_available && (
          <button 
            onClick={handleAdd}
            className="absolute bottom-4 right-4 bg-cyan-500 text-white p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-cyan-600 shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold tracking-widest uppercase text-sm border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white">{product.name}</h3>
          <span className="text-lg font-mono text-cyan-400">₹{product.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
      </div>
    </Link>
  );
}
