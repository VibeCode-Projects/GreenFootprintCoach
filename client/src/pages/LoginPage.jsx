import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showSuccess(`Welcome back, ${res.user.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      setFormError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('test@ecocoach.com');
    setPassword('password123');
    setFormError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Your Dashboard</h2>
        <p className="text-xs text-slate-500 mt-1">
          Continue your journey to daily carbon neutrality
        </p>
      </div>

      {formError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Demo Credentials Pill */}
      <div className="p-3 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-between text-xs">
        <div className="text-forest-900">
          <span className="font-bold block">Academic Demo Account:</span>
          <span className="text-[11px] text-forest-700">test@ecocoach.com • password123</span>
        </div>
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="px-2.5 py-1 rounded-lg bg-forest-800 hover:bg-forest-900 text-white font-bold text-[11px] transition-colors"
        >
          Auto-Fill
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-forest-600 focus:bg-white focus:ring-2 focus:ring-forest-600/10 transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-forest-700 hover:text-forest-900"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-forest-600 focus:bg-white focus:ring-2 focus:ring-forest-600/10 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-forest-900/10 transition-all active:scale-95 disabled:pointer-events-none mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 text-emerald-300" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-forest-800 hover:text-forest-900">
          Create an Account (+50 Pts)
        </Link>
      </div>
    </div>
  );
};
