import { Timer } from 'lucide-react';
import { calculateAverageResolutionTime } from '../utils/duration';

const STAT_STYLES = {
  blue: { border: 'border-l-blue-500', text: 'text-blue-600' },
  red: { border: 'border-l-red-500', text: 'text-red-600' },
  amber: { border: 'border-l-amber-500', text: 'text-amber-600' },
  green: { border: 'border-l-green-500', text: 'text-green-600' },
};

export default function StatsBar({ tickets }) {
  const stats = [
    { label: 'Totali', val: tickets.length, color: 'blue' },
    { label: 'Aperti', val: tickets.filter((t) => t.status === 'Aperto').length, color: 'red' },
    { label: 'In Corso', val: tickets.filter((t) => t.status === 'In Corso').length, color: 'amber' },
    { label: 'Risolti', val: tickets.filter((t) => t.status === 'Risolto').length, color: 'green' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm border-l-4 ${STAT_STYLES[s.color].border} transition-transform hover:-translate-y-1`}
        >
          <div className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest">{s.label}</div>
          <div className={`text-3xl font-black tracking-tighter ${STAT_STYLES[s.color].text}`}>{s.val}</div>
        </div>
      ))}
      <div className="bg-blue-900 p-6 rounded-[2rem] text-white shadow-xl flex flex-col justify-center">
        <div className="text-blue-300 text-[9px] font-black uppercase mb-1 tracking-widest flex items-center gap-2">
          <Timer size={12} /> Lead Time Medio
        </div>
        <div className="text-2xl font-black leading-none">{calculateAverageResolutionTime(tickets)}</div>
      </div>
    </div>
  );
}
