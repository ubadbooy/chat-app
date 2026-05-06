import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await login({ email, password });
      setAuth(data.user, data.token);
      
      // Redirect to profile setup if not completed
      if (!data.user.profileCompleted) {
        navigate('/profile-setup');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ورود');
    }
  };

  return (
    <main className="auth-shell relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-slate-950 p-4 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(42,171,238,0.38),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.28),transparent_30%)]" />
      <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-950/40 ring-1 ring-white/10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#2aabee] via-[#168acd] to-slate-950 p-10 text-white lg:flex">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-4xl ring-1 ring-white/20">✈</div>
            <h1 className="mt-8 max-w-sm text-5xl font-black leading-tight tracking-tight">Chat anywhere, beautifully.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-sky-50">
              A clean messenger experience designed for quick conversations on laptop and phone.
            </p>
          </div>

          <div className="space-y-3">
            {['Responsive conversation layout', 'Fast private messaging', 'Simple and distraction-free'].map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-3xl bg-white/10 p-4 backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#168acd]">✓</span>
                <span className="font-semibold">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-[#2aabee] to-[#168acd] text-4xl text-white shadow-xl shadow-sky-200 lg:hidden">
            ✈
          </div>

          <div className="mt-6 lg:mt-0">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#168acd]">Welcome Back</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Sign in to your chat
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Continue your conversations from any screen.
            </p>
          </div>

          {error && <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-[#2aabee] focus:bg-white focus:ring-4 focus:ring-sky-100"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-[#2aabee] focus:bg-white focus:ring-4 focus:ring-sky-100"
                required
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#2aabee] p-4 font-black text-white shadow-xl shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-[#1e9edc]"
            >
              Sign in
            </button>
          </form>

          <button 
            onClick={() => navigate('/register')} 
            className="mt-6 w-full text-sm font-bold text-[#168acd] hover:underline"
          >
            New here? Create an account
          </button>
        </div>
      </section>
    </main>
  );
}
