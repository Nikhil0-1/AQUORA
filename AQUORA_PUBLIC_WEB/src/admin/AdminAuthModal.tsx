import React, { useState, useEffect } from 'react';
import { firebaseAuth, FirebaseUser } from './firebaseAuth';
import { ShieldCheck, LogIn, LogOut, Key, User, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  onAuthChange: (user: FirebaseUser | null) => void;
}

export function AdminAuthModal({ onAuthChange }: Props) {
  const [user, setUser] = useState<FirebaseUser | null>(firebaseAuth.getCurrentUser());
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = firebaseAuth.isConfigured();

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((u) => {
      setUser(u);
      onAuthChange(u);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loggedIn = await firebaseAuth.signIn(email, password);
      setUser(loggedIn);
      onAuthChange(loggedIn);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await firebaseAuth.signOut();
    setUser(null);
    onAuthChange(null);
  };

  return (
    <div>
      {/* Auth Status Widget in Top Nav / Header */}
      {user ? (
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-left text-xs">
            <span className="text-white font-semibold block">{user.email}</span>
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
              {user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors ml-1"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
        >
          <LogIn className="w-4 h-4" />
          Admin Login
        </button>
      )}

      {/* Login Modal */}
      {isOpen && !user && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Firebase Admin Login</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            {/* Status indicator */}
            {!isConfigured ? (
              <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-3 rounded-xl text-xs leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-200">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Firebase Configuration Setup
                </div>
                <div>
                  Firebase Web API credentials are not yet configured in <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300">.env</code>.
                  Enter any admin email (e.g. <code>admin@aquora.com</code>) below to sign in via development role mapping.
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Connected to Firebase Authentication</span>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aquora.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
