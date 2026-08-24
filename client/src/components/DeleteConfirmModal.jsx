import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ ticket, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setDeleting(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.response?.data?.message || "Errore durante l'eliminazione.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-slate-100">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <AlertTriangle size={32} />
        </div>
        <h3 className="font-black text-2xl text-slate-800 mb-2 tracking-tight">Elimina Protocollo</h3>
        <p className="text-sm text-slate-500 mb-6 font-medium">
          Stai per eliminare in modo irreversibile il protocollo <span className="font-black text-slate-700">{ticket.id}</span>{' '}
          ({ticket.productName}). Confermi l'operazione?
        </p>
        {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest mb-4 ml-2">{error}</p>}
        <div className="flex justify-end gap-3 mt-2">
          <button onClick={onClose} className="px-6 py-3.5 rounded-2xl text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="px-8 py-3.5 rounded-2xl bg-red-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-60"
          >
            {deleting ? 'Eliminazione...' : 'Elimina'}
          </button>
        </div>
      </div>
    </div>
  );
}
