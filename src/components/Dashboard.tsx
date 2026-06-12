import React, { useState, useEffect } from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import {
  Clock,
  Calendar,
  Sparkles,
  FileText,
  Bell,
  Star,
  Activity,
  ArrowRight,
  Plus,
  CheckCircle2,
  Circle,
  TrendingUp,
  FileEdit
} from 'lucide-react';
import { Note, Reminder } from '../types';

export const Dashboard: React.FC = () => {
  const {
    notes,
    reminders,
    history,
    setActiveSection,
    setSelectedDate,
    setActiveNoteId,
    editReminder,
    addNote
  } = useBlocksi();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Dynamic clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute stats helper
  const activeNotes = notes.filter((n) => n.status === 'active');
  const pendingReminders = reminders.filter((r) => r.status === 'pending');
  
  const todayFormattedStr = currentTime.toISOString().split('T')[0];

  const notesCreatedToday = activeNotes.filter((n) => n.createdAt === todayFormattedStr).length;
  const remindersScheduledToday = pendingReminders.filter((r) => r.date === todayFormattedStr);
  const pendingCountStr = pendingReminders.length;

  // Let's filter latest created and latest edited
  const sortedByCreated = [...activeNotes].sort((a, b) => {
    const timeA = new Date(`${a.createdAt}T${a.createdTime}`).getTime();
    const timeB = new Date(`${b.createdAt}T${b.createdTime}`).getTime();
    return timeB - timeA;
  });

  const sortedByEdited = [...activeNotes].sort((a, b) => {
    const timeA = new Date(`${a.modifiedAt}T${a.modifiedTime}`).getTime();
    const timeB = new Date(`${b.modifiedAt}T${b.modifiedTime}`).getTime();
    return timeB - timeA;
  });

  const lastCreatedNote: Note | undefined = sortedByCreated[0];
  const lastEditedNote: Note | undefined = sortedByEdited[0];

  // Helper: compute hours since last edit
  const timeSinceLastEdit = (): string => {
    if (!lastEditedNote) return 'Sin ediciones';
    const lastEditTime = new Date(`${lastEditedNote.modifiedAt}T${lastEditedNote.modifiedTime}`);
    const now = currentTime;
    const diffMs = now.getTime() - lastEditTime.getTime();
    if (diffMs < 0) return 'Ahora mismo'; // accounts for sync margin
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours === 0) {
      if (diffMins === 0) return 'Hace un momento';
      return `Hace ${diffMins} min`;
    }
    if (diffHours < 24) {
      return `Hace ${diffHours} h`;
    }
    const days = Math.floor(diffHours / 24);
    return `Hace ${days} d`;
  };

  // Quick tasks - let's render reminders scheduled for today or those high priority
  const quickPriorities = [...pendingReminders]
    .sort((a, b) => {
      const pA = a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1;
      const pB = b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1;
      return pB - pA;
    })
    .slice(0, 4);

  const handleToggleReminder = (rem: Reminder) => {
    editReminder({
      ...rem,
      status: rem.status === 'completed' ? 'pending' : 'completed'
    });
  };

  const handleEditNote = (noteId: string) => {
    setActiveNoteId(noteId);
    setActiveSection('notes');
  };

  // Spanish localized formatting
  const formattedDay = currentTime.toLocaleDateString('es-ES', { weekday: 'long' });
  const formattedDateNum = currentTime.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTimeStr = currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Compute greeting based on hour
  const getGreeting = () => {
    const hr = currentTime.getHours();
    if (hr < 12) return 'Buenos días';
    if (hr < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };
  return (
    <div className="space-y-6">
      {/* Top Welcome Title Grid */}
      <div className="bg-[#1A1A1A] border-4 border-black rounded-none p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Date and Welcomes */}
        <div className="space-y-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF4D00] text-white text-xs font-serif font-black uppercase tracking-widest border-2 border-black">
            <Sparkles size={12} />
            {getGreeting()}, theeliceo@gmail.com
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-white uppercase tracking-tighter leading-none">
            {formattedDay}, {formattedDateNum}
          </h1>
          <p className="text-white/80 font-serif md:text-base font-medium tracking-tight mt-1">
            {remindersScheduledToday.length > 0
              ? `Tienes ${remindersScheduledToday.length} recordatorios importantes previstos para hoy.`
              : 'No tienes recordatorios pendientes agendados para este día.'}
          </p>
        </div>

        {/* Big Clock Segment */}
        <div className="flex items-center gap-3 bg-white border-4 border-black p-4 px-6 rounded-none z-10 self-start md:self-auto shadow-[4px_4px_0px_0px_#FF4D00]">
          <Clock className="text-[#FF4D00] shrink-0" size={24} />
          <div className="text-right">
            <p className="font-mono text-3xl font-black text-black tracking-widest leading-none">{formattedTimeStr}</p>
            <span className="text-[9px] font-mono font-black text-black/70 uppercase tracking-widest block text-right mt-1">Simulación Local</span>
          </div>
        </div>
      </div>

      {/* Quick stats microbento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white border-2 border-black rounded-none p-4 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_#FF4D00] transition-all">
          <div className="p-2 border-2 border-black bg-[#FF4D00] text-white">
            <FileText size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-black/60 block uppercase font-black tracking-tight">Total Notas</span>
            <span className="text-2xl font-serif font-black text-black block leading-none mt-1">{activeNotes.length}</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border-2 border-black rounded-none p-4 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_#FF4D00] transition-all">
          <div className="p-2 border-2 border-black bg-[#1A1A1A] text-white">
            <Bell size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-black/60 block uppercase font-black tracking-tight">Pendientes</span>
            <span className="text-2xl font-serif font-black text-black block leading-none mt-1">{pendingCountStr}</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border-2 border-black rounded-none p-4 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_#FF4D00] transition-all">
          <div className="p-2 border-2 border-black bg-white text-black">
            <FileEdit size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-black/60 block uppercase font-black tracking-tight">Creadas Hoy</span>
            <span className="text-2xl font-serif font-black text-black block leading-none mt-1">{notesCreatedToday}</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border-2 border-black rounded-none p-4 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_#FF4D00] transition-all">
          <div className="p-2 border-2 border-black bg-[#FF4D00] text-white">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-black/60 block uppercase font-black tracking-tight">Último Cambio</span>
            <span className="text-sm font-serif font-black text-black block leading-tight mt-1.5 uppercase">{timeSinceLastEdit()}</span>
          </div>
        </div>
      </div>

      {/* Main bento split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Recent Notes (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Last created & last edited comparative row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Last Created Card */}
            <div className="bg-white border-2 border-black rounded-none p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_#FF4D00] hover:border-black transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-black text-white uppercase bg-black px-2 py-0.5 rounded-none border border-black tracking-widest text-[9px]">
                    Última Creada
                  </span>
                  {lastCreatedNote?.favorite && <Star size={12} className="text-[#FF4D00] fill-[#FF4D00]" />}
                </div>
                {lastCreatedNote ? (
                  <>
                    <h3 className="font-serif text-lg font-black text-[#1A1A1A] group-hover:text-[#FF4D00] transition-colors line-clamp-1 uppercase mt-2">
                      {lastCreatedNote.title}
                    </h3>
                    <p className="text-sm text-black/70 line-clamp-3 mt-2 font-sans leading-relaxed">
                      {lastCreatedNote.content.replace(/[#*`>_\-\[\]]/g, '')}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-black/40 italic mt-1 font-sans">
                    No has creado ninguna nota todavía.
                  </p>
                )}
              </div>
              {lastCreatedNote && (
                <button
                  onClick={() => handleEditNote(lastCreatedNote.id)}
                  className="flex items-center gap-1.5 text-xs text-black hover:text-[#FF4D00] mt-4 font-serif font-black uppercase tracking-wider border-b-2 border-black pb-0.5 self-start transition-colors"
                >
                  Continuar escribiendo <ArrowRight size={12} />
                </button>
              )}
            </div>

            {/* Last Edited Card */}
            <div className="bg-white border-2 border-black rounded-none p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_#FF4D00] hover:border-black transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-black text-white uppercase bg-[#FF4D00] px-2 py-0.5 rounded-none border border-black tracking-widest text-[9px]">
                    Última Editada
                  </span>
                  {lastEditedNote?.favorite && <Star size={12} className="text-[#FF4D00] fill-[#FF4D00]" />}
                </div>
                {lastEditedNote ? (
                  <>
                    <h3 className="font-serif text-lg font-black text-[#1A1A1A] group-hover:text-[#FF4D00] transition-colors line-clamp-1 uppercase mt-2">
                      {lastEditedNote.title}
                    </h3>
                    <p className="text-sm text-black/70 line-clamp-3 mt-2 font-sans leading-relaxed">
                      {lastEditedNote.content.replace(/[#*`>_\-\[\]]/g, '')}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-black/40 italic mt-1 font-sans">
                    No has editado ninguna nota todavía.
                  </p>
                )}
              </div>
              {lastEditedNote && (
                <button
                  onClick={() => handleEditNote(lastEditedNote.id)}
                  className="flex items-center gap-1.5 text-xs text-black hover:text-[#FF4D00] mt-4 font-serif font-black uppercase tracking-wider border-b-2 border-black pb-0.5 self-start transition-colors"
                >
                  Ver modificaciones <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Tasks - Reminders checkboxes inside Dashboard */}
          <div className="bg-white border-2 border-black rounded-none p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-[#FF4D00]" size={18} />
                <h2 className="font-serif text-xl font-black text-black uppercase tracking-tight">Tareas y Recordatorios Rápidos</h2>
              </div>
              <button
                onClick={() => setActiveSection('reminders')}
                className="text-xs text-[#FF4D00] hover:text-black font-serif font-black uppercase tracking-wider flex items-center gap-1"
              >
                Organizar todos <ArrowRight size={12} />
              </button>
            </div>

            {quickPriorities.length > 0 ? (
              <div className="space-y-2.5">
                {quickPriorities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-none bg-[#F9F9F7] border-2 border-black hover:bg-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <button
                        onClick={() => handleToggleReminder(item)}
                        className="text-black hover:text-[#FF4D00] transition-colors shrink-0"
                      >
                        {item.status === 'completed' ? (
                          <CheckCircle2 size={18} className="text-[#FF4D00]" />
                        ) : (
                          <Circle size={18} />
                        )}
                      </button>
                      <div className="overflow-hidden">
                        <span className={`text-sm block font-serif font-bold uppercase ${
                          item.status === 'completed' ? 'line-through text-black/40 font-normal' : 'text-black'
                        }`}>
                          {item.title}
                        </span>
                        {item.description && (
                          <p className={`text-xs truncate ${
                            item.status === 'completed' ? 'text-black/30' : 'text-black/70'
                          }`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className={`text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 border ${
                        item.priority === 'high'
                          ? 'bg-[#FF4D00] text-white border-[#FF4D00]'
                          : item.priority === 'medium'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-black'
                      }`}>
                        {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                      <span className="text-xs font-mono font-bold text-black/60">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#F9F9F7] border-2 border-dashed border-black rounded-none space-y-2">
                <p className="text-xs text-black/50 italic">No hay recordatorios pendientes programados.</p>
                <button
                  onClick={() => setActiveSection('reminders')}
                  className="mx-auto py-1 px-3 bg-black hover:bg-[#FF4D00] text-white rounded-none border border-black text-2xs font-serif font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                >
                  <Plus size={10} /> Añadir Uno Nuevo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Recent Activity list (4 cols) */}
        <div className="lg:col-span-4 bg-white border-2 border-black rounded-none p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="text-[#FF4D00]" size={18} />
              <h2 className="font-serif text-xl font-black text-black uppercase tracking-tight">Actividad Reciente</h2>
            </div>
            <button
              onClick={() => setActiveSection('history')}
              className="text-xs font-serif font-black uppercase tracking-wider text-black/60 hover:text-[#FF4D00] border-b border-black/20"
            >
              Ver todo
            </button>
          </div>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-black">
            {history.slice(0, 5).map((log) => {
              // Derive color and label based on item activity type
              const getLogIconDetails = () => {
                if (log.type.startsWith('note_created')) return { bg: 'bg-[#FF4D00]', color: 'text-white' };
                if (log.type.startsWith('note_edited')) return { bg: 'bg-black', color: 'text-white' };
                if (log.type.startsWith('reminder_completed')) return { bg: 'bg-[#FF4D00]', color: 'text-white' };
                if (log.type.startsWith('reminder_created')) return { bg: 'bg-black', color: 'text-white' };
                if (log.type.startsWith('note_deleted') || log.type.startsWith('reminder_deleted')) return { bg: 'bg-white', color: 'text-black' };
                return { bg: 'bg-white', color: 'text-black' };
              };
              const style = getLogIconDetails();
              const timeFormatted = new Date(log.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={log.id} className="flex gap-3 relative">
                  <div className={`w-6 h-6 rounded-none ${style.bg} ${style.color} flex items-center justify-center shrink-0 text-xs font-black font-mono border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}>
                    •
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs text-black/80 font-sans leading-relaxed line-clamp-2">
                       {log.details}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-black/40 font-bold uppercase">
                      <span>{timeFormatted}</span>
                      {log.entityTitle && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{log.entityTitle}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {history.length === 0 && (
              <p className="text-xs text-black/50 italic p-4 text-center">No hay registros de actividad históricos todavía.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
