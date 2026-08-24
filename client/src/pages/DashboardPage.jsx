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

  const refresh = useCallback(async () => {
    try {
      const data = await ticketsApi.list({ search: searchTerm, status: filterStatus });
      setTickets(data);
      setLastSync(new Date());
    } catch (error) {
      console.error('Errore nel recupero dei ticket:', error);
    }
  }, [searchTerm, filterStatus]);

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
    if (editingTicket) {
      await ticketsApi.update(editingTicket.id, formData);
    } else {
      await ticketsApi.create(formData);
    }
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
      <Navbar lastSync={lastSync} onNewTicket={() => { setEditingTicket(null); setIsFormOpen(true); }} />

      <main className="max-w-7xl mx-auto px-4 py-10">
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
          onClose={() => { setIsFormOpen(false); setEditingTicket(null); }}
          onSubmit={handleCreateOrUpdate}
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
