import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Calculator,
  BarChart3,
  Lightbulb,
  Trophy,
  User,
  LogOut,
  Flame,
  Leaf,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatEcoPoints } from '../../utils/formatters';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Activity Logger', path: '/activities', icon: Sparkles, badge: 'AI' },
    { name: 'Carbon Calculator', path: '/calculator', icon: Calculator },
    { name: 'Analytics & Trends', path: '/analytics', icon: BarChart3 },
    { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
    { name: 'Eco Challenges', path: '/challenges', icon: Trophy },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-white shadow-md shadow-forest-900/10">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight text-base tracking-tight">Eco-Habit Coach</div>
              <div className="text-xs text-forest-700 font-medium tracking-wide">Green Footprint AI</div>
            </div>
          </NavLink>
        </div>

        {/* User Mini Stat Card */}
        {user && (
          <div className="p-4 mx-4 my-3 bg-gradient-to-br from-forest-50 to-emerald-50/50 rounded-2xl border border-forest-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest-800">
                Lvl {user.level || 1} • {user.levelTitle || 'Seedling'}
              </span>
              <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {user.streak || 1}d
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600 font-medium">Eco Points:</span>
              <span className="text-sm font-bold text-forest-900">{formatEcoPoints(user.ecoPoints || 50)}</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-forest-800 text-white shadow-sm shadow-forest-900/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase ${
                          isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-2 py-1.5">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt={user.name}
                className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
