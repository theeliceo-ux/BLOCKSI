import React, { useState } from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import { HistoryEvent, HistoryEventType } from '../types';
import {
  History,
  Trash2,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Settings,
  SlidersHorizontal,
  FolderSync
} from 'lucide-react';

export const HistoryTimeline: React.FC = () => {
  const { history, clearAllData } = useBlocksi();
  
  const [filterType, setFilterType] = useState<string>('all');

  const MONTHS_MAP = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Helper: group history logs by year and month
  const getGroupedTimeline = () => {
    const list = history.filter((item) => {
      if (filterType === 'all') return true;
      if (filterType === 'notes') return item.type.startsWith('note_');
      if (filterType === 'reminders') return item.type.startsWith('reminder_');
      if (filterType === 'system') return !item.type.startsWith('note_') && !item.type.startsWith('reminder_');
      return true;
    });

    interface MonthGroup {
      monthName: string;
      events: HistoryEvent[];
    }
    interface YearGroup {
      yearName: string;
      months: MonthGroup[];
    }

    const groups: YearGroup[] = [];

    list.forEach((event) => {
      const d = new Date(event.timestamp);
      if (isNaN(d.getTime())) return;

      const yearName = `${d.getFullYear()}`;
      const monthName = MONTHS_MAP[d.getMonth()];

      // 1. Find or create Year
      let yGroup = groups.find((y) => y.yearName === yearName);
      if (!yGroup) {
        yGroup = { yearName, months: [] };
        groups.push(yGroup);
      }

      // 2. Find or create Month
      let mGroup = yGroup.months.find((m) => m.monthName === monthName);
      if (!mGroup) {
        mGroup = { monthName, events: [] };
        yGroup.months.push(mGroup);
      }

      mGroup.events.push(event);
    });

    return groups;
  };

  const groupedTimeline = getGroupedTimeline();

  const getLogSymbol = (type: HistoryEventType) => {
    switch (type) {
      case 'note_created': return { text: '[NUEVA]', style: 'bg-[#FF4D00] text-white border-black font-black' };
      case 'note_edited': return { text: '[EDITO]', style: 'bg-black text-white border-black font-black' };
      case 'note_deleted': return { text: '[BORRO]', style: 'bg-red-500 text-white border-black font-black' };
      case 'note_restored': return { text: '[RESTO]', style: 'bg-green-600 text-white border-black font-black' };
      
      case 'reminder_created': return { text: '[AVISO]', style: 'bg-[#FF4D00]/20 text-black border-black font-black' };
      case 'reminder_completed': return { text: '[LISTO]', style: 'bg-green-600 text-white border-black font-black' };
      case 'reminder_postponed': return { text: '[POSPO]', style: 'bg-amber-400 text-black border-black font-black' };
      case 'reminder_deleted': return { text: '[BORRO]', style: 'bg-red-500 text-white border-black font-black' };
      
      case 'settings_updated': return { text: '[AJUS]', style: 'bg-[#F9F9F7] text-black border-black font-black' };
      case 'db_imported': return { text: '[SYNC]', style: 'bg-black text-white border-black font-black' };
      default: return { text: '[SIST]', style: 'bg-[#F9F9F7] text-black/60 border-black font-black' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header control filtering area */}
      <div className="bg-white border-2 border-black rounded-none p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <History className="text-[#FF4D00] shrink-0" size={20} />
          <div>
            <h2 className="font-serif font-black text-lg text-black uppercase tracking-tight">Línea Temporal de Actividad</h2>
            <p className="text-3xs font-mono text-black/60 uppercase font-bold tracking-wider">Historial completo de modificaciones en BLOCKSI</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex gap-2.5 items-center text-xs">
          <SlidersHorizontal size={14} className="text-black shrink-0" />
          <div className="flex bg-white border-2 border-black rounded-none overflow-hidden p-0.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-[10px] uppercase font-mono font-black rounded-none transition-all cursor-pointer ${filterType === 'all' ? 'bg-[#FF4D00] text-white' : 'text-black hover:bg-black/5'}`}
            >
              Todo
            </button>
            <button
              onClick={() => setFilterType('notes')}
              className={`px-3 py-1 text-[10px] uppercase font-mono font-black rounded-none transition-all cursor-pointer ${filterType === 'notes' ? 'bg-[#FF4D00] text-white' : 'text-black hover:bg-black/5'}`}
            >
              Notas
            </button>
            <button
              onClick={() => setFilterType('reminders')}
              className={`px-3 py-1 text-[10px] uppercase font-mono font-black rounded-none transition-all cursor-pointer ${filterType === 'reminders' ? 'bg-[#FF4D00] text-white' : 'text-black hover:bg-black/5'}`}
            >
              Tareas
            </button>
            <button
              onClick={() => setFilterType('system')}
              className={`px-3 py-1 text-[10px] uppercase font-mono font-black rounded-none transition-all cursor-pointer ${filterType === 'system' ? 'bg-[#FF4D00] text-white' : 'text-black/50 hover:bg-black/5'}`}
            >
              Parámetros
            </button>
          </div>
        </div>
      </div>

      {/* Structured Nested Timeline Lists */}
      <div className="space-y-8 pl-2">
        {groupedTimeline.map((yGroup) => (
          <div key={yGroup.yearName} className="space-y-6 relative">
            
            {/* Year Tag */}
            <div className="inline-flex py-1 px-4 bg-[#FF4D00] font-serif font-black text-white text-sm rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-widest relative z-10 uppercase">
              {yGroup.yearName}
            </div>

            <div className="pl-4 md:pl-6 space-y-6 border-l-2 border-black">
              
              {/* Months list */}
              {yGroup.months.map((mGroup) => (
                <div key={mGroup.monthName} className="space-y-4 relative">
                  
                  {/* Month header tag */}
                  <h3 className="font-serif font-black text-black text-sm md:text-base capitalize flex items-center gap-1.5 pt-1 uppercase tracking-wider">
                    <Calendar size={13} className="text-black" />
                    {mGroup.monthName}
                  </h3>

                  {/* Events timeline cards */}
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-black pl-8">
                    {mGroup.events.map((ev) => {
                      const tag = getLogSymbol(ev.type);
                      const timeStr = new Date(ev.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                      const fullDateLog = new Date(ev.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

                      return (
                        <div
                          key={ev.id}
                          className="p-3.5 bg-white border-2 border-black rounded-none hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
                        >
                          {/* Inner connector pointer */}
                          <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-none rotate-45 bg-[#FF4D00] border-2 border-black z-10" />

                          <div className="flex items-start gap-2.5 overflow-hidden">
                            <span className={`text-[9px] font-mono font-black shrink-0 border-2 px-1.5 py-0.5 rounded-none uppercase tracking-wide leading-none select-none ${tag.style}`}>
                              {tag.text}
                            </span>
                            <div className="overflow-hidden space-y-0.5">
                              <p className="text-xs text-black block font-serif font-bold uppercase tracking-tight leading-normal">{ev.details}</p>
                              {ev.entityTitle && (
                                <p className="text-[10px] text-black/50 block truncate font-mono font-black uppercase">Ref: {ev.entityTitle}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-black/50 shrink-0 self-end sm:self-auto select-none">
                            <Clock size={9} />
                            <span>{fullDateLog}, {timeStr}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {groupedTimeline.length === 0 && (
          <div className="py-20 text-center bg-white border-2 border-black rounded-none text-black/60 italic text-sm space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <History size={32} className="mx-auto text-black" />
            <p className="font-sans font-bold">No se encontraron registros de actividades en la base de datos temporal.</p>
          </div>
        )}
      </div>
    </div>
  );
};
