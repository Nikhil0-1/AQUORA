import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { api } from '../api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Archive, 
  Eye, 
  EyeOff, 
  Layers, 
  Check, 
  X, 
  AlertCircle,
  Sparkles,
  Tag
} from 'lucide-react';

interface Props {
  products: Product[];
  onRefresh: () => void;
}

export function AdminProductManager({ products, onRefresh }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    short_description: '',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    category_name: 'Everyday',
    price: 40,
    volume_ml: 100,
    channel_id: 1,
    image_url: 'https://images.unsplash.com/photo-1584483766114-2caea62f143c?auto=format&fit=crop&w=800&q=80',
    display_order: 1,
    is_available: true,
  });

  const [variantForm, setVariantForm] = useState({
    volume_ml: 100,
    price: 50,
    channel_id: 1,
    available_quantity: 100,
    display_order: 1,
    is_available: true,
  });

  const categories = ['ALL', 'Everyday', 'Aloe Vera', 'Herbal', 'Premium', 'Family'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setProductForm({
      name: '',
      description: '',
      short_description: '',
      category_id: 'c1111111-1111-1111-1111-111111111111',
      category_name: 'Everyday',
      price: 40,
      volume_ml: 100,
      channel_id: 1,
      image_url: 'https://images.unsplash.com/photo-1584483766114-2caea62f143c?auto=format&fit=crop&w=800&q=80',
      display_order: products.length + 1,
      is_available: true,
    });
    setIsAddProductOpen(true);
    setError(null);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description,
      short_description: p.short_description || p.description.slice(0, 50),
      category_id: p.category_id || 'c1111111-1111-1111-1111-111111111111',
      category_name: p.category_name || 'Everyday',
      price: p.price,
      volume_ml: p.volume_ml || 100,
      channel_id: p.channel_id || 1,
      image_url: p.image_url,
      display_order: p.display_order || 1,
      is_available: p.is_available,
    });
    setError(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      setError('Product name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingProduct) {
        await (api as any).updateProduct(editingProduct.id, {
          ...productForm,
          price: Number(productForm.price),
          volume_ml: Number(productForm.volume_ml),
          channel_id: Number(productForm.channel_id),
          display_order: Number(productForm.display_order),
        });
        setSuccessMsg(`Updated product "${productForm.name}" successfully!`);
        setEditingProduct(null);
      } else {
        await (api as any).createProduct({
          ...productForm,
          price: Number(productForm.price),
          volume_ml: Number(productForm.volume_ml),
          channel_id: Number(productForm.channel_id),
          display_order: Number(productForm.display_order),
          ingredients: ['70% Isopropyl Alcohol', 'Purified Water'],
          nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        });
        setSuccessMsg(`Created new product "${productForm.name}" successfully!`);
        setIsAddProductOpen(false);
      }
      onRefresh();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProductAvailability = async (id: string, currentStatus: boolean, name: string) => {
    try {
      await (api as any).toggleProductAvailability(id);
      setSuccessMsg(`Product "${name}" is now ${!currentStatus ? 'ENABLED' : 'DISABLED'}`);
      onRefresh();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Failed to toggle product status: ' + err.message);
    }
  };

  const handleArchiveProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete/archive "${name}"? Historical orders will preserve this product record.`)) {
      return;
    }
    try {
      await (api as any).deleteProduct(id, false);
      setSuccessMsg(`Product "${name}" safely archived. Historical records preserved.`);
      onRefresh();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Failed to delete product: ' + err.message);
    }
  };

  const handleOpenVariants = (p: Product) => {
    setSelectedProductForVariants(p);
  };

  const handleOpenAddVariant = () => {
    if (!selectedProductForVariants) return;
    setVariantForm({
      volume_ml: 100,
      price: selectedProductForVariants.price,
      channel_id: selectedProductForVariants.channel_id || 1,
      available_quantity: 100,
      display_order: (selectedProductForVariants.variants?.length || 0) + 1,
      is_available: true,
    });
    setIsAddVariantOpen(true);
    setError(null);
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForVariants) return;
    setSaving(true);
    setError(null);
    try {
      if (editingVariant) {
        await (api as any).updateVariant(selectedProductForVariants.id, editingVariant.id, {
          ...variantForm,
          volume_ml: Number(variantForm.volume_ml),
          price: Number(variantForm.price),
          available_quantity: Number(variantForm.available_quantity),
          display_order: Number(variantForm.display_order),
        });
        setSuccessMsg(`Variant updated successfully!`);
        setEditingVariant(null);
      } else {
        await (api as any).createVariant(selectedProductForVariants.id, {
          ...variantForm,
          volume_ml: Number(variantForm.volume_ml),
          price: Number(variantForm.price),
          available_quantity: Number(variantForm.available_quantity),
          display_order: Number(variantForm.display_order),
        });
        setSuccessMsg(`New variant (${variantForm.volume_ml}ml) added!`);
        setIsAddVariantOpen(false);
      }
      onRefresh();
      const updatedList = await api.getProducts();
      const refetched = updatedList.find((p) => p.id === selectedProductForVariants.id);
      if (refetched) setSelectedProductForVariants(refetched);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save variant');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!selectedProductForVariants) return;
    if (!confirm('Are you sure you want to remove this variant?')) return;
    try {
      await (api as any).deleteVariant(selectedProductForVariants.id, variantId);
      setSuccessMsg('Variant removed.');
      onRefresh();
      const updatedList = await api.getProducts();
      const refetched = updatedList.find((p) => p.id === selectedProductForVariants.id);
      if (refetched) setSelectedProductForVariants(refetched);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Failed to delete variant: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-cyan-400" />
            Product & Variant Catalog
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Server-authoritative pricing and dynamic catalog updates for System 1 & Public Web
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => {
          const variantsCount = p.variants?.length || 0;
          return (
            <div
              key={p.id}
              className={`bg-slate-900/50 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:border-slate-700 ${
                p.is_available ? 'border-slate-800' : 'border-rose-900/30 opacity-75'
              }`}
            >
              <div>
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                        p.is_available
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {p.is_available ? 'Available' : 'Disabled'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono text-cyan-300">
                    Channel {p.channel_id || 1}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg text-white line-clamp-1">{p.name}</h3>
                    <span className="text-xl font-bold text-cyan-400 font-mono">₹{p.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-300 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        Variants ({variantsCount})
                      </span>
                      <button
                        onClick={() => handleOpenVariants(p)}
                        className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline text-xs"
                      >
                        Manage
                      </button>
                    </div>
                    {p.variants && p.variants.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {p.variants.map((v) => (
                          <span
                            key={v.id}
                            className="bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700"
                          >
                            {v.volume_ml}ml → ₹{v.price}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Base volume {p.volume_ml || 100}ml only</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleProductAvailability(p.id, p.is_available, p.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    p.is_available
                      ? 'border-slate-700 text-slate-300 hover:border-amber-500/50 hover:text-amber-400'
                      : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                  title={p.is_available ? 'Disable from sales' : 'Enable for sales'}
                >
                  {p.is_available ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {p.is_available ? 'Disable' : 'Enable'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleArchiveProduct(p.id, p.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddProductOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                {editingProduct ? 'Edit Product' : 'Add New Sanitizer Product'}
              </h3>
              <button
                onClick={() => {
                  setIsAddProductOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. AQUORA Organic Lemon Sanitizer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Base Price (₹ INR) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Channel (1 - 5) *</label>
                  <select
                    value={productForm.channel_id}
                    onChange={(e) => setProductForm({ ...productForm, channel_id: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {[1, 2, 3, 4, 5].map((ch) => (
                      <option key={ch} value={ch}>
                        Channel {ch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={productForm.category_name}
                  onChange={(e) => setProductForm({ ...productForm, category_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  {categories.filter((c) => c !== 'ALL').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="avail_check"
                  checked={productForm.is_available}
                  onChange={(e) => setProductForm({ ...productForm, is_available: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded bg-slate-950 border-slate-700"
                />
                <label htmlFor="avail_check" className="text-xs text-slate-300">
                  Enable product for customer ordering
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Variants Modal */}
      {selectedProductForVariants && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  Manage Volumes & Variants
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Product: <span className="text-cyan-300 font-semibold">{selectedProductForVariants.name}</span>
                </p>
              </div>
              <button onClick={() => setSelectedProductForVariants(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  Define custom volumes, prices, and stock limits.
                </span>
                <button
                  onClick={handleOpenAddVariant}
                  className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs px-3.5 py-2 rounded-xl shadow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Volume</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock Limit</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedProductForVariants.variants && selectedProductForVariants.variants.length > 0 ? (
                      selectedProductForVariants.variants.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-800/30">
                          <td className="p-3 font-mono font-bold text-white">{v.volume_ml} ml</td>
                          <td className="p-3 font-mono font-semibold text-cyan-400">₹{v.price}</td>
                          <td className="p-3">{v.available_quantity ?? 'Unlimited'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                v.is_available
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {v.is_available ? 'Available' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingVariant(v);
                                setVariantForm({
                                  volume_ml: v.volume_ml,
                                  price: v.price,
                                  channel_id: v.channel_id || 1,
                                  available_quantity: v.available_quantity ?? 100,
                                  display_order: v.display_order || 1,
                                  is_available: v.is_available,
                                });
                              }}
                              className="text-slate-400 hover:text-cyan-400"
                            >
                              <Edit2 className="w-3.5 h-3.5 inline" />
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(v.id)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                          No variants configured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {(isAddVariantOpen || editingVariant) && (
                <form
                  onSubmit={handleSaveVariant}
                  className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-4 animate-in fade-in"
                >
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    {editingVariant ? 'Edit Variant' : 'New Volume Variant'}
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Volume (ml) *</label>
                      <input
                        type="number"
                        required
                        value={variantForm.volume_ml}
                        onChange={(e) => setVariantForm({ ...variantForm, volume_ml: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={variantForm.price}
                        onChange={(e) => setVariantForm({ ...variantForm, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Available Qty</label>
                      <input
                        type="number"
                        value={variantForm.available_quantity}
                        onChange={(e) => setVariantForm({ ...variantForm, available_quantity: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={variantForm.is_available}
                        onChange={(e) => setVariantForm({ ...variantForm, is_available: e.target.checked })}
                        className="text-cyan-500 rounded bg-slate-900 border-slate-700"
                      />
                      Available for purchase
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddVariantOpen(false);
                          setEditingVariant(null);
                        }}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        Save Variant
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
