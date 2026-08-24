import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';

const EMPTY_FORM = { fullName: '', email: '', password: '', role: 'operator' };

export default function UsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/', { replace: true });
  }, [user, navigate]);

  const load = () => usersApi.list().then(setUsers).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await usersApi.create(form);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Errore durante la creazione dell'utente.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    await usersApi.setActive(u.id, !u.isActive);
    await load();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft size={16} /> Torna al Portale
        </button>

        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-10">Gestione Utenti</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-5 h-fit">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <UserPlus size={18} className="text-blue-600" />
              <h2 className="font-black text-sm uppercase tracking-widest text-slate-800">Nuovo Utente</h2>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome completo</label>
              <input required name="fullName" value={form.fullName} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password (min. 8 caratteri)</label>
              <input required type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ruolo</label>
              <select name="role" value={form.role} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none">
                <option value="operator">Operatore</option>
                <option value="admin">Amministratore</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest">{error}</p>}
            <button type="submit" disabled={saving} className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-60">
              {saving ? 'Creazione...' : 'Crea Utente'}
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-800">{u.fullName}</p>
                  <p className="text-xs text-slate-400 font-bold">{u.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{u.role}</span>
                </div>
                <button
                  onClick={() => toggleActive(u)}
                  disabled={u.id === user?.id}
                  title={u.isActive ? 'Disattiva' : 'Riattiva'}
                  className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all disabled:opacity-30 ${u.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                >
                  {u.isActive ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
