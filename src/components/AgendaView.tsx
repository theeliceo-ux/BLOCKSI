import React from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import { Reminder } from '../types';
import {
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Bell,
  ArrowRight,
  Sparkles,
  Search,
  Plus
} from 'lucide-react';

export const AgendaView: React.FC = () => {
  const {
    notes,
    reminders,
    selectedDate,
    setSelectedDate,
    setActiveSection,
    setActiveNoteId,
    editReminder
  } = useBlocksi();

  // Helper slider day builders
  const getSliderDates = () => {
    const list = [];
    const baseDate = new Date(selectedDate + 'T12:00:00'); // mitigate UTC timezone roll

    // Generate dates from 3 days ago to 3 days ahead
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      const isoStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
      const dayNum = d.getDate();

      list.push({
        isoStr,
        dayName,
        dayNum,
      });
    }
    return list;
  };

  const sliderDates = getSliderDates();

  // 1. Unified items matching selected date
  const selectedDateNotes = notes.filter(
    (n) => n.status === 'active' && (n.createdAt === selectedDate || n.modifiedAt === selectedDate)
  );
  
  const selectedDateReminders = reminders.filter(
    (r) => r.status !== 'trash' && r.date === selectedDate
  );

  // Compile elements into a unified timeline sorted chronologically by HH:MM
  interface TimelineItem {
    id: string;
    type: 'note' | 'reminder';
    time: string;
    title: string;
    subtitle?: string;
    color?: string;
    original: any;
  }

  const timelineItems: TimelineItem[] = [];

  selectedDateNotes.forEach((note) => {
    timelineItems.push({
      id: note.id,
      type: 'note',
      time: note.modifiedTime || '09:00',
      title: note.title,
      subtitle: `Categoría: ${note.category}`,
      color: note.color || '#6366f1',
      original: note,
    });
  });

  selectedDateReminders.forEach((rem) => {
    timelineItems.push({
      id: rem.id,
      type: 'reminder',
      time: rem.time || '12:00',
      title: rem.title,
      subtitle: `Prioridad: ${rem.priority} • ${rem.repeat === 'once' ? 'Una vez' : 'Repetitivo'}`,
      color: rem.priority === 'high' ? '#f43f5e' : rem.priority === 'medium' ? '#f59e0b' : '#10b981',
      original: rem,
    });
  });

  // Sort chronologically
  timelineItems.sort((a, b) => a.time.localeCompare(b.time));

  // Compute future events - occurring strictly after selected date within next 7 days
  const futureReminders = reminders.filter((r) => {
    if (r.status === 'trash') return false;
    const itemTime = new Date(r.date + 'T23:59:59').getTime();
    const selectTime = new Date(selectedDate + 'T00:00:00').getTime();
    const limitTime = selectTime + 7 * 24 * 60 * 60 * 1000;
    return itemTime > selectTime && itemTime <= limitTime;
  });

  // Sort future items by date, then time
  futureReminders.sort((a, b) => {
    const valA = `${a.date}T${a.time}`;
    const valB = `${b.date}T${b.time}`;
    return valA.localeCompare(valB);
  });

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

  const formatHeaderLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return dObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Date Carousel slider slider */}
      <div className="bg-white border-2 border-black rounded-none p-4 flex flex-col items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="text-[10px] font-mono text-black/60 uppercase font-black tracking-widest">Navegar Agenda Diaria</span>
        <div className="flex gap-2 items-center w-full justify-between max-w-md">
          {sliderDates.map((item) => {
            const isSelected = item.isoStr === selectedDate;
            return (
              <button
                key={item.isoStr}
                onClick={() => setSelectedDate(item.isoStr)}
                className={`py-2 px-3 rounded-none flex flex-col items-center gap-0.5 text-center transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-[#FF4D00] border-black text-white font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-102'
                    : 'bg-white border-black text-black hover:bg-black/5'
                }`}
              >
                <span className="text-[9px] font-mono capitalize font-bold">{item.dayName}</span>
                <span className="text-sm font-serif font-black uppercase">{item.dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main split: Daily Timeline Vs Upcoming panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left consolidated day timeline */}
        <div className="lg:col-span-7 bg-white border-2 border-black rounded-none p-5 md:p-6 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-black shrink-0" size={20} />
              <h2 className="font-serif font-black text-sm md:text-base text-black uppercase tracking-tight truncate max-w-[210px] sm:max-w-none">
                {formatHeaderLabel(selectedDate)}
              </h2>
            </div>
            
            <button
               onClick={() => {
                 setActiveSection('reminders');
               }}
               className="text-black hover:text-[#FF4D00] text-[10px] font-mono font-black uppercase flex items-center gap-1 border border-black bg-[#F9F9F7] px-2 py-1 select-none cursor-pointer hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus size={10} /> Agenda
            </button>
          </div>

          {timelineItems.length > 0 ? (
            <div className="relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-1 before:bg-black pl-8 space-y-5">
              {timelineItems.map((item) => {
                const isNote = item.type === 'note';
                
                return (
                  <div key={item.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-2 border-black p-3 rounded-none hover:bg-[#F9F9F7] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    
                    {/* Ring Indicator */}
                    <div className="absolute -left-[30px] top-[18px] w-3.5 h-3.5 rounded-none bg-white flex items-center justify-center border-2 border-black" />

                    <div className="overflow-hidden space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isNote ? (
                          <span className="text-[9px] font-mono uppercase bg-black text-white px-1.5 py-0.5 border border-black rounded-none font-black">
                            Apunte
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono uppercase bg-[#FF4D00] text-black px-1.5 py-0.5 border border-black rounded-none font-black">
                            Aviso
                          </span>
                        )}
                        <span className="text-xs text-black/60 flex items-center gap-1 font-mono font-bold uppercase">
                          <Clock size={10} />
                          {item.time}
                        </span>
                      </div>

                      <h3 className="font-serif font-black text-black text-sm md:text-base leading-tight uppercase tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-[10px] font-mono uppercase font-black text-black/50 leading-none">{item.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto pt-1 sm:pt-0">
                      {isNote ? (
                        <button
                          onClick={() => handleEditNote(item.id)}
                          className="py-1.5 px-3 text-[10px] font-mono font-black uppercase bg-white border-2 border-black hover:bg-black hover:text-white rounded-none flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                        >
                          Ver nota <ArrowRight size={10} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleReminder(item.original)}
                          className={`py-1.5 px-3 text-[10px] font-mono font-black uppercase border-2 border-black rounded-none flex items-center gap-1.5 cursor-pointer transition-all ${
                            item.original.status === 'completed'
                              ? 'bg-emerald-400 text-black shadow-none'
                              : 'bg-[#FF4D00] text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none'
                          }`}
                        >
                          {item.original.status === 'completed' ? 'Completado' : 'Marcar Listo'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-black font-mono uppercase text-xs space-y-3 p-8 border border-dashed border-black">
              <Sparkles size={24} className="mx-auto text-[#FF4D00]" />
              <p className="font-black">Tu agenda está despejada para este día.</p>
              <p className="text-[10px] text-black/50 leading-normal">¡Momento perfecto para capturar una nueva idea o apuntar tus notas!</p>
            </div>
          )}
        </div>

        {/* Right upcoming indicators panel (5 columns on desktops) */}
        <div className="lg:col-span-5 bg-white border-2 border-black rounded-none p-5 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black pb-3">
            <span className="text-[10px] font-mono text-black/60 uppercase font-black tracking-wider block">Planificación Semanal</span>
            <h3 className="font-serif font-black text-black text-base uppercase tracking-tight">Próximos Recordatorios</h3>
          </div>

          {futureReminders.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {futureReminders.map((rem) => {
                const parts = rem.date.split('-');
                const shortDate = `${parts[2]}/${parts[1]}`;
                
                return (
                  <div
                    key={rem.id}
                    className="p-3 bg-white border-2 border-black rounded-none hover:bg-[#F9F9F7] transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <div className="px-2 py-1 bg-[#F9F9F7] border border-black rounded-none text-center font-mono shrink-0">
                        <span className="text-[8px] text-black/50 block uppercase font-bold leading-none">Fecha</span>
                        <span className="text-[11px] font-black text-black leading-none pt-0.5 block">{shortDate}</span>
                      </div>
                      
                      <div className="overflow-hidden">
                        <p className="text-xs text-black block font-serif font-black truncate uppercase leading-tight">{rem.title}</p>
                        <span className="text-[10px] text-black/55 block font-mono font-bold uppercase">{rem.time} • {rem.category}</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono py-0.5 px-2 rounded-none border border-black shrink-0 leading-tight block select-none uppercase font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                      rem.priority === 'high'
                        ? 'bg-red-500 text-white'
                        : rem.priority === 'medium'
                        ? 'bg-amber-400 text-black'
                        : 'bg-emerald-400 text-black'
                    }`}>
                      {rem.priority === 'high' ? 'Alta' : rem.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 bg-[#F9F9F7] border-2 border-dashed border-black rounded-none text-center text-black/50 font-mono uppercase text-[10px] font-bold p-4">
              No tienes actividades programadas para la siguiente semana.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
