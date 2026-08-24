import { attachmentUrl } from '../services/api';
import { getDurationString } from './duration';

async function toBase64(url) {
  try {
    const res = await fetch(attachmentUrl(url));
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Errore conversione allegato:', error);
    return null;
  }
}

export async function downloadTicketReport(ticket) {
  if (!ticket) return;

  const photosWithBase64 = await Promise.all(
    (ticket.photos || []).map(async (photo) => ({ ...photo, url: (await toBase64(photo.url)) || photo.url }))
  );

  const reportContent = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Report ${ticket.id}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;900&display=swap');
        body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .break-inside-avoid { break-inside: avoid; }
      </style>
    </head>
    <body class="bg-white p-8 md:p-12 max-w-[210mm] mx-auto">
      <div class="flex justify-between items-start border-b-4 border-blue-600 pb-10 mb-10">
          <div>
            <h1 class="text-3xl font-black text-blue-900 tracking-tighter uppercase leading-none">International Food Pivot Srl</h1>
            <p class="text-sm text-slate-500 mt-2 uppercase tracking-[0.2em] font-bold italic">Food Safety &amp; Quality Assurance</p>
          </div>
          <div class="text-right text-[10px] text-slate-500 leading-tight border-l-2 border-slate-100 pl-6">
            <p class="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">Sede Legale:</p>
            <p>Piazza Duca D&rsquo;Aosta, 12</p>
            <p>20124 Milano &ndash; Italy</p>
          </div>
      </div>

      <div class="flex justify-between items-center mb-10">
          <h2 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Rapporto Gestione Pratica Crisi</h2>
          <div class="text-right border-2 border-slate-900 px-6 py-2 rounded-xl bg-slate-50">
            <p class="text-[10px] font-bold text-slate-400 uppercase">Protocollo</p>
            <p class="text-xl font-mono font-black text-blue-600">${ticket.id}</p>
          </div>
      </div>

      <div class="grid grid-cols-2 gap-10 mb-10">
          <div class="space-y-6">
            <div class="border-l-4 border-blue-600 pl-4">
              <p class="text-[10px] font-black text-slate-400 uppercase mb-1">Cliente</p>
              <p class="text-xl font-bold text-slate-800 leading-tight">${ticket.customerName}</p>
            </div>
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <p class="text-[10px] font-black text-slate-400 uppercase mb-1 italic">Contatto Referente</p>
              <div class="text-xs font-bold text-slate-700">
                <p>${ticket.contactFirstName} ${ticket.contactLastName}</p>
                <p class="mt-1 opacity-70">Tel: ${ticket.contactPhone || 'N/A'}</p>
                <p class="opacity-70">Email: ${ticket.contactEmail || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div class="bg-blue-900 text-white p-6 rounded-2xl space-y-4 shadow-lg print:bg-slate-800">
            <h3 class="text-[10px] font-black uppercase tracking-widest opacity-60">Analisi Lead Time</h3>
            <div class="grid grid-cols-2 gap-4 text-xs font-bold">
              <div>
                <p class="opacity-60 text-[9px] mb-1">DATA APERTURA</p>
                <p>${new Date(ticket.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p class="opacity-60 text-[9px] mb-1">STATO</p>
                <p class="uppercase">${ticket.status}</p>
              </div>
              <div class="col-span-2 pt-3 border-t border-white/10">
                 <p class="opacity-60 text-[9px] mb-1">${ticket.status === 'Risolto' ? 'DURATA RISOLUZIONE' : "TEMPO TRASCORSO DALL'APERTURA"}</p>
                 <p class="text-2xl font-black tracking-tighter">${getDurationString(ticket.createdAt, ticket.resolvedAt)}</p>
              </div>
            </div>
          </div>
      </div>

      <div class="mb-10">
          <h3 class="text-xs font-black text-slate-800 uppercase border-b-2 border-slate-200 pb-2 mb-4">Dettagli Prodotto</h3>
          <div class="grid grid-cols-4 gap-4 text-xs font-bold bg-slate-50 p-4 rounded-xl">
            <div><p class="text-slate-400 text-[9px] uppercase mb-1">Nome</p><p>${ticket.productName}</p></div>
            <div><p class="text-slate-400 text-[9px] uppercase mb-1">Cod. IFP</p><p class="font-mono">${ticket.ifpCode}</p></div>
            <div><p class="text-slate-400 text-[9px] uppercase mb-1">Lotto</p><p class="text-red-600">${ticket.batchNumber}</p></div>
            <div><p class="text-slate-400 text-[9px] uppercase mb-1">Scadenza</p><p>${ticket.expiryDate}</p></div>
          </div>
      </div>

      <div class="mb-10">
          <h3 class="text-xs font-black text-slate-800 uppercase border-b-2 border-slate-200 pb-2 mb-4">Descrizione Evento</h3>
          <p class="text-sm text-slate-700 leading-relaxed italic p-4 border border-slate-100 rounded-xl">"${ticket.subject}"</p>
      </div>

      <div class="mb-10 break-inside-avoid">
          <h3 class="text-xs font-black text-slate-800 uppercase border-b-2 border-slate-200 pb-2 mb-4">Evidenze Fotografiche (${photosWithBase64.length})</h3>
          <div class="grid grid-cols-2 gap-6">
              ${photosWithBase64.length > 0 ? photosWithBase64.map((p) => `
                <div class="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm break-inside-avoid">
                  <img src="${p.url}" alt="${p.name}" class="w-full h-48 object-cover rounded-xl" />
                  <span class="text-[10px] font-black text-slate-400 uppercase px-2 py-1 truncate">${p.name}</span>
                </div>
              `).join('') : '<p class="text-slate-400 italic text-xs py-10 bg-slate-50 rounded-2xl text-center font-bold">Nessun allegato fotografico acquisito.</p>'}
          </div>
      </div>

      <div class="mb-10 break-inside-avoid">
          <h3 class="text-xs font-black text-slate-800 uppercase border-b-2 border-slate-200 pb-2 mb-4">Registro Cronologico Follow-up</h3>
          <div class="space-y-4">
             ${(ticket.followUps || []).length > 0 ? ticket.followUps.map((fu) => `
              <div class="flex gap-6 text-[11px] border-b border-slate-100 pb-4 break-inside-avoid">
                <div class="font-black text-blue-600 shrink-0 w-32 uppercase tracking-widest">${new Date(fu.createdAt).toLocaleDateString()} ${new Date(fu.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="text-slate-700 leading-relaxed font-bold italic">"${fu.text}"</div>
              </div>
             `).join('') : '<p class="text-slate-400 italic text-xs">Nessuna nota operativa registrata.</p>'}
          </div>
      </div>

      <div class="mb-10 break-inside-avoid">
          <h3 class="text-xs font-black text-slate-800 uppercase border-b-2 border-slate-200 pb-2 mb-4">Documentazione Integrativa</h3>
          <div class="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Analisi di Laboratorio</p>
                <ul class="text-xs text-slate-700 font-bold list-disc pl-4 space-y-1">
                  ${(ticket.reports || []).length > 0 ? ticket.reports.map((r) => `<li>${r.name}</li>`).join('') : '<span class="italic font-normal text-slate-500">Nessun documento allegato</span>'}
                </ul>
              </div>
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lettera Fornitore</p>
                <ul class="text-xs text-slate-700 font-bold list-disc pl-4 space-y-1">
                  ${(ticket.supplierLetters || []).length > 0 ? ticket.supplierLetters.map((sl) => `<li>${sl.name}</li>`).join('') : '<span class="italic font-normal text-slate-500">Nessun documento allegato</span>'}
                </ul>
              </div>
          </div>
      </div>

      <div class="mt-24 flex justify-between items-end pt-10 border-t-2 border-slate-100 break-inside-avoid">
          <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <p>International Food Pivot Srl - Crisis Portal Management</p>
            <p>Generato automaticamente il: ${new Date().toLocaleString()}</p>
          </div>
          <div class="text-center w-72">
            <div class="border-b-2 border-slate-300 h-16 w-full mb-4"></div>
            <p class="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Responsabile Qualit&agrave;</p>
          </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([reportContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Report_${ticket.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
