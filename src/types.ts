export type NoteStatus = 'active' | 'archived' | 'trash';
export type ReminderStatus = 'pending' | 'completed' | 'trash';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type RepeatType = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type Language = 'es' | 'en';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // YYYY-MM-DD
  createdTime: string; // HH:MM
  modifiedAt: string; // YYYY-MM-DD
  modifiedTime: string; // HH:MM
  wordCount: number;
  charCount: number;
  category: string;
  tags: string[];
  status: NoteStatus;
  color?: string; // Hex or theme color class
  favorite: boolean;
  deletedAt?: string; // Timestamp of deletion
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  priority: PriorityLevel;
  category: string;
  status: ReminderStatus;
  repeat: RepeatType;
  linkedNoteId?: string; // Reference to a Note id
  deletedAt?: string; // Timestamp of deletion
}

export interface NoteVersion {
  id: string;
  noteId: string;
  title: string;
  content: string;
  modifiedAt: string; // YYYY-MM-DD
  modifiedTime: string; // HH:MM
  changeSummary: string;
}

export type HistoryEventType =
  | 'note_created'
  | 'note_edited'
  | 'note_deleted'
  | 'note_restored'
  | 'note_purged'
  | 'reminder_created'
  | 'reminder_completed'
  | 'reminder_postponed'
  | 'reminder_deleted'
  | 'reminder_restored'
  | 'reminder_purged'
  | 'category_created'
  | 'tag_created'
  | 'settings_updated'
  | 'db_imported'
  | 'db_cleared';

export interface HistoryEvent {
  id: string;
  timestamp: string; // ISO string
  type: HistoryEventType;
  details: string; // Human readable description
  entityId?: string;
  entityTitle?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color: string; // Color name like "red", "emerald", "blue", etc.
}

export interface Tag {
  id: string;
  name: string; // e.g. "Trabajo"
}

export interface AppSettings {
  theme: ThemeMode;
  language: Language;
  fontSize: FontSize;
  notificationsEnabled: boolean;
  autoBackup: boolean;
}
