import React, { createContext, useContext, useState, useEffect } from 'react';
import { Note, Reminder, NoteVersion, HistoryEvent, Category, Tag, AppSettings } from '../types';
import { db } from '../db';

interface BlocksiContextProps {
  notes: Note[];
  reminders: Reminder[];
  categories: Category[];
  tags: Tag[];
  history: HistoryEvent[];
  settings: AppSettings;
  activeSection: string;
  selectedDate: string; // YYYY-MM-DD
  activeNoteId: string | null;
  activeNotifications: AppNotification[];
  setActiveSection: (section: string) => void;
  setSelectedDate: (date: string) => void;
  setActiveNoteId: (id: string | null) => void;
  
  // Notes Operations
  addNote: (title: string, content: string, cat?: string, inputTags?: string[]) => Note;
  editNote: (note: Note, isAutoSave?: boolean, summary?: string) => Note;
  removeNote: (id: string) => void;
  recoverNote: (id: string) => void;
  scrubNote: (id: string) => void;
  getNoteVersions: (noteId: string) => NoteVersion[];
  revertToVersion: (versionId: string) => Note | null;

  // Reminders Operations
  addReminder: (rem: Omit<Reminder, 'id' | 'status'>) => Reminder;
  editReminder: (rem: Reminder) => void;
  removeReminder: (id: string) => void;
  recoverReminder: (id: string) => void;
  scrubReminder: (id: string) => void;

  // Taxonomy
  addCategory: (name: string, color: string) => void;
  removeCategory: (id: string) => void;
  addNewTag: (name: string) => void;
  removeExistingTag: (id: string) => void;

  // Database Actions
  clearAllData: () => void;
  importJsonData: (json: string) => boolean;
  exportJsonData: () => string;

  // Notification Actions
  triggerMockNotification: (title: string, body: string, linkedNoteId?: string, reminderId?: string) => void;
  dismissNotification: (id: string) => void;
  postponeReminder: (reminderId: string, minutes: number) => void;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  linkedNoteId?: string;
  reminderId?: string;
}

const BlocksiContext = createContext<BlocksiContextProps | undefined>(undefined);

