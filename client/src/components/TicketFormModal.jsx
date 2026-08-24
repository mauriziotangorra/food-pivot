import { useState, useEffect } from 'react';
import { X, User, Package, History } from 'lucide-react';

const EMPTY_FORM = {
  customerName: '',
  contactFirstName: '',
  contactLastName: '',
  contactPhone: '',
  contactEmail: '',
  productName: '',
  ifpCode: '',
  eanCode: '',
  expiryDate: '',
  batchNumber: '',
  subject: '',
  status: 'Aperto',
};

export default function TicketFormModal({ ticket, onClose, onSubmit }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(ticket ? { ...EMPTY_FORM, ...ticket } : EMPTY_FORM);
  }, [ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il salvataggio.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl relative z-10 flex flex-col max-h-[95vh] overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
              {ticket ? 'Modifica Protocollo' : 'Nuova Crisi Alimentare'}
            </h2>
            <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mt-3 italic">
              Safety Division - Data Entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 rounded-3xl text-slate-400 hover:text-red-500 hover:rotate-90 transition-all shadow-sm"
          >
            <X size={32} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-10 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <User size={18} className="text-blue-600" />
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Cliente e Referente</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ragione Sociale</label>
                <input required name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Referente</label>
                <input required name="contactFirstName" value={formData.contactFirstName} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cognome Referente</label>
                <input required name="contactLastName" value={formData.contactLastName} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefono</label>
                <input required name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                <input required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] font-bold outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <Package size={18} className="text-blue-600" />
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Dati Tecnici Prodotto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prodotto</label>
                <input required name="productName" value={formData.productName} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cod. IFP</label>
                <input required name="ifpCode" value={formData.ifpCode} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lotto</label>
                <input required name="batchNumber" value={formData.batchNumber} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EAN</label>
                <input required name="eanCode" value={formData.eanCode} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scadenza</label>
                <input required type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] font-bold outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <History size={18} className="text-blue-600" />
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Status Pratica</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stato Attuale</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] font-bold outline-none">
                  <option value="Aperto">Aperto</option>
                  <option value="In Corso">In Corso</option>
                  <option value="Risolto">Risolto</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Oggetto Segnalazione</label>
              <textarea required name="subject" value={formData.subject} onChange={handleChange} rows="4" className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-medium outline-none focus:ring-4 focus:ring-blue-500/10"></textarea>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest">{error}</p>}

          <div className="flex justify-end gap-5 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-10 py-4 border-2 border-slate-100 rounded-2xl text-slate-400 font-black uppercase text-xs tracking-widest">
              Annulla
            </button>
            <button type="submit" disabled={saving} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-600/30 uppercase text-xs tracking-widest active:scale-95 transition-all disabled:opacity-60">
              {saving ? 'Salvataggio...' : 'Salva Protocollo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
