import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [customId, setCustomId] = useState('');
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    if (user?.profileCompleted) {
      navigate('/chat');
    }
  }, [user, navigate]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!customId || customId.length < 3) {
        setAvailability(null);
        return;
      }

      setChecking(true);
      try {
        const response = await api.get(`/profile/check-id/${customId}`);
        setAvailability(response.data);
      } catch (err) {
        setAvailability({ available: false, message: 'خطا در بررسی' });
      } finally {
        setChecking(false);
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [customId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!customId || customId.length < 3) {
      setError('شناسه باید حداقل ۳ کاراکتر باشد');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(customId)) {
      setError('فقط حروف انگلیسی کوچک، اعداد و _ مجاز است');
      return;
    }

    try {
      const response = await api.post('/profile/setup', {
        customId,
        displayName,
        bio
      });
      setUser(response.data.user);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ایجاد پروفایل');
    }
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(42,171,238,0.38),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.28),transparent_30%)]" />
      <div className="absolute right-1/2 top-10 h-72 w-72 translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />

      <section className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10 sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-[#2aabee] to-[#168acd] text-4xl text-white shadow-xl shadow-sky-200">
          👤
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#168acd]">Profile Setup</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Create Your ID
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Choose a unique ID so others can find and message you easily.
          </p>
        </div>

        {error && <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Custom ID <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">@</span>
              <input
                type="text"
                placeholder="your_unique_id"
                value={customId}
                onChange={(e) => setCustomId(e.target.value.toLowerCase())}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 pl-10 outline-none transition focus:border-[#2aabee] focus:bg-white focus:ring-4 focus:ring-sky-100"
                required
                pattern="[a-z0-9_]{3,30}"
                minLength={3}
                maxLength={30}
              />
            </div>
            {checking && (
              <p className="mt-2 text-xs text-slate-500">در حال بررسی...</p>
            )}
            {availability && !checking && (
              <p className={`mt-2 text-xs font-medium ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
                {availability.available ? '✓ ' : '✗ '}{availability.message}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              فقط حروف انگلیسی کوچک، اعداد و _ (۳-۳۰ کاراکتر)
            </p>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Display Name</span>
            <input
              type="text"
              placeholder="نام نمایشی شما"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-[#2aabee] focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Bio</span>
            <textarea
              placeholder="چند کلمه درباره خودتان..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-[#2aabee] focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
            <p className="mt-1 text-xs text-slate-400">{bio.length}/200</p>
          </label>

          <button
            type="submit"
            disabled={!availability?.available || checking}
            className="w-full rounded-2xl bg-[#2aabee] p-4 font-black text-white shadow-xl shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-[#1e9edc] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            Complete Setup
          </button>
        </form>
      </section>
    </main>
  );
}