export const BlocksiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-11'); // Initialized around June 2026
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeNotifications, setActiveNotifications] = useState<AppNotification[]>([]);

  // Synchronize state with Local Storage via db instance
  const reloadFromDB = () => {
    setNotes([...db.getNotes()]);
    setReminders([...db.getReminders()]);
    setCategories([...db.getCategories()]);
    setTags([...db.getTags()]);
    setHistory([...db.getHistory()]);
    setSettings(db.getSettings());
  };

  useEffect(() => {
    reloadFromDB();

    // Setup an initial notification alert to welcome the user and demonstrate local alerts
    setTimeout(() => {
      triggerMockNotification(
        '🔔 Recordatorio de Hoy',
        'Tienes reuniones pendientes del Proyecto Rocket programadas para esta tarde.',
        'n3',
        'r1'
      );
    }, 2000);
  }, []);

  const triggerMockNotification = (title: string, body: string, linkedNoteId?: string, reminderId?: string) => {
    const notifyEnabled = db.getSettings().notificationsEnabled;
    if (!notifyEnabled) return;

    const hhmm = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const newAlert: AppNotification = {
      id: 'alarm_' + Math.random().toString(36).substr(2, 9),
      title,
      body,
      time: hhmm,
      linkedNoteId,
      reminderId,
    };
    
    setActiveNotifications((prev) => [newAlert, ...prev]);

    // Optional browser standard notification request if allowed
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const dismissNotification = (id: string) => {
    setActiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Notes Operations
  const addNote = (title: string, content: string, cat = 'Personal', inputTags: string[] = []): Note => {
    const d = new Date();
    const currentDateStr = d.toISOString().split('T')[0];
    const currentTimeStr = d.toTimeString().split(' ')[0].substring(0, 5);

    const newNote: Note = {
      id: 'n_' + Math.random().toString(36).substr(2, 9),
      title: title.trim() || 'Nota sin título',
      content,
      createdAt: currentDateStr,
      createdTime: currentTimeStr,
      modifiedAt: currentDateStr,
      modifiedTime: currentTimeStr,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      charCount: content.length,
      category: cat,
      tags: inputTags,
      status: 'active',
      favorite: false,
      color: '#6366f1',
    };

    const added = db.saveNote(newNote);
    reloadFromDB();
    return added;
  };

  const editNote = (note: Note, isAutoSave = false, summary = ''): Note => {
    const res = db.saveNote(note, isAutoSave, summary);
    reloadFromDB();
    return res;
  };

  const removeNote = (id: string) => {
    db.deleteNote(id);
    reloadFromDB();
  };

  const recoverNote = (id: string) => {
    db.restoreNote(id);
    reloadFromDB();
  };

  const scrubNote = (id: string) => {
    db.purgeNote(id);
    reloadFromDB();
  };

  const getNoteVersions = (noteId: string): NoteVersion[] => {
    return db.getVersions(noteId);
  };

  const revertToVersion = (versionId: string): Note | null => {
    const res = db.restoreVersion(versionId);
    reloadFromDB();
    return res;
  };

  // Reminders Operations
  const addReminder = (rem: Omit<Reminder, 'id' | 'status'>): Reminder => {
    const newRem: Reminder = {
      ...rem,
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
    };
    db.saveReminder(newRem);
    reloadFromDB();
    return newRem;
  };

  const editReminder = (rem: Reminder) => {
    db.saveReminder(rem);
    reloadFromDB();
  };

  const removeReminder = (id: string) => {
    db.deleteReminder(id);
    reloadFromDB();
  };

  const recoverReminder = (id: string) => {
    db.restoreReminder(id);
    reloadFromDB();
  };

  const scrubReminder = (id: string) => {
    db.purgeReminder(id);
    reloadFromDB();
  };

  // Postpone logic
  const postponeReminder = (reminderId: string, minutes: number) => {
    const rem = reminders.find((r) => r.id === reminderId);
    if (!rem) return;

    // Simulate simple shift
    const now = new Date();
    const future = new Date(now.getTime() + minutes * 60 * 1000);
    const timeStr = future.toTimeString().split(' ')[0].substring(0, 5);
    const dateStr = future.toISOString().split('T')[0];

    const updated: Reminder = {
      ...rem,
      date: dateStr,
      time: timeStr,
    };
    db.saveReminder(updated);
    db.logHistory('reminder_postponed', `Se pospuso el recordatorio "${rem.title}" por ${minutes} minutos.`, rem.id, rem.title);
    reloadFromDB();

    // Trigger confirmation notification
    triggerMockNotification('⏰ Recordatorio Pospuesto', `"${rem.title}" pospuesto por ${minutes} minutos (${timeStr}).`);
  };

  // Taxonomy operations
  const addCategory = (name: string, color: string) => {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
    const newCat: Category = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      name,
      slug,
      color,
    };
    db.saveCategory(newCat);
    db.logHistory('category_created', `Nueva categoría creada: ${name}`);
    reloadFromDB();
  };

  const removeCategory = (id: string) => {
    db.deleteCategory(id);
    reloadFromDB();
  };

  const addNewTag = (name: string) => {
    const cleanName = name.trim().replace(/^#/, '');
    if (!cleanName) return;
    const newTag: Tag = {
      id: 't_' + Math.random().toString(36).substr(2, 9),
      name: cleanName,
    };
    db.saveTag(newTag);
    db.logHistory('tag_created', `Nueva etiqueta creada: #${cleanName}`);
    reloadFromDB();
  };

  const removeExistingTag = (id: string) => {
    db.deleteTag(id);
    reloadFromDB();
  };

  // Database actions
  const clearAllData = () => {
    db.clearDatabase();
    reloadFromDB();
  };

  const importJsonData = (json: string): boolean => {
    const success = db.importData(json);
    if (success) {
      reloadFromDB();
    }
    return success;
  };

  const exportJsonData = (): string => {
    return db.exportData();
  };

  return (
    <BlocksiContext.Provider
      value={{
        notes,
        reminders,
        categories,
        tags,
        history,
        settings,
        activeSection,
        selectedDate,
        activeNoteId,
        activeNotifications,
        setActiveSection,
        setSelectedDate,
        setActiveNoteId,
        
        addNote,
        editNote,
        removeNote,
        recoverNote,
        scrubNote,
        getNoteVersions,
        revertToVersion,

        addReminder,
        editReminder,
        removeReminder,
        recoverReminder,
        scrubReminder,

        addCategory,
        removeCategory,
        addNewTag,
        removeExistingTag,

        clearAllData,
        importJsonData,
        exportJsonData,
        
        triggerMockNotification,
        dismissNotification,
        postponeReminder,
      }}
    >
      {children}
    </BlocksiContext.Provider>
  );
};

export const useBlocksi = () => {
  const context = useContext(BlocksiContext);
  if (!context) {
    throw new Error('useBlocksi must be used inside a BlocksiProvider wrapper.');
  }
  return context;
};
