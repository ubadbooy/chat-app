import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getMe, checkCustomId, setupProfile, updateProfile } from '../services/api';

export default function ProfilePanel({ onUpdated }) {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [customId, setCustomId] = useState(user?.customId || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // keep local state in sync when store updates
    setDisplayName(user?.displayName || '');
    setCustomId(user?.customId || '');
    setBio(user?.bio || '');
    setAvatar(user?.avatar || '');
  }, [user]);

  const handleCheck = async () => {
    if (!customId || customId.length < 3) return setAvailable(false);
    setChecking(true);
    try {
      const res = await checkCustomId(customId);
      setAvailable(res.available);
      setError(res.message || '');
    } catch (err) {
      setAvailable(false);
      setError(err.response?.data?.message || 'خطا در بررسی شناسه');
    } finally {
      setChecking(false);
    }
  };

  const handleSave = async () => {
    setError('');
    try {
      const payload = {
        customId: customId.toLowerCase(),
        displayName: displayName || user.username,
        bio,
        avatar
      };

      const res = user.profileCompleted ? await updateProfile(payload) : await setupProfile(payload);
      const updated = res.user || res;
      setUser(updated);
      setEditing(false);
      onUpdated && onUpdated(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ذخیره پروفایل');
    }
  };

  const resetAvatar = () => setAvatar(`https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(displayName || user.username)}`);

  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <img src={avatar || `https://ui-avatars.com/api/?background=random&name=${user.username}`} alt="avatar" className="h-14 w-14 rounded-full object-cover" />
        <div className="min-w-0">
          <div className="truncate font-black text-slate-900">{displayName || user.username}</div>
          <div className="truncate text-xs text-slate-500">{user?.customId ? `@${user.customId}` : 'No @id'}</div>
        </div>
        <div className="ml-auto">
          <button onClick={() => setEditing((v) => !v)} className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-bold">{editing ? 'لغو' : 'ویرایش'}</button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <label className="block">
            <div className="text-xs text-slate-600">Display name</div>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
          </label>

          <label className="block">
            <div className="text-xs text-slate-600">Custom ID (a-z0-9_)</div>
            <div className="flex gap-2">
              <input value={customId} onChange={(e) => setCustomId(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
              <button onClick={handleCheck} disabled={checking} className="rounded-xl bg-[#eaf7ff] px-3 py-2 text-sm font-bold">بررسی</button>
            </div>
            {available === true && <div className="mt-1 text-xs text-emerald-700">این شناسه در دسترس است</div>}
            {available === false && <div className="mt-1 text-xs text-red-600">این شناسه قابل استفاده نیست</div>}
          </label>

          <label className="block">
            <div className="text-xs text-slate-600">Bio</div>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full rounded-xl border px-3 py-2" rows={3} />
          </label>

          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="rounded-xl bg-[#2aabee] px-4 py-2 text-white font-bold">Save</button>
            <button onClick={resetAvatar} className="rounded-xl bg-slate-100 px-4 py-2 font-bold">Reset Avatar</button>
          </div>

          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>
      ) : (
        <div className="mt-3 text-sm text-slate-600">
          {user.bio || 'No bio yet. Click edit to set your profile.'}
        </div>
      )}
    </div>
  );
}
