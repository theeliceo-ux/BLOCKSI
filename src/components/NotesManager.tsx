import React, { useState, useEffect } from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import { Note } from '../types';
import { NoteEditor } from './NoteEditor';
import {
  Search,
  Plus,
  Star,
  Folder,
  Tag as TagIcon,
  Grid,
  List as ListIcon,
  ChevronsUpDown,
  Calendar,
  X,
  FileCheck
} from 'lucide-react';

interface NotesManagerProps {
  initialActiveNoteId?: string | null;
}

export const NotesManager: React.FC<NotesManagerProps> = ({ initialActiveNoteId = null }) => {
  const {
    notes,
    categories,
    tags,
    activeNoteId,
    setActiveNoteId
  } = useBlocksi();

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [starredOnly, setStarredOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'modified' | 'created' | 'title'>('modified');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Selected note state
  const [editorNoteId, setEditorNoteId] = useState<string | 'new' | null>(null);

  // Sync internal state with external context triggers (e.g. sidebar clicking edit note)
  useEffect(() => {
    if (activeNoteId) {
      setEditorNoteId(activeNoteId);
    }
  }, [activeNoteId]);

  const handleCloseEditor = () => {
    setEditorNoteId(null);
    setActiveNoteId(null); // release context active note lock
  };

  const handleCreateNew = () => {
    setEditorNoteId('new');
    setActiveNoteId('new');
  };

  const handleSelectNote = (id: string) => {
    setEditorNoteId(id);
    setActiveNoteId(id);
  };

  // Only display non-trash notes
  const activeNotes = notes.filter((n) => n.status === 'active');

  // Filter notes based on conditions
  const filteredNotes = activeNotes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    
    const matchesCat = selectedCat === 'all' || n.category === selectedCat;
    
    const matchesTag = selectedTag === 'all' || (n.tags && n.tags.includes(selectedTag));
    
    const matchesStarred = !starredOnly || n.favorite;

    return matchesSearch && matchesCat && matchesTag && matchesStarred;
  });

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'created') {
      const timeA = new Date(`${a.createdAt}T${a.createdTime}`).getTime();
      const timeB = new Date(`${b.createdAt}T${b.createdTime}`).getTime();
      return timeB - timeA;
    }
    // Default: modified descending (latest first)
    const timeA = new Date(`${a.modifiedAt}T${a.modifiedTime}`).getTime();
    const timeB = new Date(`${b.modifiedAt}T${b.modifiedTime}`).getTime();
    return timeB - timeA;
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedCat('all');
    setSelectedTag('all');
    setStarredOnly(false);
  };

  // If editor is active, render it exclusively
  if (editorNoteId !== null) {
    return <NoteEditor noteId={editorNoteId} onClose={handleCloseEditor} />;
  }

  return (
    <div className="space-y-6">
      
      {/* Search Header and Filters Area */}
      <div className="bg-white border-2 border-black rounded-none p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Row 1: Search input and Plus button */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" size={18} />
            <input
              type="text"
              placeholder="Buscar por título, contenido, notas, diarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F9F9F7] border-2 border-black focus:border-[#FF4D00] focus:outline-none rounded-none text-sm text-black placeholder-black/55 font-serif font-bold uppercase tracking-tight"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-[#FF4D00]">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            {/* View Mode controls */}
            <div className="flex border-2 border-black rounded-none overflow-hidden bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 border-r border-black font-black uppercase text-xs ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'}`}
                title="Vista cuadrícula"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 font-black uppercase text-xs ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'}`}
                title="Vista lista"
              >
                <ListIcon size={16} />
              </button>
            </div>

            {/* Quick creator */}
            <button
              onClick={handleCreateNew}
              className="py-2.5 px-4 bg-[#FF4D00] hover:bg-[#1A1A1A] text-white border-2 border-black rounded-none text-xs font-serif font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-98 transition-all"
            >
              <Plus size={16} />
              Crear Nota
            </button>
          </div>
        </div>

        {/* Row 2: Advanced filters parameters */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          
          {/* Categories Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Folder size={14} className="text-black" />
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-transparent text-black font-mono font-bold uppercase tracking-tight text-xs border-none focus:outline-none py-0.5 cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name} className="bg-white text-black">{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <TagIcon size={14} className="text-black" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-transparent text-black font-mono font-bold uppercase tracking-tight text-xs border-none focus:outline-none py-0.5 cursor-pointer"
            >
              <option value="all">Todas las etiquetas</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.name} className="bg-white text-black">#{tag.name}</option>
              ))}
            </select>
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ChevronsUpDown size={14} className="text-black" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-black font-mono font-bold uppercase tracking-tight text-xs border-none focus:outline-none py-0.5 cursor-pointer"
            >
              <option value="modified" className="bg-white text-black">Revisadas recientemente</option>
              <option value="created" className="bg-white text-black">Fecha de creación</option>
              <option value="title" className="bg-white text-black">Alfabético (A-Z)</option>
            </select>
          </div>

          {/* Starred items toggle */}
          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={`px-3 py-1.5 rounded-none border-2 flex items-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              starredOnly
                ? 'bg-[#FF4D00] border-black text-white font-mono font-black uppercase text-xs shadow-none'
                : 'bg-white border-black text-black hover:bg-black/5 font-mono font-black uppercase text-xs'
            }`}
          >
            <Star size={12} className={starredOnly ? 'fill-white text-white' : ''} />
            Favoritos
          </button>

          {/* Clear button if filters are present */}
          {(search || selectedCat !== 'all' || selectedTag !== 'all' || starredOnly) && (
            <button
              onClick={clearFilters}
              className="text-[#FF4D00] hover:text-black font-serif font-black uppercase tracking-wider ml-auto flex items-center gap-1"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid vs List view of notes */}
      {sortedNotes.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'}>
          {sortedNotes.map((note) => {
            const hasMarkdowns = note.content.replace(/[#*`>_\-\[\]]/g, '');
            const colorBanner = note.color || '#6366f1';

            return (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note.id)}
                className={`bg-white border-2 border-black rounded-none overflow-hidden cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_#FF4D00] hover:border-black transition-all group flex ${
                  viewMode === 'list' ? 'flex-row items-center justify-between p-4 px-6 h-auto' : 'flex-col justify-between p-5 min-h-[170px]'
                }`}
                style={viewMode === 'grid' ? { borderTopWidth: '6px', borderTopColor: colorBanner } : undefined}
              >
                <div className={`overflow-hidden flex-1 ${viewMode === 'list' ? 'flex items-center gap-4' : 'space-y-1'}`}>
                  {/* Category swatch list badge only */}
                  {viewMode === 'list' && (
                    <div
                      className="w-3.5 h-3.5 rounded-none border border-black shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      style={{ backgroundColor: colorBanner }}
                      title={note.category}
                    />
                  )}

                  {/* Title & Favorite star */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-black text-black group-hover:text-[#FF4D00] transition-colors line-clamp-1 text-sm md:text-base uppercase tracking-tight">
                        {note.title}
                      </h3>
                      {note.favorite && (
                        <Star size={13} className="text-[#FF4D00] fill-[#FF4D00] shrink-0" />
                      )}
                    </div>

                    {/* Excerpt content */}
                    {viewMode === 'grid' && (
                      <p className="text-xs text-black/75 font-sans line-clamp-3 leading-relaxed mt-1">
                        {hasMarkdowns || <span className="italic text-black/40 font-serif">Nota sin contenido...</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags and Timestamps bottom bars */}
                <div className={`mt-3 ${
                  viewMode === 'list'
                    ? 'flex items-center gap-6 text-right shrink-0'
                    : 'flex flex-col gap-2 pt-2 border-t border-black/10 text-left'
                }`}>
                  {/* Note Tags listing */}
                  {viewMode === 'grid' && note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tg) => (
                        <span key={tg} className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-none bg-[#F9F9F7] text-black border border-black/15">
                          #{tg}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[9px] font-mono font-black text-black/50 px-1">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={`flex items-center text-[10px] font-mono text-black/60 font-black uppercase justify-between ${viewMode === 'list' ? 'gap-4' : ''}`}>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {note.modifiedAt}
                    </span>
                    {viewMode === 'grid' && (
                      <span className="bg-black text-white border border-black px-1.5 py-0.5 rounded-none text-[8px] tracking-wider uppercase font-mono">
                        {note.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white border-2 border-black rounded-none space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-black/60 italic text-sm font-sans">No se encontraron notas que coincidan con la búsqueda.</p>
          <button
            onClick={clearFilters}
            className="py-1.5 px-4 bg-[#1A1A1A] hover:bg-[#FF4D00] text-white rounded-none border border-black text-xs font-serif font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Limpiar filtros de búsqueda
          </button>
        </div>
      )}
    </div>
  );
};
