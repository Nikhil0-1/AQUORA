import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@aquora/api-client';
import { Product } from '@aquora/shared-types';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Plus, Droplets } from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await api.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <button onClick={() => navigate('/')} className="text-cyan-500 hover:underline">Return Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black">
      <div className="container mx-auto px-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Menu</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 relative">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
            )}
          </div>
          
          {/* Details */}
          <div>
            <div className="flex items-center space-x-2 text-cyan-500 mb-4">
              <Droplets className="w-5 h-5" />
              <span className="text-sm font-bold tracking-wider uppercase">Signature Blend</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">{product.name}</h1>
            <p className="text-2xl font-mono text-cyan-400 mb-8">₹{product.price.toFixed(2)}</p>
            
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              {product.description}
            </p>
            
            <div className="space-y-6 mb-12 p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="font-bold text-white text-lg">Nutritional Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 p-4 rounded-xl">
                  <span className="block text-gray-500 text-sm mb-1">Calories</span>
                  <span className="text-white font-mono text-xl">{product.nutrition.calories}</span>
                </div>
                <div className="bg-black/50 p-4 rounded-xl">
                  <span className="block text-gray-500 text-sm mb-1">Sugar</span>
                  <span className="text-white font-mono text-xl">{product.nutrition.sugar_g}g</span>
                </div>
                <div className="bg-black/50 p-4 rounded-xl">
                  <span className="block text-gray-500 text-sm mb-1">Protein</span>
                  <span className="text-white font-mono text-xl">{product.nutrition.protein_g}g</span>
                </div>
                <div className="bg-black/50 p-4 rounded-xl">
                  <span className="block text-gray-500 text-sm mb-1">Fat</span>
                  <span className="text-white font-mono text-xl">{product.nutrition.fat_g}g</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => addItem(product, 250, 1)}
              disabled={!product.is_available}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-6 h-6" />
              <span>{product.is_available ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
