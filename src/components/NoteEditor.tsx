import React, { useState, useEffect, useRef } from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import { Note, NoteVersion } from '../types';
import {
  Save,
  Star,
  Trash2,
  Calendar,
  Tag as TagIcon,
  FolderOpen,
  Eye,
  Edit3,
  Undo2,
  List,
  CheckSquare,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Quote,
  Minus,
  Link,
  ChevronLeft,
  FlameKindling,
  History,
  FileCheck
} from 'lucide-react';

interface NoteEditorProps {
  noteId: string | 'new';
  onClose: () => void;
}

const COLORS = [
  { hex: '#6366f1', label: 'Indigo' },
  { hex: '#8b5cf6', label: 'Morado' },
  { hex: '#f59e0b', label: 'Ámbar' },
  { hex: '#10b981', label: 'Esmeralda' },
  { hex: '#f43f5e', label: 'Esmeralda' }, 
  { hex: '#14b8a6', label: 'Teal' },
  { hex: '#ec4899', label: 'Rosa' },
  { hex: '#4b5563', label: 'Gris' },
];

export const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, onClose }) => {
  const {
    notes,
    categories,
    tags,
    addNote,
    editNote,
    removeNote,
    getNoteVersions,
    revertToVersion,
    addCategory,
    addNewTag,
    triggerMockNotification,
    settings
  } = useBlocksi();

  const isNew = noteId === 'new';
  const currentNote = notes.find((n) => n.id === noteId);

  // States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [isPreview, setIsPreview] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('indigo');
  const [newTagName, setNewTagName] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<any>(null);

  // Load initial note info
  useEffect(() => {
    if (isNew) {
      setTitle('');
      setContent('');
      setCategory(categories[0]?.name || 'Personal');
      setSelectedTags([]);
      setFavorite(false);
      setColor('#6366f1');
      setIsPreview(false);
      setShowHistory(false);
    } else if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setCategory(currentNote.category);
      setSelectedTags(currentNote.tags || []);
      setFavorite(currentNote.favorite);
      setColor(currentNote.color || '#6366f1');
      setIsPreview(false);
      setShowHistory(false);
    }
  }, [noteId, currentNote, isNew, categories]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Compute stats
  const charCount = content.length;
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Formatting Insertion Helper
  const insertFormat = (beforeText: string, afterText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = beforeText + selectedText + afterText;

    setContent(text.substring(0, start) + replacement + text.substring(end));

    // Refocus with delay and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + beforeText.length,
        start + beforeText.length + selectedText.length
      );
    }, 50);

    triggerAutoSave();
  };

  // Auto-save logic
  const triggerAutoSave = () => {
    if (isNew) return; // Don't auto-save completely empty new notes without a manual save first
    
    setIsAutoSaving(true);
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (!currentNote) return;
      const updatedNote: Note = {
        ...currentNote,
        title: title || 'Sin título',
        content,
        category,
        tags: selectedTags,
        favorite,
        color,
        wordCount: content.split(/\s+/).filter(Boolean).length,
        charCount: content.length,
      };
      editNote(updatedNote, true); // Auto-save silences history log overflow
      setIsAutoSaving(false);
    }, 1500); // 1.5s debounce save
  };

  // Handle inputs changes to trigger auto-save
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    triggerAutoSave();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    triggerAutoSave();
  };

  // Toggle checklist inside editor on click
  const toggleChecklistItem = (lineIndex: number) => {
    if (isPreview) return;
    const lines = content.split('\n');
    const targetLine = lines[lineIndex];

    if (targetLine.includes('- [ ]')) {
      lines[lineIndex] = targetLine.replace('- [ ]', '- [x]');
    } else if (targetLine.includes('- [x]')) {
      lines[lineIndex] = targetLine.replace('- [x]', '- [ ]');
    }

    setContent(lines.join('\n'));
    triggerAutoSave();
  };

  // Star change
  const handleFavoriteToggle = () => {
    const newVal = !favorite;
    setFavorite(newVal);
    
    if (!isNew && currentNote) {
      editNote({ ...currentNote, favorite: newVal }, true);
    }
  };

  // Color selection
  const handleColorSelect = (cHex: string) => {
    setColor(cHex);
    if (!isNew && currentNote) {
      editNote({ ...currentNote, color: cHex }, true);
    }
  };

  // Category and Tag updates
  const handleCategoryChoice = (catName: string) => {
    setCategory(catName);
    if (!isNew && currentNote) {
      editNote({ ...currentNote, category: catName }, true);
    }
  };

  const handleTagToggle = (tagName: string) => {
    let list = [...selectedTags];
    if (list.includes(tagName)) {
      list = list.filter((t) => t !== tagName);
    } else {
      list.push(tagName);
    }
    setSelectedTags(list);
    if (!isNew && currentNote) {
      editNote({ ...currentNote, tags: list }, true);
    }
  };

  // Inline additions
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatColor);
    setCategory(newCatName.trim());
    setNewCatName('');
    setShowAddCategory(false);
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    addNewTag(newTagName.trim());
    setSelectedTags((prev) => [...prev, newTagName.trim()]);
    setNewTagName('');
    setShowAddTag(false);
  };

  // Manual save for new notes
  const handleManualSave = () => {
    const finalTitle = title.trim() || 'Nota sin título';
    if (isNew) {
      const created = addNote(finalTitle, content, category, selectedTags);
      triggerMockNotification('📝 Nota Guardada', `Se creó la nota "${finalTitle}" con éxito.`);
      onClose();
    } else if (currentNote) {
      const updated: Note = {
        ...currentNote,
        title: finalTitle,
        content,
        category,
        tags: selectedTags,
        favorite,
        color,
        wordCount,
        charCount,
      };
      editNote(updated, false, 'Guardado manual por el usuario');
      triggerMockNotification('💾 Nota Actualizada', `Cambios en "${finalTitle}" guardados en persistencia.`);
      onClose();
    }
  };

  const handleDelete = () => {
    if (!isNew && currentNote) {
      setShowDeleteConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDelete = () => {
    if (currentNote) {
      removeNote(currentNote.id);
      onClose();
    }
  };

  // Reverting Note version
  const handleRestoreVersion = (versionId: string) => {
    const updated = revertToVersion(versionId);
    if (updated) {
      setTitle(updated.title);
      setContent(updated.content);
      setFavorite(updated.favorite);
      setCategory(updated.category);
      setSelectedTags(updated.tags || []);
      setShowHistory(false);
      triggerMockNotification('⏳ Restauración Completa', 'Nota devuelta a un estado anterior.');
    }
  };

  // Render parsed markdown helper html
  const renderParsedMarkdown = () => {
    if (!content.trim()) {
      return <p className="text-slate-500 italic text-sm">Contenido vacío. Haz clic en "Editar" para empezar a escribir.</p>;
    }

    const lines = content.split('\n');
    return (
      <div className="space-y-3 prose prose-invert font-sans text-slate-300 max-w-none text-sm md:text-base leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Blockquote
          if (trimmed.startsWith('>')) {
            return (
              <blockquote key={idx} className="border-l-4 border-indigo-500 pl-4 py-1 italic text-slate-400 bg-slate-800/20 my-2 rounded-r-md">
                {trimmed.substring(1).trim()}
              </blockquote>
            );
          }

          // Headers
          if (trimmed.startsWith('# ')) {
            return <h1 key={idx} className="font-serif font-bold text-2xl text-white pt-3 border-b border-slate-800 pb-1">{trimmed.substring(2)}</h1>;
          }
          if (trimmed.startsWith('## ')) {
            return <h2 key={idx} className="font-serif font-semibold text-xl text-white pt-2">{trimmed.substring(3)}</h2>;
          }
          if (trimmed.startsWith('### ')) {
            return <h3 key={idx} className="font-serif font-medium text-lg text-white pt-1">{trimmed.substring(4)}</h3>;
          }

          // Separator
          if (trimmed === '---') {
            return <hr key={idx} className="border-t border-slate-800 my-4" />;
          }

          // Checklist completed
          if (trimmed.startsWith('- [x]') || trimmed.startsWith('- [X]')) {
            return (
              <div
                key={idx}
                onClick={() => toggleChecklistItem(idx)}
                className="flex items-start gap-2.5 cursor-pointer hover:bg-slate-800/30 p-1 rounded-md transition-colors"
              >
                <CheckSquare size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                <span className="line-through text-slate-500">{trimmed.substring(5).trim()}</span>
              </div>
            );
          }

          // Checklist pending
          if (trimmed.startsWith('- [ ]')) {
            return (
              <div
                key={idx}
                onClick={() => toggleChecklistItem(idx)}
                className="flex items-start gap-2.5 cursor-pointer hover:bg-slate-800/30 p-1 rounded-md transition-colors"
              >
                <div className="w-[18px] h-[18px] border-2 border-slate-500 rounded-xs shrink-0 mt-0.5 flex items-center justify-center hover:border-indigo-400" />
                <span>{trimmed.substring(5).trim()}</span>
              </div>
            );
          }

          // Bullet items
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={idx} className="list-disc ml-5 pl-1">
                {trimmed.substring(2)}
              </li>
            );
          }

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Standard paragraph line - support simple inline bold **text** or link
          let html = trimmed;
          // Hyperlink [text](url) -> anchor
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          html = html.replace(linkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline hover:text-indigo-300">$1</a>');
          
          // Bold **text** -> strong
          const boldRegex = /\*\*([^*]+)\*\*/g;
          html = html.replace(boldRegex, '<strong class="font-bold text-white">$1</strong>');

          // Italic *text* -> em
          const italicRegex = /\*([^*]+)\*/g;
          html = html.replace(italicRegex, '<em class="italic text-slate-200">$1</em>');

          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
      </div>
    );
  };

  const versionsList = !isNew && currentNote ? getNoteVersions(currentNote.id) : [];

  return (
    <div className="bg-white border-2 border-black rounded-none flex flex-col overflow-hidden h-[calc(100vh-140px)] min-h-[500px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      
      {/* Editor top headers bar */}
      <div className="px-4 py-3 bg-[#F9F9F7] border-b-2 border-black flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1 px-2 border-2 border-black rounded-none bg-white font-mono font-black hover:bg-black hover:text-white text-black transition-colors text-xs"
          >
            &lt; VOLVER
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-none border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-mono font-black text-black/60 uppercase hidden sm:block">
              {isNew ? 'Nueva Nota' : 'Borrador Guardado'}
            </span>
          </div>

          {isAutoSaving && (
            <span className="text-[10px] text-[#FF4D00] font-mono flex items-center gap-1 font-black uppercase">
              <span className="w-1.5 h-1.5 rounded-none bg-[#FF4D00] animate-ping" />
              Auto-guardando...
            </span>
          )}
        </div>

        {/* Top actions toolbar */}
        <div className="flex items-center gap-1.5">
          {/* Preview / Edit Toggle */}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`p-1 px-3 py-1 text-[10px] font-mono font-black uppercase rounded-none border-2 border-black flex items-center gap-1.5 transition-all cursor-pointer ${
              isPreview
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5 bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
            }`}
            title="Previsualizar formato"
          >
            {isPreview ? (
              <>
                <Edit3 size={12} className="text-[#FF4D00]" />
                <span>Editar</span>
              </>
            ) : (
              <>
                <Eye size={12} />
                <span>Previsualizar</span>
              </>
            )}
          </button>

          {/* Favorite star */}
          <button
            onClick={handleFavoriteToggle}
            className={`p-1.5 rounded-none border-2 border-black transition-colors cursor-pointer ${
              favorite ? 'text-white bg-[#FF4D00]' : 'text-black hover:bg-[#F9F9F7] bg-white'
            }`}
          >
            <Star size={16} className={favorite ? 'fill-white text-white' : ''} />
          </button>

          {/* Versions History toggle */}
          {!isNew && (
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                setIsPreview(false);
              }}
              className={`p-1.5 rounded-none border-2 border-black transition-colors cursor-pointer ${
                showHistory ? 'text-white bg-black' : 'text-black hover:bg-[#F9F9F7] bg-white'
              }`}
              title="Historial de versiones"
            >
              <History size={16} />
            </button>
          )}

          {/* Delete action */}
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-none border-2 border-black text-black bg-white hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>

          {/* Manual Save button */}
          <button
            onClick={handleManualSave}
            className="py-1 px-3.5 bg-black hover:bg-[#FF4D00] text-white text-xs font-serif font-black uppercase tracking-wider rounded-none border-2 border-black flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer"
          >
            <Save size={13} />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Main split work area: note space vs history panels */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left main workspace */}
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto space-y-4 bg-white">
          
          {/* Note Metadata configuration pane */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#F9F9F7] p-3 rounded-none border-2 border-black text-xs text-black/80 font-mono font-bold uppercase">
            {/* Category Dropdown Selector */}
            <div className="flex items-center gap-2">
              <FolderOpen size={13} className="text-black shrink-0" />
              <div className="flex-1 relative">
                <select
                  value={category}
                  onChange={(e) => handleCategoryChoice(e.target.value)}
                  className="w-full bg-transparent border-none text-black focus:outline-none focus:ring-0 py-0.5 cursor-pointer font-mono font-black uppercase text-xs"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name} className="bg-white text-black font-sans">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="hover:text-[#FF4D00] text-black font-black text-base cursor-pointer px-1"
                title="Nueva categoría"
              >
                +
              </button>
            </div>

            {/* Note tags pills display */}
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
              <TagIcon size={13} className="text-black shrink-0" />
              <span className="text-[10px] text-black/55 mr-1 shrink-0 font-bold uppercase">Etiquetas:</span>
              <div className="flex gap-1 overflow-x-auto">
                {tags.map((t) => {
                  const hasIt = selectedTags.includes(t.name);
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTagToggle(t.name)}
                      className={`px-2 py-0.5 rounded-none text-[9px] font-mono transition-all border border-black cursor-pointer ${
                        hasIt ? 'bg-[#FF4D00] text-white font-black' : 'bg-white text-black/60 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      #{t.name}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setShowAddTag(!showAddTag)}
                className="hover:text-[#FF4D00] text-black font-black text-base cursor-pointer px-1"
                title="Nueva etiqueta"
              >
                +
              </button>
            </div>

            {/* Note coloring swatch */}
            <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1 justify-end">
              <span className="text-[10px] text-black/55 font-bold uppercase">Color:</span>
              <div className="flex items-center gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => handleColorSelect(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-4 h-4 rounded-none border border-black transition-transform cursor-pointer ${
                      color === c.hex ? 'scale-110 border-2 border-dashed' : 'opacity-80'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Inner taxonomy addition overlays */}
          {showAddCategory && (
            <form onSubmit={handleAddCategorySubmit} className="flex gap-2 p-3 bg-[#F9F9F7] border-2 border-black rounded-none max-w-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="text"
                placeholder="Nueva Categoría"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="bg-white border-2 border-black rounded-none px-2.5 py-1 text-xs text-black font-mono uppercase tracking-tight flex-1 focus:outline-none focus:border-[#FF4D00]"
                required
              />
              <button type="submit" className="py-1 px-3 bg-black text-white hover:bg-[#FF4D00] rounded-none text-xs font-serif font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
                Añadir
              </button>
              <button type="button" onClick={() => setShowAddCategory(false)} className="text-xs text-black font-mono font-bold uppercase px-1 hover:text-[#FF4D00]">
                Cancelar
              </button>
            </form>
          )}

          {showAddTag && (
            <form onSubmit={handleAddTagSubmit} className="flex gap-2 p-3 bg-[#F9F9F7] border-2 border-black rounded-none max-w-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="text"
                placeholder="Nueva Etiqueta"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="bg-white border-2 border-black rounded-none px-2.5 py-1 text-xs text-black font-mono uppercase tracking-tight flex-1 focus:outline-none focus:border-[#FF4D00]"
                required
              />
              <button type="submit" className="py-1 px-3 bg-[#FF4D00] text-white border border-black rounded-none text-xs font-serif font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
                Crear
              </button>
              <button type="button" onClick={() => setShowAddTag(false)} className="text-xs text-black font-mono font-bold uppercase px-1 hover:text-[#FF4D00]">
                Cancelar
              </button>
            </form>
          )}

          {/* Form Content layout */}
          <div className="flex-1 flex flex-col space-y-3">
            {/* Title */}
            <input
              type="text"
              placeholder="Título de la nota..."
              value={title}
              onChange={handleTitleChange}
              disabled={isPreview}
              className={`w-full bg-transparent font-serif font-black text-xl md:text-2xl text-black border-b border-transparent placeholder-black/30 focus:outline-none focus:border-[#FF4D00] pb-2 ${
                isPreview ? 'cursor-not-allowed pointer-events-none' : ''
              }`}
            />

            {/* Fast Rich format helper buttons - only shown during editing */}
            {!isPreview && (
              <div className="flex items-center gap-1 px-1 bg-[#F9F9F7] p-1 rounded-none border-2 border-black flex-wrap shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <button type="button" onClick={() => insertFormat('**', '**')} className="p-1.5 rounded-none text-black hover:text-white hover:bg-black transition-colors" title="Negrita"><Bold size={14} /></button>
                <button type="button" onClick={() => insertFormat('*', '*')} className="p-1.5 rounded-none text-black hover:text-white hover:bg-black transition-colors" title="Cursiva"><Italic size={14} /></button>
                <button type="button" onClick={() => insertFormat('<u>', '</u>')} className="p-1.5 rounded-none text-black hover:text-white hover:bg-black transition-colors" title="Subrayado"><Underline size={14} /></button>
                <button type="button" onClick={() => insertFormat('# ')} className="p-1.5 rounded-none text-black hover:text-white hover:bg-black transition-colors" title="Título H1"><Heading1 size={14} /></button>
                <button type="button" onClick={() => insertFormat('## ')} className="p-1.5 rounded-none text-black hover:text-white hover:bg-black transition-colors" title="Subtítulo H2"><Heading2 size={14} /></button>
                <div className="w-px h-5 bg-black/20 mx-1" />
                <button type="button" onClick={() => insertFormat('- ')} className="p-1.5 rounded-none text-black hover:text-white hover:bg-black transition-colors" title="Lista viñetas"><List size={14} /></button>
                <button type="button" onClick={() => insertFormat('- [ ] ')} className="p-1.5 rounded-none text-black hover:text-white hover:bg-black transition-colors" title="Casilla de verificación"><CheckSquare size={14} /></button>
                <button type="button" onClick={() => insertFormat('> ')} className="p-1.5 rounded-none text-black hover:text-white hover:bg-black transition-colors" title="Blockquote"><Quote size={14} /></button>
                <button type="button" onClick={() => insertFormat('\n---\n')} className="p-1.5 rounded-none text-black hover:text-white hover:bg-black transition-colors" title="Separador"><Minus size={14} /></button>
                <button type="button" onClick={() => insertFormat('[', '](https://)')} className="p-1.5 rounded-none text-black hover:text-white hover:bg-black transition-colors" title="Enlace web"><Link size={14} /></button>
              </div>
            )}

            {/* Editing Box vs Markdown Previsualization Rendering */}
            <div className="flex-1 flex flex-col relative min-h-[220px]">
              {isPreview ? (
                <div className="flex-1 bg-[#F9F9F7] border-2 border-black p-4 md:p-5 rounded-none overflow-y-auto select-text text-black text-sm md:text-base">
                  {renderParsedMarkdown()}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Comienza a escribir tus notas, tareas o apuntes diarios aquí (formato markdown completo interactivo)..."
                  className="w-full flex-grow bg-transparent text-black placeholder-black/35 resize-none focus:outline-none leading-relaxed p-2 font-mono text-sm md:text-base"
                  style={{ minHeight: '300px' }}
                />
              )}
            </div>
          </div>

          {/* Under footer stats log */}
          <div className="pt-2 text-[10px] font-mono text-black/55 font-bold uppercase border-t-2 border-black/15 flex items-center justify-between">
            <div className="flex gap-4">
              <span>{wordCount} palabras</span>
              <span>{charCount} caracteres</span>
            </div>
            {!isNew && currentNote && (
              <span className="flex items-center gap-1 text-black/55 font-bold">
                <Calendar size={10} />
                Histórico: {currentNote.createdAt} {currentNote.createdTime}
              </span>
            )}
          </div>
        </div>

        {/* Right side history drawer */}
        {showHistory && (
          <div className="w-80 bg-[#F9F9F7] border-l-2 border-black flex flex-col h-full overflow-hidden transition-all duration-300">
            <div className="p-4 border-b-2 border-black bg-white flex items-center justify-between shrink-0">
              <span className="font-serif font-black text-black text-xs flex items-center gap-2 uppercase tracking-tight">
                <History size={16} className="text-[#FF4D00]" />
                Historial de Versiones
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs font-mono font-bold text-black hover:text-[#FF4D00]"
              >
                [X] CERRAR
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              <p className="text-[10px] font-mono text-black/60 uppercase font-black tracking-wider">
                Puntos guardados ({versionsList.length})
              </p>

              {versionsList.map((ver) => (
                <div
                  key={ver.id}
                  className="bg-white border-2 border-black p-3 rounded-none transition-all select-none space-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-black flex items-center gap-1.5">
                      <FileCheck size={11} className="text-black/60" />
                      {ver.modifiedAt}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#FF4D00]">{ver.modifiedTime}</span>
                  </div>

                  <p className="text-[11px] text-black/80 font-sans line-clamp-2 italic">
                    "{ver.changeSummary}"
                  </p>

                  <button
                    onClick={() => handleRestoreVersion(ver.id)}
                    className="w-full mt-2.5 py-1 px-2.5 bg-white hover:bg-black hover:text-white text-black border border-black rounded-none text-3xs font-mono font-black uppercase flex items-center justify-center gap-1 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Undo2 size={10} />
                    Restaurar este punto
                  </button>
                </div>
              ))}

              {versionsList.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <p className="text-xs text-black/45 italic font-sans">No hay versiones almacenadas.</p>
                  <p className="text-[9px] text-black/50 text-center uppercase font-mono">Se generará una versión con la siguiente modificación.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Neo-brutalist Confirm Delete dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-4 border-black p-6 max-w-sm w-full space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 text-[#FF4D00]">
              <Trash2 size={24} className="shrink-0" />
              <h3 className="font-serif font-black text-base text-black uppercase tracking-tight">¿Eliminar Nota?</h3>
            </div>
            <p className="text-xs font-mono font-bold text-black/70 uppercase leading-relaxed">
              ¿Deseas trasladar esta nota a la papelera de reciclaje? Podrás recuperarla más tarde si lo deseas.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border-2 border-black bg-white hover:bg-black/5 text-black font-mono font-black text-xs uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleConfirmDelete();
                }}
                className="px-4 py-2 border-2 border-black bg-red-600 hover:bg-red-700 text-white font-mono font-black text-xs uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
