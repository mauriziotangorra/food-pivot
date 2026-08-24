import { Plus, Package, Cloud, LogOut, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ lastSync, onNewTicket }) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-200">
            <Package size={28} />
          </div>
          <div>
            <h1 className="font-black text-2xl leading-tight text-blue-900 tracking-tighter uppercase leading-none">
              International Food Pivot
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">
              Milano Crisis Management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-200"
            title="Stato Sincronizzazione"
          >
            <Cloud size={16} className={lastSync ? 'text-green-500' : 'text-amber-500 animate-pulse'} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">
              {lastSync
                ? `Sync: ${lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'Connessione...'}
            </span>
          </div>
          <button
            onClick={onNewTicket}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95 font-black uppercase text-xs tracking-widest"
          >
            <Plus size={20} /> Nuovo Protocollo
          </button>
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-100">
            <div className="text-right">
              <p className="text-xs font-black text-slate-700 leading-none">{user?.fullName}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user?.role}</p>
            </div>
            {user?.role === 'admin' && (
              <Link
                to="/users"
                title="Gestione Utenti"
                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Users size={18} />
              </Link>
            )}
            <button
              onClick={logout}
              title="Esci"
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
