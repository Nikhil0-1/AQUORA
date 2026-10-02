import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, Droplet } from 'lucide-react';

interface Props {
  products: Product[];
  onAddToCart: (product: Product, variant: ProductVariant | undefined, volumeMl: number) => void;
}

export function ProductsPage({ products, onAddToCart }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category_name || 'Sanitizer')))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || (p.category_name || 'Sanitizer') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
          Formula Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Our Hand Sanitizer Formulations
        </h1>
        <p className="text-xs text-slate-400 mt-2 max-w-xl">
          Hospital-standard disinfection blended with skin-loving natural extracts. Choose your volume and collect touchlessly.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-6 border-b border-[#1E2C44]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search formulas or ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A111E] border border-[#1E2C44] text-white pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-[#0A111E] text-slate-400 hover:text-white border border-[#1E2C44]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#0A111E] border border-[#1E2C44] rounded-3xl space-y-3">
          <Droplet className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No formulas match your search</h3>
          <p className="text-xs text-slate-500">Try clearing your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}
