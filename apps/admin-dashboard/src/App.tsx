import React, { useEffect, useState } from 'react';
import { api } from '@aquora/api-client';
import { Machine, Order, InventoryItem, Product } from '@aquora/shared-types';
import { 
  Droplets, 
  ShoppingCart, 
  RefreshCw, 
  Gauge, 
  Sliders, 
  TrendingUp, 
  Tag, 
  Layers, 
  ListOrdered, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import { AdminProductManager } from './components/AdminProductManager';
import { AdminChannelManager } from './components/AdminChannelManager';
import { AdminInventoryManager } from './components/AdminInventoryManager';
import { AdminDispenseJobsView } from './components/AdminDispenseJobsView';
import { AdminOrdersView } from './components/AdminOrdersView';
import { AdminTelemetryView } from './components/AdminTelemetryView';
import { AdminCalibrationManager } from './components/AdminCalibrationManager';
import { AdminAuditLogsView } from './components/AdminAuditLogsView';
import { AdminLoginView } from './components/AdminLoginView';
import { firebaseAuth, FirebaseUser } from './services/firebaseAuth';

export default function App() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    'products' | 'channels' | 'inventory' | 'jobs' | 'orders' | 'machines' | 'calibration' | 'audit' | 'analytics'
  >('products');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(firebaseAuth.getCurrentUser());
  const [calibrationChannel, setCalibrationChannel] = useState<number>(1);

  const fetchAdminData = async () => {
    try {
      const [m, o, inv, prod, st] = await Promise.all([
        api.getAdminMachines().catch(() => []),
        api.getAdminOrders().catch(() => []),
        api.getInventory().catch(() => []),
        api.getAdminProducts().catch(() => []),
        api.getAdminStats().catch(() => null),
      ]);
      setMachines(m);
      setOrders(o);
      setInventory(inv);
      setProducts(prod);
      setStats(st);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigateToCalibration = (ch: number) => {
    setCalibrationChannel(ch);
    setActiveTab('calibration');
  };

  // Admin Auth Guard: Public web has no auth, Admin requires Firebase login
  if (!currentUser) {
    return <AdminLoginView onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  const currentMachine = machines[0] || null;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Droplets className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-wider text-white">AQUORA</h1>
                <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Master Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tag className="w-4 h-4" />
              Products & Variants
            </button>

            <button
              onClick={() => setActiveTab('channels')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'channels'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              Assigned Channels
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Droplets className="w-4 h-4" />
              Estimated Inventory
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'jobs'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              Dispense Jobs
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Orders & Payments
            </button>

            <button
              onClick={() => setActiveTab('machines')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'machines'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Gauge className="w-4 h-4" />
              Hardware Telemetry
            </button>

            <button
              onClick={() => setActiveTab('calibration')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'calibration'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Flow Calibration
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Security Audit Log
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics & Trends
            </button>
          </nav>
        </div>

        {/* User / Machine Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-500 block text-[10px]">ACTIVE DISPENSER</span>
            <div className="flex justify-between items-center text-slate-300 mt-0.5">
              <span className="font-bold text-white">{currentMachine?.machine_code || 'AQ-DM-001'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 text-center">
            AQUORA IoT Platform v1.0.0
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {/* Top Navbar */}
        <header className="h-20 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block">AQUORA Master Controller</span>
            <h2 className="text-xl font-extrabold text-white capitalize">
              {activeTab === 'products'
                ? 'Product & Variant Management'
                : activeTab === 'channels'
                ? 'Assigned Channel Management'
                : activeTab === 'jobs'
                ? 'Dispense Jobs Queue'
                : activeTab === 'machines'
                ? 'Hardware Telemetry'
                : activeTab === 'calibration'
                ? 'Flow Sensor Calibration'
                : activeTab === 'audit'
                ? 'Security & Audit Log'
                : activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchAdminData}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left text-xs">
                <span className="text-white font-semibold block">{currentUser.email}</span>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={async () => {
                  await firebaseAuth.signOut();
                  setCurrentUser(null);
                }}
                className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors ml-1 text-xs font-semibold flex items-center gap-1"
                title="Sign out of Admin Panel"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Tab Contents */}
        <div className="p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500" />
            </div>
          ) : (
            <>
              {activeTab === 'products' && (
                <AdminProductManager products={products} onRefresh={fetchAdminData} />
              )}

              {activeTab === 'channels' && (
                <AdminChannelManager
                  machines={machines}
                  products={products}
                  onRefresh={fetchAdminData}
                  onNavigateToCalibration={handleNavigateToCalibration}
                />
              )}

              {activeTab === 'inventory' && (
                <AdminInventoryManager inventory={inventory} onRefresh={fetchAdminData} />
              )}

              {activeTab === 'jobs' && (
                <AdminDispenseJobsView products={products} onRefresh={fetchAdminData} />
              )}

              {activeTab === 'orders' && (
                <AdminOrdersView orders={orders} onRefresh={fetchAdminData} />
              )}

              {activeTab === 'machines' && (
                <AdminTelemetryView machine={currentMachine} onRefresh={fetchAdminData} />
              )}

              {activeTab === 'calibration' && (
                <AdminCalibrationManager
                  machine={currentMachine}
                  initialChannel={calibrationChannel}
                  onRefresh={fetchAdminData}
                />
              )}

              {activeTab === 'audit' && (
                <AdminAuditLogsView />
              )}

              {activeTab === 'analytics' && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Revenue Today</span>
                      <span className="text-3xl font-extrabold text-white font-mono">₹{stats.revenue_today || 0}</span>
                      <span className="text-xs text-emerald-400 block mt-2">↑ Authoritative captured total</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Orders Today</span>
                      <span className="text-3xl font-extrabold text-white font-mono">{stats.orders_today || 0}</span>
                      <span className="text-xs text-slate-400 block mt-2">S1 Kiosk + Web Orders</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Completed Dispenses</span>
                      <span className="text-3xl font-extrabold text-cyan-400 font-mono">{stats.dispensed_today || 0}</span>
                      <span className="text-xs text-cyan-300 block mt-2">Hardware-verified volume</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                      <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Failed Jobs</span>
                      <span className="text-3xl font-extrabold text-rose-400 font-mono">{stats.failed_today || 0}</span>
                      <span className="text-xs text-rose-300 block mt-2">Safety aborts / timeouts</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
