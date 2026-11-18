import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  MapPin,
  Calendar,
  Trophy,
  Flame,
  Award,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  Lock,
  LogOut,
  Sparkles,
  TreePine
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { userService } from '../services/userService';
import { formatCarbon, formatEcoPoints, formatDate } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ProfilePage = () => {
  const { user, logout, updateLocalUser } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [profileData, setProfileData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    targetDailyEmissionKg: 5.0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const [profRes, badgeRes] = await Promise.all([
          userService.getProfile(),
          userService.getAchievements()
        ]);

        if (isMounted) {
          if (profRes.success) {
            setProfileData(profRes.profile);
            setEditForm({
              name: profRes.profile.name || '',
              bio: profRes.profile.bio || '',
              location: profRes.profile.location || '',
              targetDailyEmissionKg: profRes.profile.targetDailyEmissionKg || 5.0
            });
          }
          if (badgeRes.success) {
            setBadges(badgeRes.badges);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await userService.updateProfile(editForm);
      if (res.success) {
        showSuccess('Profile updated successfully!');
        updateLocalUser(res.user);
        setProfileData((prev) => ({ ...prev, ...res.user }));
        setIsEditModalOpen(false);
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !profileData) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  const currentUser = profileData || user;

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.name}`}
            alt={currentUser?.name}
            className="w-20 h-20 rounded-2xl bg-forest-50 border-2 border-forest-200 shadow-md p-1"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentUser?.name}
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                Lvl {currentUser?.level} • {currentUser?.levelTitle}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">{currentUser?.bio}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {currentUser?.email}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {currentUser?.location || 'Global Citizen'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Member since {formatDate(currentUser?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Eco Points</span>
          <div className="text-2xl font-black text-amber-600">{formatEcoPoints(currentUser?.ecoPoints)}</div>
          <span className="text-xs text-slate-500">Lifetime points earned</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Daily Streak</span>
          <div className="text-2xl font-black text-amber-600 flex items-center gap-1">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
            <span>{currentUser?.streak || 1} Days</span>
          </div>
          <span className="text-xs text-slate-500">Active logging streak</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Lifetime Footprint</span>
          <div className="text-2xl font-black text-forest-900">
            {formatCarbon(currentUser?.stats?.lifetimeCarbon || 0)}
          </div>
          <span className="text-xs text-slate-500">Across {currentUser?.stats?.totalActivities || 0} activities</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Daily Limit</span>
          <div className="text-2xl font-black text-emerald-700">
            {currentUser?.targetDailyEmissionKg || 5.0} kg
          </div>
          <span className="text-xs text-slate-500">Sustainable daily allowance</span>
        </div>
      </div>

      {/* Achievement Badges Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">Eco Achievement Badges</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unlock special badges by maintaining streaks, reducing emissions, and conquering challenges
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full self-start sm:self-auto">
            {badges.filter((b) => b.isUnlocked).length} of {badges.length} Unlocked
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.badgeKey}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                badge.isUnlocked
                  ? 'bg-gradient-to-br from-white to-forest-50/30 border-forest-200 shadow-sm'
                  : 'bg-slate-50/60 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                      badge.isUnlocked
                        ? 'bg-forest-800 text-emerald-300'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {badge.isUnlocked ? '🏅' : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                    +{badge.points} Pts
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{badge.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{badge.description}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold">
                {badge.isUnlocked ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked {formatDate(badge.unlockedAt)}
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Locked Milestone
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Account Profile"
        subtitle="Update your personal details and daily sustainability target"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Bio / Eco Goal
            </label>
            <textarea
              rows={2}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Location
            </label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Daily Carbon Allowance Goal (kg CO2e)
            </label>
            <input
              type="number"
              step="0.5"
              min="1.0"
              max="20.0"
              value={editForm.targetDailyEmissionKg}
              onChange={(e) => setEditForm({ ...editForm, targetDailyEmissionKg: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-forest-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-sm"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
