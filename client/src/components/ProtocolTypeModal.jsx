import { X, AlertTriangle, MessageSquare } from 'lucide-react';

export default function ProtocolTypeModal({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 md:p-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Nuovo Protocollo</p>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-2">Che cosa vuoi registrare?</h2>
          </div>
          <button onClick={onClose} title="Chiudi" className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500">
            <X size={22} />
          </button>
        </div>
        <div className="grid gap-4">
          <button onClick={() => onSelect('non_conformity')} className="flex items-center gap-5 text-left p-6 rounded-3xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <span className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center"><AlertTriangle size={27} /></span>
            <span><strong className="block text-lg font-black text-slate-800">Non-conformità</strong><span className="text-sm text-slate-500">Registra e gestisci una non-conformità.</span></span>
          </button>
          <button onClick={() => onSelect('complaint')} className="flex items-center gap-5 text-left p-6 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
            <span className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><MessageSquare size={27} /></span>
            <span><strong className="block text-lg font-black text-slate-800">Reclamo</strong><span className="text-sm text-slate-500">Registra e gestisci un reclamo cliente.</span></span>
          </button>
        </div>
      </div>
    </div>
  );
}
