import { Search, Filter } from 'lucide-react';

export default function SearchFilterBar({ searchTerm, onSearchChange, filterStatus, onFilterChange }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
      <div className="relative flex-1 w-full group">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
          size={22}
        />
        <input
          type="text"
          placeholder="Cerca cliente, prodotto o protocollo..."
          className="w-full pl-14 pr-6 py-4.5 rounded-[1.5rem] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white shadow-sm font-bold"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <Filter size={20} className="ml-3 text-slate-400" />
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-transparent border-none rounded-xl px-4 py-2 focus:outline-none text-sm font-black text-slate-700 min-w-[150px] uppercase tracking-wider cursor-pointer"
        >
          <option>Tutti</option>
          <option>Aperto</option>
          <option>In Corso</option>
          <option>Risolto</option>
        </select>
      </div>
    </div>
  );
}
