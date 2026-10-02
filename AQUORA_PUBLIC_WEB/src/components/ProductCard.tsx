import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { Droplet, Plus, Check } from 'lucide-react';

interface Props {
  product: Product;
  onAddToCart: (product: Product, variant: ProductVariant | undefined, volumeMl: number) => void;
}

export function ProductCard({ product, onAddToCart }: Props) {
  const variants = product.variants || [];
  const defaultVariant = variants.length > 0 ? variants[0] : undefined;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVariant);
  const [added, setAdded] = useState(false);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentVolume = selectedVariant ? selectedVariant.volume_ml : (product.volume_ml || 100);

  const handleAdd = () => {
    onAddToCart(product, selectedVariant, currentVolume);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="bg-[#0A111E] border border-[#1E2C44] rounded-3xl p-5 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 group">
      <div>
        {/* Product Image */}
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#050B14] relative mb-5 border border-[#1E2C44]/50">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 bg-[#050B14]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-cyan-300 border border-white/10 uppercase tracking-wider flex items-center gap-1">
            <Droplet className="w-3 h-3 text-cyan-400" />
            {product.category_name || 'Sanitizer'}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-lg text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Volume Selector Buttons */}
        {variants.length > 0 && (
          <div className="space-y-1.5 mb-5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Select Volume
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`py-1.5 px-1 rounded-xl text-center font-mono text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : 'bg-[#0F1A2D] text-slate-300 hover:bg-[#1E2C44] border border-[#1E2C44]'
                    }`}
                  >
                    {v.volume_ml}ml
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Price & Add to Cart */}
      <div className="pt-4 border-t border-[#1E2C44]/80 flex items-center justify-between mt-2">
        <div>
          <span className="text-[10px] text-slate-400 block font-mono">Price</span>
          <span className="text-xl font-extrabold text-white font-mono">
            ₹{currentPrice.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={!product.is_available}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            added
              ? 'bg-emerald-500 text-slate-950 scale-95'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-105'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
