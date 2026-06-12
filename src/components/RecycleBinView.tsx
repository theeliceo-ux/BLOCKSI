import React, { useState } from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import { Trash2, RotateCcw, ShieldAlert, FileText, Bell, AlertTriangle } from 'lucide-react';

export const RecycleBinView: React.FC = () => {
  const {
    notes,
    reminders,
    recoverNote,
    scrubNote,
    recoverReminder,
    scrubReminder,
    triggerMockNotification
  } = useBlocksi();

  const [activeTab, setActiveTab] = useState<'notes' | 'reminders'>('notes');

  const trashedNotes = notes.filter((n) => n.status === 'trash');
  const trashedReminders = reminders.filter((r) => r.status === 'trash');

  const handleRestoreNote = (id: string, title: string) => {
    recoverNote(id);
    triggerMockNotification('♻️ Nota Restaurada', `Se recuperó "${title}" con éxito.`);
  };

  const handlePurgeNote = (id: string, title: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente la nota "${title}"? Esta acción es irreversible.`)) {
      scrubNote(id);
      triggerMockNotification('🗑️ Purga Completada', `"${title}" ha sido eliminada para siempre.`);
    }
  };

  const handleRestoreReminder = (id: string, title: string) => {
    recoverReminder(id);
    triggerMockNotification('♻️ Recordatorio Restaurado', `Se recuperó "${title}" desde la papelera.`);
  };

  const handlePurgeReminder = (id: string, title: string) => {
    if (confirm(`¿Eliminar definitivamente el recordatorio "${title}"? No se podrá recuperar.`)) {
      scrubReminder(id);
      triggerMockNotification('🗑️ Purga Completada', `Recordatorio eliminado de forma irreversible.`);
    }
  };

  // Helper empty recycle bins helpers
  const handleEmptyAllNotes = () => {
    if (trashedNotes.length === 0) return;
    if (confirm('¿Eliminar de forma definitiva TODAS las notas de la papelera?')) {
      trashedNotes.forEach((n) => scrubNote(n.id));
      triggerMockNotification('🗑️ Papelera Vacía', 'Se purgaron todas las notas de la papelera.');
    }
  };

  const handleEmptyAllReminders = () => {
    if (trashedReminders.length === 0) return;
    if (confirm('¿Deseas purgar para siempre todos los recordatorios de la papelera?')) {
      trashedReminders.forEach((r) => scrubReminder(r.id));
      triggerMockNotification('🗑️ Papelera Vacía', 'Se vaciaron los recordatorios eliminados.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Waste disposal block header bar */}
      <div className="bg-white border-2 border-black rounded-none p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <Trash2 className="text-[#FF4D00] shrink-0" size={20} />
          <div>
            <h2 className="font-serif font-black text-lg text-black uppercase tracking-tight">Papelera de Reciclaje</h2>
            <p className="text-[10px] font-mono text-black/60 uppercase font-black">Recupera elementos eliminados accidentalmente o límpialos para siempre</p>
          </div>
        </div>

        {/* Clear All button */}
        {activeTab === 'notes' && trashedNotes.length > 0 && (
          <button
            onClick={handleEmptyAllNotes}
            className="py-1.5 px-4 bg-[#FF4D00] hover:bg-black border-2 border-black text-white rounded-none text-xs font-mono font-black uppercase tracking-wide transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
          >
            Vaciar Papelera de Notas
          </button>
        )}
        {activeTab === 'reminders' && trashedReminders.length > 0 && (
          <button
            onClick={handleEmptyAllReminders}
            className="py-1.5 px-4 bg-[#FF4D00] hover:bg-black border-2 border-black text-white rounded-none text-xs font-mono font-black uppercase tracking-wide transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
          >
            Vaciar Papelera de Recordatorios
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-black space-x-2 pt-2">
        <button
          onClick={() => setActiveTab('notes')}
          className={`py-2 px-4 text-xs font-mono font-black uppercase border-t-2 border-l-2 border-r-2 border-black transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-[#FF4D00] text-white -mb-[2px] pb-[10px]'
              : 'bg-[#F9F9F7] text-black hover:bg-black/5'
          }`}
        >
          Notas Eliminadas ({trashedNotes.length})
        </button>
        
        <button
          onClick={() => setActiveTab('reminders')}
          className={`py-2 px-4 text-xs font-mono font-black uppercase border-t-2 border-l-2 border-r-2 border-black transition-all cursor-pointer ${
            activeTab === 'reminders'
              ? 'bg-[#FF4D00] text-white -mb-[2px] pb-[10px]'
              : 'bg-[#F9F9F7] text-black hover:bg-black/5'
          }`}
        >
          Avisos Eliminados ({trashedReminders.length})
        </button>
      </div>

      {/* Trashed items lists grids */}
      <div>
        {activeTab === 'notes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trashedNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white border-2 border-black rounded-none p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-black/60 text-[9px] font-mono font-black uppercase">
                    <FileText size={10} />
                    <span>Eliminada el {note.deletedAt ? new Date(note.deletedAt).toLocaleDateString() : 'fecha desconocida'}</span>
                  </div>
                  
                  <h3 className="font-serif font-black text-black text-sm md:text-base leading-tight uppercase tracking-tight">
                    {note.title}
                  </h3>
                  <p className="text-xs text-black/70 font-sans line-clamp-2 leading-relaxed">
                    {note.content.replace(/[#*`>_\-\[\]]/g, '') || 'Sin contenido...'}
                  </p>
                </div>

                {/* Restore operations and secure sweep */}
                <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between">
                  <span className="text-[10px] font-mono text-black bg-[#F9F9F7] border border-black px-2 py-0.5 rounded-none uppercase font-black">{note.category}</span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRestoreNote(note.id, note.title)}
                      className="py-1 px-3 bg-white border-2 border-black hover:bg-black hover:text-white rounded-none text-[10px] font-mono font-black uppercase flex items-center gap-1 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer"
                    >
                      <RotateCcw size={10} />
                      Recuperar
                    </button>
                    <button
                      onClick={() => handlePurgeNote(note.id, note.title)}
                      className="p-1 border border-transparent hover:border-black text-black hover:bg-red-500 hover:text-white rounded-none transition-colors cursor-pointer"
                      title="Eliminar de forma irreversible"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {trashedNotes.length === 0 && (
              <div className="md:col-span-2 py-16 text-center bg-white border-2 border-black rounded-none text-black font-mono uppercase text-sm space-y-3 p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <ShieldAlert size={24} className="mx-auto text-[#FF4D00]" />
                <p>No tienes notas borradas en tu papelera temporal.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trashedReminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-white border-2 border-black rounded-none p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all opacity-95"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-black/60 text-[9px] font-mono font-black uppercase">
                    <Bell size={10} />
                    <span>Eliminado el {rem.deletedAt ? new Date(rem.deletedAt).toLocaleDateString() : 'fecha desconocida'}</span>
                  </div>

                  <h3 className="font-serif font-black text-black text-sm leading-tight uppercase tracking-tight">
                    {rem.title}
                  </h3>
                  {rem.description && (
                    <p className="text-xs text-black/70 font-sans line-clamp-1">{rem.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between">
                  <span className="text-[10px] font-mono text-black bg-[#F9F9F7] border border-black px-2 py-0.5 rounded-none uppercase font-black">{rem.category}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRestoreReminder(rem.id, rem.title)}
                      className="py-1 px-3 bg-white border-2 border-black hover:bg-black hover:text-white rounded-none text-[10px] font-mono font-black uppercase flex items-center gap-1 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer"
                    >
                      <RotateCcw size={10} />
                      Recuperar
                    </button>
                    <button
                      onClick={() => handlePurgeReminder(rem.id, rem.title)}
                      className="p-1 border border-transparent hover:border-black text-black hover:bg-red-500 hover:text-white rounded-none transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {trashedReminders.length === 0 && (
              <div className="md:col-span-2 py-16 text-center bg-white border-2 border-black rounded-none text-black font-mono uppercase text-sm space-y-3 p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <ShieldAlert size={24} className="mx-auto text-[#FF4D00]" />
                <p>No tienes recordatorios borrados en tu papelera temporal.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
