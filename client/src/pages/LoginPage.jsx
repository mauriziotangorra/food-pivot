import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Accesso non riuscito. Riprova.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl shadow-blue-200 mb-6">
            <Package size={36} />
          </div>
          <h1 className="font-black text-2xl text-blue-900 tracking-tighter uppercase text-center leading-none">
            International Food Pivot
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">
            Milano Crisis Management
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6"
        >
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Accesso Safety Team</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">Inserisci le tue credenziali per continuare</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                placeholder="nome@internationalfoodpivot.it"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-black uppercase tracking-widest ml-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all"
          >
            {submitting ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
