import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '@aquora/api-client';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Layers, Check, X, AlertCircle, Sparkles, Tag } from 'lucide-react';
export function AdminProductManager({ products, onRefresh }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [editingProduct, setEditingProduct] = useState(null);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);
    const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    // Form state for product
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
    // Form state for variant
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
    const handleOpenEdit = (p) => {
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
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        if (!productForm.name.trim()) {
            setError('Product name is required');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct.id, {
                    ...productForm,
                    price: Number(productForm.price),
                    volume_ml: Number(productForm.volume_ml),
                    channel_id: Number(productForm.channel_id),
                    display_order: Number(productForm.display_order),
                });
                setSuccessMsg(`Updated product "${productForm.name}" successfully!`);
                setEditingProduct(null);
            }
            else {
                await api.createProduct({
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
        }
        catch (err) {
            setError(err.message || 'Failed to save product');
        }
        finally {
            setSaving(false);
        }
    };
    const handleToggleProductAvailability = async (id, currentStatus, name) => {
        try {
            await api.toggleProductAvailability(id);
            setSuccessMsg(`Product "${name}" is now ${!currentStatus ? 'ENABLED' : 'DISABLED'}`);
            onRefresh();
            setTimeout(() => setSuccessMsg(null), 3000);
        }
        catch (err) {
            alert('Failed to toggle product status: ' + err.message);
        }
    };
    const handleArchiveProduct = async (id, name) => {
        if (!confirm(`Are you sure you want to delete/archive "${name}"? Historical orders will preserve this product record.`)) {
            return;
        }
        try {
            await api.deleteProduct(id, false);
            setSuccessMsg(`Product "${name}" safely archived. Historical records preserved.`);
            onRefresh();
            setTimeout(() => setSuccessMsg(null), 4000);
        }
        catch (err) {
            alert('Failed to delete product: ' + err.message);
        }
    };
    // Variant operations
    const handleOpenVariants = (p) => {
        setSelectedProductForVariants(p);
    };
    const handleOpenAddVariant = () => {
        if (!selectedProductForVariants)
            return;
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
    const handleSaveVariant = async (e) => {
        e.preventDefault();
        if (!selectedProductForVariants)
            return;
        setSaving(true);
        setError(null);
        try {
            if (editingVariant) {
                await api.updateVariant(selectedProductForVariants.id, editingVariant.id, {
                    ...variantForm,
                    volume_ml: Number(variantForm.volume_ml),
                    price: Number(variantForm.price),
                    available_quantity: Number(variantForm.available_quantity),
                    display_order: Number(variantForm.display_order),
                });
                setSuccessMsg(`Variant updated successfully!`);
                setEditingVariant(null);
            }
            else {
                await api.createVariant(selectedProductForVariants.id, {
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
            // Re-fetch selected product variants
            const updatedList = await api.getProducts();
            const refetched = updatedList.find((p) => p.id === selectedProductForVariants.id);
            if (refetched)
                setSelectedProductForVariants(refetched);
            setTimeout(() => setSuccessMsg(null), 4000);
        }
        catch (err) {
            setError(err.message || 'Failed to save variant');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDeleteVariant = async (variantId) => {
        if (!selectedProductForVariants)
            return;
        if (!confirm('Are you sure you want to remove this variant?'))
            return;
        try {
            await api.deleteVariant(selectedProductForVariants.id, variantId);
            setSuccessMsg('Variant removed.');
            onRefresh();
            const updatedList = await api.getProducts();
            const refetched = updatedList.find((p) => p.id === selectedProductForVariants.id);
            if (refetched)
                setSelectedProductForVariants(refetched);
            setTimeout(() => setSuccessMsg(null), 3000);
        }
        catch (err) {
            alert('Failed to delete variant: ' + err.message);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(Tag, { className: "w-6 h-6 text-cyan-400" }), "Product & Variant Catalog"] }), _jsx("p", { className: "text-sm text-slate-400 mt-1", children: "Server-authoritative pricing and dynamic catalog updates for System 1 & Public Web" })] }), _jsxs("button", { onClick: handleOpenAdd, className: "flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]", children: [_jsx(Plus, { className: "w-5 h-5" }), "Add Product"] })] }), successMsg && (_jsxs("div", { className: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-5 h-5" }), _jsx("span", { children: successMsg })] }), _jsx("button", { onClick: () => setSuccessMsg(null), className: "text-emerald-400 hover:text-emerald-300", children: _jsx(X, { className: "w-4 h-4" }) })] })), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-center justify-between", children: [_jsxs("div", { className: "relative w-full sm:w-96", children: [_jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" }), _jsx("input", { type: "text", placeholder: "Search products...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition-colors" })] }), _jsx("div", { className: "flex flex-wrap gap-2 w-full sm:w-auto", children: categories.map((cat) => (_jsx("button", { onClick: () => setSelectedCategory(cat), className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat
                                ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`, children: cat }, cat))) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredProducts.map((p) => {
                    const variantsCount = p.variants?.length || 0;
                    return (_jsxs("div", { className: `bg-slate-900/50 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:border-slate-700 ${p.is_available ? 'border-slate-800' : 'border-rose-900/30 opacity-75'}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "relative h-44 w-full bg-slate-950 overflow-hidden", children: [_jsx("img", { src: p.image_url, alt: p.name, className: "w-full h-full object-cover transition-transform duration-500 hover:scale-105" }), _jsx("div", { className: "absolute top-3 right-3 flex gap-2", children: _jsx("span", { className: `text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${p.is_available
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`, children: p.is_available ? 'Available' : 'Disabled' }) }), _jsxs("div", { className: "absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono text-cyan-300", children: ["Channel ", p.channel_id || 1] })] }), _jsxs("div", { className: "p-5 space-y-3", children: [_jsxs("div", { className: "flex justify-between items-start gap-2", children: [_jsx("h3", { className: "font-bold text-lg text-white line-clamp-1", children: p.name }), _jsxs("span", { className: "text-xl font-bold text-cyan-400 font-mono", children: ["\u20B9", p.price] })] }), _jsx("p", { className: "text-xs text-slate-400 line-clamp-2", children: p.description }), _jsxs("div", { className: "bg-slate-950/60 p-3 rounded-xl border border-slate-800/80", children: [_jsxs("div", { className: "flex justify-between items-center text-xs text-slate-400 mb-2", children: [_jsxs("span", { className: "font-semibold text-slate-300 flex items-center gap-1", children: [_jsx(Layers, { className: "w-3.5 h-3.5 text-cyan-400" }), "Variants (", variantsCount, ")"] }), _jsx("button", { onClick: () => handleOpenVariants(p), className: "text-cyan-400 hover:text-cyan-300 font-medium hover:underline text-xs", children: "Manage" })] }), p.variants && p.variants.length > 0 ? (_jsx("div", { className: "flex flex-wrap gap-1.5", children: p.variants.map((v) => (_jsxs("span", { className: "bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700", children: [v.volume_ml, "ml \u2192 \u20B9", v.price] }, v.id))) })) : (_jsxs("p", { className: "text-xs text-slate-500 italic", children: ["Base volume ", p.volume_ml || 100, "ml only"] }))] })] })] }), _jsxs("div", { className: "p-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between gap-2", children: [_jsxs("button", { onClick: () => handleToggleProductAvailability(p.id, p.is_available, p.name), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${p.is_available
                                            ? 'border-slate-700 text-slate-300 hover:border-amber-500/50 hover:text-amber-400'
                                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`, title: p.is_available ? 'Disable from sales' : 'Enable for sales', children: [p.is_available ? _jsx(EyeOff, { className: "w-3.5 h-3.5" }) : _jsx(Eye, { className: "w-3.5 h-3.5" }), p.is_available ? 'Disable' : 'Enable'] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => handleOpenEdit(p), className: "p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors", title: "Edit Product", children: _jsx(Edit2, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleArchiveProduct(p.id, p.name), className: "p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors", title: "Archive Product", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] })] }, p.id));
                }) }), (isAddProductOpen || editingProduct) && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95", children: [_jsxs("div", { className: "p-6 border-b border-slate-800 flex justify-between items-center", children: [_jsxs("h3", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-5 h-5 text-cyan-400" }), editingProduct ? 'Edit Product' : 'Add New Sanitizer Product'] }), _jsx("button", { onClick: () => {
                                        setIsAddProductOpen(false);
                                        setEditingProduct(null);
                                    }, className: "text-slate-400 hover:text-white", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSaveProduct, className: "p-6 space-y-4", children: [error && (_jsxs("div", { className: "bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Product Name *" }), _jsx("input", { type: "text", required: true, value: productForm.name, onChange: (e) => setProductForm({ ...productForm, name: e.target.value }), placeholder: "e.g. AQUORA Organic Lemon Sanitizer", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Base Price (\u20B9 INR) *" }), _jsx("input", { type: "number", min: "0", step: "0.5", required: true, value: productForm.price, onChange: (e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Assigned Channel (1 - 5) *" }), _jsx("select", { value: productForm.channel_id, onChange: (e) => setProductForm({ ...productForm, channel_id: parseInt(e.target.value) }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500", children: [1, 2, 3, 4, 5].map((ch) => (_jsxs("option", { value: ch, children: ["Channel ", ch] }, ch))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Category" }), _jsx("select", { value: productForm.category_name, onChange: (e) => setProductForm({ ...productForm, category_name: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500", children: categories.filter((c) => c !== 'ALL').map((c) => (_jsx("option", { value: c, children: c }, c))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Full Description" }), _jsx("textarea", { rows: 2, value: productForm.description, onChange: (e) => setProductForm({ ...productForm, description: e.target.value }), placeholder: "Detailed formula description...", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-slate-300 mb-1", children: "Image URL" }), _jsx("input", { type: "url", value: productForm.image_url, onChange: (e) => setProductForm({ ...productForm, image_url: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500" })] }), _jsxs("div", { className: "flex items-center gap-2 pt-2", children: [_jsx("input", { type: "checkbox", id: "avail_check", checked: productForm.is_available, onChange: (e) => setProductForm({ ...productForm, is_available: e.target.checked }), className: "w-4 h-4 text-cyan-500 rounded bg-slate-950 border-slate-700" }), _jsx("label", { htmlFor: "avail_check", className: "text-xs text-slate-300", children: "Enable product for customer ordering" })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-slate-800", children: [_jsx("button", { type: "button", onClick: () => {
                                                setIsAddProductOpen(false);
                                                setEditingProduct(null);
                                            }, className: "px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800", children: "Cancel" }), _jsx("button", { type: "submit", disabled: saving, className: "px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 disabled:opacity-50", children: saving ? 'Saving...' : 'Save Product' })] })] })] }) })), selectedProductForVariants && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95", children: [_jsxs("div", { className: "p-6 border-b border-slate-800 flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Layers, { className: "w-5 h-5 text-cyan-400" }), "Manage Volumes & Variants"] }), _jsxs("p", { className: "text-xs text-slate-400 mt-1", children: ["Product: ", _jsx("span", { className: "text-cyan-300 font-semibold", children: selectedProductForVariants.name })] })] }), _jsx("button", { onClick: () => setSelectedProductForVariants(null), className: "text-slate-400 hover:text-white", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-xs text-slate-400", children: "Define custom volumes, prices, and stock limits. Terminals query these values directly." }), _jsxs("button", { onClick: handleOpenAddVariant, className: "flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs px-3.5 py-2 rounded-xl shadow transition-all", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Variant"] })] }), _jsx("div", { className: "border border-slate-800 rounded-xl overflow-hidden", children: _jsxs("table", { className: "w-full text-left text-xs text-slate-300", children: [_jsx("thead", { className: "bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3", children: "Volume" }), _jsx("th", { className: "p-3", children: "Price" }), _jsx("th", { className: "p-3", children: "Stock Limit" }), _jsx("th", { className: "p-3", children: "Status" }), _jsx("th", { className: "p-3 text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/60", children: selectedProductForVariants.variants && selectedProductForVariants.variants.length > 0 ? (selectedProductForVariants.variants.map((v) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsxs("td", { className: "p-3 font-mono font-bold text-white", children: [v.volume_ml, " ml"] }), _jsxs("td", { className: "p-3 font-mono font-semibold text-cyan-400", children: ["\u20B9", v.price] }), _jsx("td", { className: "p-3", children: v.available_quantity ?? 'Unlimited' }), _jsx("td", { className: "p-3", children: _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-semibold ${v.is_available
                                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                                    : 'bg-rose-500/20 text-rose-400'}`, children: v.is_available ? 'Available' : 'Out of Stock' }) }), _jsxs("td", { className: "p-3 text-right space-x-2", children: [_jsx("button", { onClick: () => {
                                                                        setEditingVariant(v);
                                                                        setVariantForm({
                                                                            volume_ml: v.volume_ml,
                                                                            price: v.price,
                                                                            channel_id: v.channel_id || 1,
                                                                            available_quantity: v.available_quantity ?? 100,
                                                                            display_order: v.display_order || 1,
                                                                            is_available: v.is_available,
                                                                        });
                                                                    }, className: "text-slate-400 hover:text-cyan-400", children: _jsx(Edit2, { className: "w-3.5 h-3.5 inline" }) }), _jsx("button", { onClick: () => handleDeleteVariant(v.id), className: "text-slate-400 hover:text-rose-400", children: _jsx(Trash2, { className: "w-3.5 h-3.5 inline" }) })] })] }, v.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "p-6 text-center text-slate-500 italic", children: "No variants configured yet. Click \"Add Variant\" to create 50ml, 100ml, 250ml options." }) })) })] }) }), (isAddVariantOpen || editingVariant) && (_jsxs("form", { onSubmit: handleSaveVariant, className: "bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-4 animate-in fade-in", children: [_jsxs("h4", { className: "text-sm font-bold text-white flex items-center gap-1.5", children: [_jsx(Sparkles, { className: "w-4 h-4 text-cyan-400" }), editingVariant ? 'Edit Variant' : 'New Volume Variant'] }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] text-slate-400 mb-1", children: "Volume (ml) *" }), _jsx("input", { type: "number", required: true, value: variantForm.volume_ml, onChange: (e) => setVariantForm({ ...variantForm, volume_ml: parseInt(e.target.value) || 0 }), className: "w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] text-slate-400 mb-1", children: "Price (\u20B9) *" }), _jsx("input", { type: "number", step: "0.5", required: true, value: variantForm.price, onChange: (e) => setVariantForm({ ...variantForm, price: parseFloat(e.target.value) || 0 }), className: "w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] text-slate-400 mb-1", children: "Available Qty" }), _jsx("input", { type: "number", value: variantForm.available_quantity, onChange: (e) => setVariantForm({ ...variantForm, available_quantity: parseInt(e.target.value) || 0 }), className: "w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs" })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs("label", { className: "flex items-center gap-2 text-xs text-slate-300", children: [_jsx("input", { type: "checkbox", checked: variantForm.is_available, onChange: (e) => setVariantForm({ ...variantForm, is_available: e.target.checked }), className: "text-cyan-500 rounded bg-slate-900 border-slate-700" }), "Available for purchase"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                                                setIsAddVariantOpen(false);
                                                                setEditingVariant(null);
                                                            }, className: "px-3 py-1 text-xs text-slate-400 hover:text-white", children: "Cancel" }), _jsx("button", { type: "submit", disabled: saving, className: "px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs", children: "Save Variant" })] })] })] }))] })] }) }))] }));
}
