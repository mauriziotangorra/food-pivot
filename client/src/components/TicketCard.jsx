import { Camera, FileText, Trash2, Edit3, FileBadge, ChevronRight, User, Clock } from 'lucide-react';
import { getDurationString } from '../utils/duration';

const STATUS_COLORS = {
  Aperto: 'bg-red-100 text-red-700 border-red-200',
  'In Corso': 'bg-amber-100 text-amber-700 border-amber-200',
  Risolto: 'bg-green-100 text-green-700 border-green-200',
};

export default function TicketCard({ ticket, canDelete, onView, onEdit, onDelete, onDownloadReport }) {
  const statusColor = STATUS_COLORS[ticket.status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col border-b-[8px] border-b-slate-100">
      <div className="p-8 border-b border-slate-50">
        <div className="flex justify-between items-start mb-5">
          <span className="px-4 py-1.5 bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl">
            {ticket.id}
          </span>
          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest ${statusColor}`}>
            {ticket.status}
          </span>
        </div>
        <h3 className="font-black text-2xl text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors mb-4 tracking-tighter leading-tight">
          {ticket.productName}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold italic">
            <User size={16} /> <span className="truncate max-w-[120px]">{ticket.customerName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl font-black text-[10px]">
            <Clock size={12} /> {getDurationString(ticket.createdAt, ticket.resolvedAt)}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex-1 bg-slate-50/50">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-black mb-1 uppercase text-[9px] tracking-widest">Lotto</p>
            <p className="font-black text-slate-800">{ticket.batchNumber}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-black mb-1 uppercase text-[9px] tracking-widest">Apertura</p>
            <p className="font-black text-slate-800 text-xs">{new Date(ticket.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-slate-50 flex justify-between items-center px-8">
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${ticket.photoCount > 0 ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}
            title="Vedi Foto"
          >
            <Camera size={20} />
          </button>
          <button
            onClick={onView}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${ticket.reportCount > 0 ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}
            title="Vedi Documenti"
          >
            <FileText size={20} />
          </button>
        </div>
        <div className="flex gap-2">
          {canDelete && (
            <button
              onClick={onDelete}
              className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
              title="Elimina"
            >
              <Trash2 size={24} />
            </button>
          )}
          <button
            onClick={onEdit}
            className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-90"
            title="Modifica"
          >
            <Edit3 size={24} />
          </button>
          <button
            onClick={onDownloadReport}
            className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-90"
            title="Scarica File Report"
          >
            <FileBadge size={24} />
          </button>
          <button
            onClick={onView}
            className="px-6 py-3 bg-slate-900 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center gap-2"
          >
            Gestisci <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
