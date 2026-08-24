import { useRef, useState } from 'react';
import {
  X, Camera, FileText, Mail, MessageSquare, Trash2, FileIcon, FileDown,
  DownloadCloud, ImageIcon, Contact, Phone, Timer, AlertTriangle,
} from 'lucide-react';
import { getDurationString, formatFollowUpDate } from '../utils/duration';
import { ticketsApi, attachmentUrl } from '../services/api';

const STATUS_COLORS = {
  Aperto: 'bg-red-100 text-red-700 border-red-200',
  'In Corso': 'bg-amber-100 text-amber-700 border-amber-200',
  Risolto: 'bg-green-100 text-green-700 border-green-200',
};

export default function TicketDetailModal({ ticket, onClose, onUpdated, onDownloadReport }) {
  const photoInputRef = useRef(null);
  const reportInputRef = useRef(null);
  const supplierLetterInputRef = useRef(null);
  const [followUpText, setFollowUpText] = useState('');
  const [fileError, setFileError] = useState('');
  const [busy, setBusy] = useState(false);

  const statusColor = STATUS_COLORS[ticket.status] || 'bg-slate-100 text-slate-700 border-slate-200';

  const handleAddFollowUp = async () => {
    if (!followUpText.trim()) return;
    setBusy(true);
    try {
      const updated = await ticketsApi.addFollowUp(ticket.id, followUpText.trim());
      onUpdated(updated);
      setFollowUpText('');
    } catch {
      setFileError("Errore durante l'aggiunta della nota.");
    } finally {
      setBusy(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    e.target.value = null;
    if (!file) return;
    setFileError('');
    setBusy(true);
    try {
      const updated = await ticketsApi.uploadAttachment(ticket.id, type, file);
      onUpdated(updated);
    } catch (err) {
      setFileError(err.response?.data?.message || "Errore durante il caricamento dell'allegato.");
    } finally {
      setBusy(false);
    }
  };

  const removeAttachment = async (attachmentId) => {
    setBusy(true);
    try {
      const updated = await ticketsApi.removeAttachment(ticket.id, attachmentId);
      onUpdated(updated);
    } catch {
      setFileError("Errore durante la rimozione dell'allegato.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
      <div className="bg-white w-full max-w-7xl h-[92vh] rounded-[4rem] shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden border border-white/10">
        <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} />
        <input type="file" ref={reportInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'report')} />
        <input type="file" ref={supplierLetterInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'supplier_letter')} />

        {/* Sidebar */}
        <div className="w-full md:w-[32%] bg-slate-50 border-r border-slate-200 p-12 overflow-y-auto">
          <div className="mb-10 text-center md:text-left">
            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black border uppercase tracking-[0.2em] ${statusColor}`}>{ticket.status}</span>
            <h2 className="text-4xl font-black mt-6 text-blue-900 tracking-tighter leading-none">{ticket.productName}</h2>
            <p className="text-slate-400 font-black text-sm mt-3 uppercase tracking-widest">{ticket.id}</p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-900 text-white p-8 rounded-[2.5rem] shadow-xl">
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4">Monitoraggio Tempi</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] opacity-40 uppercase mb-1">Apertura Pratica</p>
                  <p className="text-sm font-bold">
                    {new Date(ticket.createdAt).toLocaleDateString()} alle{' '}
                    {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[9px] opacity-40 uppercase mb-1">{ticket.status === 'Risolto' ? 'Tempo di Chiusura' : 'Tempo Attivo'}</p>
                  <div className="flex items-center gap-3">
                    <Timer size={24} className="text-blue-400" />
                    <span className="text-2xl font-black tracking-tighter">{getDurationString(ticket.createdAt, ticket.resolvedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Referente Cliente</p>
              <div className="space-y-3">
                <p className="text-lg font-black text-slate-800 leading-tight">{ticket.customerName}</p>
                <div className="pt-2 space-y-1 text-sm font-bold text-slate-600">
                  <p className="flex items-center gap-2"><Contact size={14} className="text-blue-500" /> {ticket.contactFirstName} {ticket.contactLastName}</p>
                  <p className="flex items-center gap-2"><Phone size={14} className="text-blue-500" /> {ticket.contactPhone || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-6 tracking-[0.3em]">Documentazione</p>
              <button onClick={() => onDownloadReport(ticket)} className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black transition-all hover:bg-blue-500 active:scale-95 shadow-xl shadow-blue-500/20">
                <DownloadCloud size={24} /> SCARICA REPORT FILE
              </button>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Strumenti di Compressione</p>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                  Limite massimo: <strong className="text-white">10-15 MB</strong> per file. Se il tuo file è troppo grande, usa questi strumenti gratuiti:
                </p>
                <a href="https://squoosh.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  <ImageIcon size={14} /> Comprimi Foto (Squoosh)
                </a>
                <a href="https://www.ilovepdf.com/it" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
                  <FileIcon size={14} /> Comprimi PDF (iLovePDF)
                </a>
              </div>
            </div>

            {fileError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-xs font-bold flex items-start gap-3 mt-4">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p>{fileError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <h3 className="font-black text-slate-400 uppercase text-[11px] tracking-[0.4em] italic leading-none">Safety &amp; Crisis Control Unit</h3>
            <button onClick={onClose} className="w-14 h-14 flex items-center justify-center bg-slate-50 rounded-3xl text-slate-300 hover:text-red-500 transition-all active:scale-90">
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-xl text-slate-800 flex items-center gap-3 tracking-tighter"><Camera size={24} className="text-blue-500" /> Foto Evidence</h4>
                  <button disabled={busy} onClick={() => photoInputRef.current.click()} className="bg-blue-50 text-blue-600 font-black text-[10px] px-5 py-2.5 rounded-2xl border border-blue-100 uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-60">Aggiungi</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {(ticket.photos || []).map((img) => (
                    <div key={img.id} className="group relative aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm transition-transform hover:scale-105">
                      <img src={attachmentUrl(img.url)} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all backdrop-blur-md cursor-pointer" onClick={() => removeAttachment(img.id)}>
                        <Trash2 size={32} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-xl text-slate-800 flex items-center gap-3 tracking-tighter"><FileText size={24} className="text-purple-500" /> Analisi Laboratorio</h4>
                    <button disabled={busy} onClick={() => reportInputRef.current.click()} className="bg-purple-50 text-purple-600 font-black text-[10px] px-5 py-2.5 rounded-2xl border border-purple-100 uppercase tracking-widest hover:bg-purple-100 transition-all disabled:opacity-60">Carica</button>
                  </div>
                  <div className="space-y-3">
                    {(ticket.reports || []).map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:bg-white hover:border-purple-200 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <FileIcon size={24} className="text-purple-400" />
                          <span className="text-sm font-black text-slate-700 truncate max-w-[150px]">{r.name}</span>
                        </div>
                        <div className="flex gap-3">
                          <a href={attachmentUrl(r.url)} download={r.name} className="w-10 h-10 flex items-center justify-center bg-white text-blue-600 rounded-xl border border-slate-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100/50"><FileDown size={18} /></a>
                          <button onClick={() => removeAttachment(r.id)} className="w-10 h-10 flex items-center justify-center bg-white text-slate-300 rounded-xl border border-slate-100 hover:text-red-500 transition-all shadow-sm"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-xl text-slate-800 flex items-center gap-3 tracking-tighter"><Mail size={24} className="text-emerald-500" /> Lettera Fornitore</h4>
                    <button disabled={busy} onClick={() => supplierLetterInputRef.current.click()} className="bg-emerald-50 text-emerald-600 font-black text-[10px] px-5 py-2.5 rounded-2xl border border-emerald-100 uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-60">Carica</button>
                  </div>
                  <div className="space-y-3">
                    {(ticket.supplierLetters || []).map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:bg-white hover:border-emerald-200 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <FileIcon size={24} className="text-emerald-400" />
                          <span className="text-sm font-black text-slate-700 truncate max-w-[150px]">{r.name}</span>
                        </div>
                        <div className="flex gap-3">
                          <a href={attachmentUrl(r.url)} download={r.name} className="w-10 h-10 flex items-center justify-center bg-white text-blue-600 rounded-xl border border-slate-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100/50"><FileDown size={18} /></a>
                          <button onClick={() => removeAttachment(r.id)} className="w-10 h-10 flex items-center justify-center bg-white text-slate-300 rounded-xl border border-slate-100 hover:text-red-500 transition-all shadow-sm"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="font-black text-xl text-slate-800 flex items-center gap-3 tracking-tighter"><MessageSquare size={24} className="text-amber-500" /> Registro Interventi</h4>
              <div className="space-y-5">
                {(ticket.followUps || []).map((fu) => (
                  <div key={fu.id} className="flex gap-6">
                    <div className="w-3 h-3 rounded-full bg-amber-400 mt-2 shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.5)] border-2 border-white"></div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] flex-1 border border-slate-100 shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2 font-mono">
                        <Timer size={12} /> {formatFollowUpDate(fu.createdAt)} — {fu.userName}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-bold italic tracking-tight">"{fu.text}"</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-100 shadow-2xl flex gap-4 ring-8 ring-slate-50/50">
                <input
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  placeholder="Annota qui ogni aggiornamento tecnico o logistico..."
                  className="flex-1 bg-transparent border-none text-base font-bold focus:ring-0 outline-none text-slate-700 placeholder:text-slate-300"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFollowUp(); } }}
                />
                <button disabled={busy} onClick={handleAddFollowUp} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all hover:bg-blue-700 disabled:opacity-60">
                  Pubblica Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
