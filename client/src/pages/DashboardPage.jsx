import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketsApi } from '../services/api';
import { downloadTicketReport } from '../utils/downloadReport';
import Navbar from '../components/Navbar';
import StatsBar from '../components/StatsBar';
import SearchFilterBar from '../components/SearchFilterBar';
import TicketCard from '../components/TicketCard';
import TicketFormModal from '../components/TicketFormModal';
import TicketDetailModal from '../components/TicketDetailModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ProtocolTypeModal from '../components/ProtocolTypeModal';

const POLL_INTERVAL_MS = 15000;

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tutti');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [recordType, setRecordType] = useState('non_conformity');
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await ticketsApi.list({ search: searchTerm, status: filterStatus, recordType });
      setTickets(data);
      setLastSync(new Date());
    } catch (error) {
      console.error('Errore nel recupero dei ticket:', error);
    }
  }, [searchTerm, filterStatus, recordType]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (!viewingTicket) return;
    ticketsApi.get(viewingTicket.id).then(setViewingTicket).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingTicket?.id]);

  const handleCreateOrUpdate = async (formData) => {
    let savedTicket;
    if (editingTicket) {
      savedTicket = await ticketsApi.update(editingTicket.id, formData);
    } else {
      savedTicket = await ticketsApi.create(formData);
    }
    setTickets((currentTickets) => {
      if (editingTicket) {
        return currentTickets.map((ticket) => (ticket.id === savedTicket.id ? savedTicket : ticket));
      }
      return [savedTicket, ...currentTickets];
    });
    setIsFormOpen(false);
    setEditingTicket(null);
    await refresh();
  };

  const handleDelete = async () => {
    await ticketsApi.remove(ticketToDelete.id);
    setTicketToDelete(null);
    if (viewingTicket?.id === ticketToDelete.id) setViewingTicket(null);
    await refresh();
  };

  const handleDownloadReport = async (ticketOrSummary) => {
    try {
      const full = ticketOrSummary.followUps ? ticketOrSummary : await ticketsApi.get(ticketOrSummary.id);
      await downloadTicketReport(full);
    } catch (error) {
      console.error('Errore generazione report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar lastSync={lastSync} onNewTicket={() => setIsTypePickerOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex gap-2 mb-8 p-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm">
          <button onClick={() => setRecordType('non_conformity')} className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${recordType === 'non_conformity' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}>Non-conformità</button>
          <button onClick={() => setRecordType('complaint')} className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${recordType === 'complaint' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}>Reclami</button>
        </div>
        <StatsBar tickets={tickets} />

        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              canDelete={user?.role === 'admin'}
              onView={() => setViewingTicket(ticket)}
              onEdit={() => { setEditingTicket(ticket); setIsFormOpen(true); }}
              onDelete={() => setTicketToDelete(ticket)}
              onDownloadReport={() => handleDownloadReport(ticket)}
            />
          ))}
          {tickets.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-300 font-black uppercase tracking-widest text-sm">
              Nessun protocollo trovato
            </div>
          )}
        </div>
      </main>

      {isFormOpen && (
        <TicketFormModal
          ticket={editingTicket}
            recordType={editingTicket?.recordType || recordType}
          onClose={() => { setIsFormOpen(false); setEditingTicket(null); }}
          onSubmit={handleCreateOrUpdate}
        />
      )}

      {isTypePickerOpen && (
        <ProtocolTypeModal
          onClose={() => setIsTypePickerOpen(false)}
          onSelect={(type) => { setRecordType(type); setEditingTicket(null); setIsTypePickerOpen(false); setIsFormOpen(true); }}
        />
      )}

      {viewingTicket && (
        <TicketDetailModal
          ticket={viewingTicket}
          onClose={() => setViewingTicket(null)}
          onUpdated={setViewingTicket}
          onDownloadReport={handleDownloadReport}
        />
      )}

      {ticketToDelete && (
        <DeleteConfirmModal
          ticket={ticketToDelete}
          onClose={() => setTicketToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
