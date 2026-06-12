import React, { useState } from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import { Search, Filter, Star, Folder, Tag, Calendar, ChevronRight } from 'lucide-react';

export const SearchEngine: React.FC = () => {
  const { notes, reminders, categories, tags, setActiveSection, setActiveNoteId } = useBlocksi();

  // Search parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [searchTarget, setSearchTarget] = useState<'all' | 'notes' | 'reminders'>('all');

  // Display fields
  const activeNotes = notes.filter((n) => n.status === 'active');
  const activeReminders = reminders.filter((r) => r.status === 'pending');

  // Trigger search filters
  const performNotesSearch = () => {
    return activeNotes.filter((n) => {
      const textMatch =
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase());

      const catMatch = selectedCat === 'all' || n.category === selectedCat;
      const tagMatch = selectedTag === 'all' || (n.tags && n.tags.includes(selectedTag));
      const starMatch = !onlyStarred || n.favorite;

      // Time parsing
      let dateMatch = true;
      if (startDate) {
        dateMatch = dateMatch && n.createdAt >= startDate;
      }
      if (endDate) {
        dateMatch = dateMatch && n.createdAt <= endDate;
      }

      return textMatch && catMatch && tagMatch && starMatch && dateMatch;
    });
  };

  const performRemindersSearch = () => {
    return activeReminders.filter((r) => {
      const textMatch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase());

      const catMatch = selectedCat === 'all' || r.category === selectedCat;
      // Reminders don't match hashtag selects unless 'all'
      const tagMatch = selectedTag === 'all';
      const starMatch = !onlyStarred; // Reminders don't strictly have visual favorite toggles on standard list

      let dateMatch = true;
      if (startDate) {
        dateMatch = dateMatch && r.date >= startDate;
      }
      if (endDate) {
        dateMatch = dateMatch && r.date <= endDate;
      }

      return textMatch && catMatch && tagMatch && starMatch && dateMatch;
    });
  };

  const searchedNotes = searchTarget !== 'reminders' ? performNotesSearch() : [];
  const searchedReminders = searchTarget !== 'notes' ? performRemindersSearch() : [];
  const totalResults = searchedNotes.length + searchedReminders.length;

  const handleEditNoteRedirect = (noteId: string) => {
    setActiveNoteId(noteId);
    setActiveSection('notes');
  };

  const handleReminderRedirect = () => {
    setActiveSection('reminders');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCat('all');
    setSelectedTag('all');
    setStartDate('');
    setEndDate('');
    setOnlyStarred(false);
    setSearchTarget('all');
  };

  return (
    <div className="space-y-6">
      
      {/* Search Console Header */}
      <div className="bg-white border-2 border-black rounded-none p-5 md:p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Input area */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
          <input
            type="text"
            placeholder="Introduce los términos a buscar (título, contenido, recordatorios o hashtag)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F9F9F7] border-2 border-black rounded-none pl-12 pr-4 py-3 text-sm md:text-base text-black placeholder-black/40 focus:outline-none focus:border-[#FF4D00] font-sans font-bold shadow-inner uppercase"
          />
        </div>

        {/* Filters Panel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Target toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Alcance</label>
            <div className="flex border-2 border-black rounded-none overflow-hidden bg-white text-xs">
              <button
                type="button"
                onClick={() => setSearchTarget('all')}
                className={`flex-1 py-1.5 transition-colors cursor-pointer font-mono font-black uppercase ${searchTarget === 'all' ? 'bg-[#FF4D00] text-white' : 'text-black hover:bg-black/5'}`}
              >
                Todo
              </button>
              <button
                type="button"
                onClick={() => setSearchTarget('notes')}
                className={`flex-1 py-1.5 transition-colors cursor-pointer font-mono font-black uppercase ${searchTarget === 'notes' ? 'bg-[#FF4D00] text-white' : 'text-black hover:bg-black/5'}`}
              >
                Notas
              </button>
              <button
                type="button"
                onClick={() => setSearchTarget('reminders')}
                className={`flex-1 py-1.5 transition-colors cursor-pointer font-mono font-black uppercase ${searchTarget === 'reminders' ? 'bg-[#FF4D00] text-white' : 'text-black hover:bg-black/5'}`}
              >
                Alertas
              </button>
            </div>
          </div>

          {/* Categories select */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Categoría</label>
            <div className="flex items-center gap-2 bg-white p-2 border-2 border-black rounded-none text-xs">
              <Folder size={12} className="text-black shrink-0" />
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="bg-transparent text-black border-none focus:outline-none w-full py-0.5 font-bold uppercase cursor-pointer"
              >
                <option value="all">Cualquiera</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags select */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Etiqueta</label>
            <div className="flex items-center gap-2 bg-white p-2 border-2 border-black rounded-none text-xs">
              <Tag size={12} className="text-black shrink-0" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-transparent text-black border-none focus:outline-none w-full py-0.5 font-bold uppercase cursor-pointer"
              >
                <option value="all">Cualquiera</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.name}>#{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker Start */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Desde la fecha</label>
            <div className="flex items-center gap-1.5 bg-white p-2 border-2 border-black rounded-none text-xs font-sans">
              <Calendar size={12} className="text-black shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-black border-none focus:outline-none w-full font-sans font-bold cursor-pointer"
              />
            </div>
          </div>

          {/* Date Picker End */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Hasta la fecha</label>
            <div className="flex items-center gap-1.5 bg-white p-2 border-2 border-black rounded-none text-xs font-sans">
              <Calendar size={12} className="text-black shrink-0" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-black border-none focus:outline-none w-full font-sans font-bold cursor-pointer"
              />
            </div>
          </div>

          {/* Starred item button */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1 justify-end flex flex-col">
            <button
              type="button"
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`w-full py-2 border-2 rounded-none flex items-center justify-center gap-1.5 text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                onlyStarred
                  ? 'bg-amber-400 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold'
                  : 'bg-white border-black text-black hover:bg-black/5'
              }`}
            >
              <Star size={13} className={onlyStarred ? 'fill-black' : ''} />
              Solo Favoritos
            </button>
          </div>

          {/* Clear Filters console */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1 justify-end flex flex-col">
            <button
              type="button"
              onClick={handleClearFilters}
              className="py-2 px-4 border-2 border-dashed border-black hover:bg-black/5 text-black font-mono font-black uppercase text-xs rounded-none flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              Restablecer Consola
            </button>
          </div>
        </div>
      </div>

      {/* Results Listings segment */}
      <div className="space-y-5">
        <h2 className="text-xs font-mono uppercase text-black font-black px-1 select-none tracking-wider">
          Coincidencias encontradas ({totalResults})
        </h2>

        <div className="space-y-3">
          
          {/* Notes items display */}
          {searchedNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => handleEditNoteRedirect(note.id)}
              className="p-4 bg-white border-2 border-black hover:border-black rounded-none cursor-pointer hover:bg-[#F9F9F7] transition-all flex items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="overflow-hidden space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase">
                  <span className="text-white font-black bg-black border border-black px-1.5 py-0.5 rounded-none">Nota</span>
                  <span className="text-black/30">•</span>
                  <span className="text-black font-bold uppercase">{note.category}</span>
                  <span className="text-black/60">{note.createdAt}</span>
                </div>
                
                <h3 className="font-serif font-black text-black text-sm md:text-base leading-tight uppercase tracking-tight">
                  {note.title}
                </h3>
                <p className="text-xs text-black/70 line-clamp-1 font-sans">
                  {note.content.replace(/[#*`>_\-\[\]]/g, '')}
                </p>
              </div>

              <ChevronRight size={18} className="text-black shrink-0" />
            </div>
          ))}

          {/* Reminders items display */}
          {searchedReminders.map((rem) => (
            <div
              key={rem.id}
              onClick={handleReminderRedirect}
              className="p-4 bg-white border-2 border-black hover:border-black rounded-none cursor-pointer hover:bg-[#F9F9F7] transition-all flex items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="overflow-hidden space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase">
                  <span className="text-black font-black bg-[#FF4D00] border border-black px-1.5 py-0.5 rounded-none">Aviso</span>
                  <span className="text-black/30">•</span>
                  <span className="text-black font-bold uppercase">{rem.category}</span>
                  <span className="text-black/60">{rem.date}</span>
                </div>
                
                <h3 className="font-serif font-black text-black text-sm md:text-base leading-tight uppercase tracking-tight">
                  {rem.title}
                </h3>
                {rem.description && (
                  <p className="text-xs text-black/70 line-clamp-1 font-sans">{rem.description}</p>
                )}
              </div>

              <ChevronRight size={18} className="text-black shrink-0" />
            </div>
          ))}

          {totalResults === 0 && (
            <div className="py-20 text-center bg-white border-2 border-black rounded-none text-black font-mono uppercase font-black text-sm p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              No hay coincidencias que coincidan con los filtros ingresados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
