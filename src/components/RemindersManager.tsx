import React, { useState } from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import { Reminder, PriorityLevel, RepeatType } from '../types';
import {
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  FolderOpen,
  Calendar,
  AlertTriangle,
  FileCheck,
  Zap,
  Repeat,
  FileText
} from 'lucide-react';

export const RemindersManager: React.FC = () => {
  const {
    reminders,
    categories,
    notes,
    addReminder,
    editReminder,
    removeReminder,
    postponeReminder,
    setActiveNoteId,
    setActiveSection,
    triggerMockNotification
  } = useBlocksi();

  // Create form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-06-11');
  const [time, setTime] = useState('12:00');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [category, setCategory] = useState('Personal');
  const [repeat, setRepeat] = useState<RepeatType>('once');
  const [linkedNoteId, setLinkedNoteId] = useState<string>('');

  // Filtering Tab state: 'pending' | 'completed'
  const [filterTab, setFilterTab] = useState<'pending' | 'completed'>('pending');

  const activeNotes = notes.filter((n) => n.status === 'active');
  const visibleReminders = reminders.filter((r) => {
    if (r.status === 'trash') return false;
    return filterTab === 'pending' ? r.status === 'pending' : r.status === 'completed';
  });

  // Sort visible items chronologically
  visibleReminders.sort((a, b) => {
    const valA = `${a.date}T${a.time}`;
    const valB = `${b.date}T${b.time}`;
    return valA.localeCompare(valB);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addReminder({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      priority,
      category,
      repeat,
      linkedNoteId: linkedNoteId ? linkedNoteId : undefined
    });

    triggerMockNotification(
      '🔔 Alerta Programada',
      `Recordatorio "${title}" creado para el ${date} a las ${time}.`
    );

    // Reset Form
    setTitle('');
    setDescription('');
    setDate('2026-06-11');
    setTime('12:00');
    setPriority('medium');
    setCategory(categories[0]?.name || 'Personal');
    setRepeat('once');
    setLinkedNoteId('');
    setShowForm(false);
  };

  const handleToggleStatus = (rem: Reminder) => {
    const nextStatus = rem.status === 'completed' ? 'pending' : 'completed';
    editReminder({ ...rem, status: nextStatus });
    if (nextStatus === 'completed') {
      triggerMockNotification('✅ Completado', `Has completado "${rem.title}". ¡Excelente trabajo!`);
    }
  };

  const handleDelete = (id: string) => {
    removeReminder(id);
  };

  const handleLinkClick = (noteId: string) => {
    setActiveNoteId(noteId);
    setActiveSection('notes');
  };

  const handlePostponeClick = (remId: string, mins: number) => {
    postponeReminder(remId, mins);
  };

  // Quick postpone for tomorrow
  const handlePostponeTomorrow = (rem: Reminder) => {
    const baseDate = new Date();
    const tomorrow = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const updated: Reminder = {
      ...rem,
      date: tomorrowStr,
    };
    editReminder(updated);
    triggerMockNotification('⏰ Pospuesto para Mañana', `"${rem.title}" movido al ${tomorrowStr}.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Reminders section header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl text-black uppercase tracking-tight">Recordatorios y Alertas</h1>
          <p className="text-xs text-black/60">
            Organiza tus avisos, vincula notas relacionadas y pospone tareas según sea necesario.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="py-2.5 px-4 bg-[#FF4D00] hover:bg-black text-white border-2 border-black rounded-none text-xs font-serif font-black uppercase tracking-wider flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus size={16} />
          {showForm ? 'Cerrar Registro' : 'Añadir Recordatorio'}
        </button>
      </div>

      {/* Add reminder expandable drawer form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-black rounded-none p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-serif font-black text-base text-black border-b-2 border-black pb-2 uppercase tracking-tight">
            Nuevo Recordatorio en BLOCKSI
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-black text-black uppercase tracking-wider">Título</label>
              <input
                type="text"
                placeholder="Ej. Comprar medicamentos, preparar examen..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-4 py-2 text-sm text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/35 font-serif font-bold uppercase"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-black text-black uppercase tracking-wider">Descripción corta (opcional)</label>
              <input
                type="text"
                placeholder="Ej. Revisar farmacia de descuento, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-4 py-2 text-sm text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/35 font-serif font-bold uppercase"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-black text-black uppercase tracking-wider flex items-center gap-1">
                <Calendar size={11} /> Fecha programada
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-4 py-2 text-sm text-black focus:outline-none font-sans font-bold"
                required
              />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-black text-black uppercase tracking-wider flex items-center gap-1">
                <Clock size={11} /> Hora programada
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-4 py-2 text-sm text-black focus:outline-none font-sans font-bold"
                required
              />
            </div>

            {/* Priority Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-black text-black uppercase tracking-wider">Prioridad de Alerta</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-4 py-2 text-sm text-black focus:outline-none font-mono font-black uppercase cursor-pointer"
              >
                <option value="high">Alta Prioridad</option>
                <option value="medium">Media Prioridad</option>
                <option value="low">Baja Prioridad</option>
              </select>
            </div>

            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-black text-black uppercase tracking-wider">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-4 py-2 text-sm text-black focus:outline-none font-mono font-black uppercase cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Repetitive rules */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-black text-black uppercase tracking-wider flex items-center gap-1">
                <Repeat size={11} /> Regla de repetición
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RepeatType)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-4 py-2 text-sm text-black focus:outline-none font-mono font-black uppercase cursor-pointer"
              >
                <option value="once">Una sola vez (Sin repetición)</option>
                <option value="daily">Diariamente (Todos los días)</option>
                <option value="weekly">Semanalmente (Mismo día)</option>
                <option value="monthly">Mensualmente</option>
                <option value="yearly">Anualmente</option>
              </select>
            </div>

            {/* Note Linking Option */}
            <div className="space-y-1 font-serif">
              <label className="text-[10px] font-mono font-black text-black uppercase tracking-wider flex items-center gap-1">
                <FileText size={11} /> Vincular Nota Relacionada
              </label>
              <select
                value={linkedNoteId}
                onChange={(e) => setLinkedNoteId(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-4 py-2 text-sm text-black focus:outline-none font-mono font-black uppercase cursor-pointer"
              >
                <option value="">-- No vincular nota --</option>
                {activeNotes.map((note) => (
                  <option key={note.id} value={note.id}>
                    {note.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="py-2 px-4 bg-white hover:bg-[#F9F9F7] text-black border border-black rounded-none text-xs font-mono font-black uppercase cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-[#FF4D00] hover:bg-black text-white border border-black rounded-none text-xs font-serif font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              Crear Alerta
            </button>
          </div>
        </form>
      )}

      {/* Pending / Completed selector tabs */}
      <div className="flex border-b-2 border-black bg-white">
        <button
          onClick={() => setFilterTab('pending')}
          className={`py-2.5 px-4 text-xs font-mono font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            filterTab === 'pending'
              ? 'border-[#FF4D00] text-[#FF4D00]'
              : 'border-transparent text-black/55 hover:text-black bg-white'
          }`}
        >
          Pendientes ({reminders.filter((r) => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilterTab('completed')}
          className={`py-2.5 px-4 text-xs font-mono font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            filterTab === 'completed'
              ? 'border-[#FF4D00] text-[#FF4D00]'
              : 'border-transparent text-black/55 hover:text-black bg-white'
          }`}
        >
          Historial Completados ({reminders.filter((r) => r.status === 'completed').length})
        </button>
      </div>

      {/* Listed items display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleReminders.map((rem) => {
          const linkedNote = rem.linkedNoteId ? notes.find((n) => n.id === rem.linkedNoteId) : null;
          
          return (
            <div
              key={rem.id}
              className={`bg-white border-2 border-black rounded-none p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_#FF4D00] hover:border-black transition-all ${
                rem.status === 'completed' ? 'opacity-70 bg-[#F9F9F7]' : ''
              }`}
            >
              <div className="space-y-3">
                {/* Micro heading bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase tracking-wider">
                    <span className="bg-black text-white border border-black px-1.5 py-0.5 rounded-none">
                      {rem.category}
                    </span>
                    {rem.repeat !== 'once' && (
                      <span className="bg-white text-black border border-black px-1.5 py-0.5 rounded-none flex items-center gap-0.5">
                        <Repeat size={9} />
                        {rem.repeat === 'daily' ? 'Diario' : rem.repeat === 'weekly' ? 'Semanal' : rem.repeat === 'monthly' ? 'Mensual' : 'Anual'}
                      </span>
                    )}
                  </div>

                  <span className={`text-[8px] font-mono uppercase font-black py-0.5 px-2 rounded-none border border-black ${
                    rem.priority === 'high'
                      ? 'bg-rose-500 text-white'
                      : rem.priority === 'medium'
                      ? 'bg-amber-400 text-black'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {rem.priority === 'high' ? 'Alta' : rem.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>

                {/* Info titles description */}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleStatus(rem)}
                    className="text-black hover:text-[#FF4D00] mt-0.5 shrink-0 cursor-pointer"
                  >
                    {rem.status === 'completed' ? (
                      <CheckCircle2 size={18} className="text-[#FF4D00]" />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>
                  <div className="overflow-hidden">
                    <h3 className={`font-serif font-black text-sm md:text-base leading-tight uppercase tracking-tight ${
                      rem.status === 'completed' ? 'line-through text-black/40 font-bold' : 'text-black hover:text-[#FF4D00]'
                    }`}>
                      {rem.title}
                    </h3>
                    {rem.description && (
                      <p className={`text-xs mt-1 leading-relaxed font-sans ${
                        rem.status === 'completed' ? 'text-black/50' : 'text-black/75'
                      }`}>
                        {rem.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Linked note connection badge */}
                {linkedNote && (
                  <div className="pt-1.5">
                    <button
                      onClick={() => handleLinkClick(linkedNote.id)}
                      className="px-2.5 py-1 bg-[#F9F9F7] hover:bg-black hover:text-white border border-black text-black text-[9px] font-mono font-black uppercase rounded-none flex items-center gap-1.5 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer"
                      title="Abrir la nota vinculada relacionada"
                    >
                      <FileText size={10} className="text-black/60 shrink-0" />
                      Nota: <span className="underline">{linkedNote.title}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Day footer controls: Date, Time and Shift postpone triggers */}
              <div className="mt-4 pt-3 border-t-2 border-black/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] text-black/60 font-mono font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-0.5">
                    <Calendar size={10} />
                    {rem.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock size={10} />
                    {rem.time}
                  </span>
                </div>

                {/* Control Action pill options */}
                <div className="flex items-center gap-1.5">
                  {rem.status === 'pending' && (
                    <div className="relative group/postpone">
                      <button className="py-1 px-2.5 bg-white hover:bg-[#FF4D00] hover:text-white border-2 border-black text-black text-3xs font-mono font-black uppercase rounded-none flex items-center gap-1 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer">
                        <Zap size={10} />
                        Posponer
                      </button>

                      {/* Dropdown list of delays */}
                      <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover/postpone:block bg-white border-2 border-black rounded-none p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-36 z-30">
                        <button
                          onClick={() => handlePostponeClick(rem.id, 10)}
                          className="w-full text-left px-3 py-1.5 text-[9px] font-mono font-black uppercase hover:bg-black hover:text-white rounded-none mb-0.5"
                        >
                          10 Minutos
                        </button>
                        <button
                          onClick={() => handlePostponeClick(rem.id, 60)}
                          className="w-full text-left px-3 py-1.5 text-[9px] font-mono font-black uppercase hover:bg-black hover:text-white rounded-none mb-0.5"
                        >
                          1 Hora
                        </button>
                        <button
                          onClick={() => handlePostponeTomorrow(rem)}
                          className="w-full text-left px-3 py-1.5 text-[9px] font-mono font-black uppercase hover:bg-black hover:text-white rounded-none"
                        >
                          Mañana
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Move to Recycle Bin option */}
                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-1 px-1.5 border border-black rounded-none text-black bg-white hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    title="Mover a papelera"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {visibleReminders.length === 0 && (
          <div className="md:col-span-2 py-16 text-center bg-white border-2 border-black rounded-none space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Bell size={24} className="mx-auto text-black" />
            <p className="text-black/60 italic text-sm font-sans">
              {filterTab === 'pending'
                ? 'No tienes recordatorios pendientes que mostrar.'
                : 'No tienes recordatorios completados en tu historial todavía.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
