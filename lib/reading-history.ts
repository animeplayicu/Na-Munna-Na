export interface ReadingHistoryEntry {
  lastRead: string;
  chapterId: string;
  chapter: string;
  page: number;
  totalPages: number;
  mangaTitle: string;
  posterUrl?: string;
}

export interface ReadingHistory {
  [mangaSlug: string]: ReadingHistoryEntry;
}

const READING_HISTORY_KEY = 'readingHistory';

export function getReadingHistory(): ReadingHistory {
  if (typeof window === 'undefined') return {};
  
  try {
    const history = localStorage.getItem(READING_HISTORY_KEY);
    return history ? JSON.parse(history) : {};
  } catch (error) {
    console.error('Error loading reading history:', error);
    return {};
  }
}

export function updateReadingHistory(
  mangaSlug: string,
  entry: Omit<ReadingHistoryEntry, 'lastRead'>
) {
  try {
    const history = getReadingHistory();
    
    history[mangaSlug] = {
      ...entry,
      lastRead: new Date().toISOString(),
    };
    
    localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error updating reading history:', error);
  }
}

export function getLastReadChapter(mangaSlug: string): ReadingHistoryEntry | null {
  const history = getReadingHistory();
  return history[mangaSlug] || null;
}