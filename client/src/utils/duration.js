export function getDurationString(createdAt, resolvedAt) {
  const start = new Date(createdAt);
  const end = resolvedAt ? new Date(resolvedAt) : new Date();
  const diffInMs = end - start;

  const mins = Math.floor(diffInMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}g ${hours % 24}o`;
  if (hours > 0) return `${hours}o ${mins % 60}m`;
  return `${mins} min`;
}

export function calculateAverageResolutionTime(tickets) {
  const resolvedTickets = tickets.filter((t) => t.status === 'Risolto' && t.resolvedAt);
  if (resolvedTickets.length === 0) return 'N/D';
  const totalMs = resolvedTickets.reduce(
    (acc, t) => acc + (new Date(t.resolvedAt) - new Date(t.createdAt)),
    0
  );
  const avgMs = totalMs / resolvedTickets.length;
  const avgHours = Math.floor(avgMs / (1000 * 60 * 60));
  return avgHours > 24 ? `${Math.floor(avgHours / 24)} giorni` : `${avgHours} ore`;
}

export function formatFollowUpDate(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}
