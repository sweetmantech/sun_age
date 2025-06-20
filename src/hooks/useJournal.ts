import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, CreateJournalEntryRequest, UpdateJournalEntryRequest, JournalFilters } from '~/types/journal';

// Local storage key for journal entries
const LOCAL_STORAGE_KEY = 'solara_journal_entries';

// Local storage interface
interface LocalJournalEntry {
  id: string;
  content: string;
  sol_day: number;
  word_count: number;
  created_at: string;
  preservation_status: 'local';
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load entries from local storage on mount
  useEffect(() => {
    const loadLocalEntries = () => {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const localEntries: LocalJournalEntry[] = JSON.parse(stored);
          // Convert local entries to JournalEntry format
          const convertedEntries: JournalEntry[] = localEntries.map(entry => ({
            ...entry,
            user_fid: 0, // Placeholder for local entries
            preservation_status: 'local' as const
          }));
          setEntries(convertedEntries);
        }
      } catch (err) {
        console.error('Error loading local journal entries:', err);
      }
    };

    loadLocalEntries();
  }, []);

  // Save entries to local storage
  const saveToLocalStorage = useCallback((newEntries: JournalEntry[]) => {
    try {
      const localEntries = newEntries
        .filter(entry => entry.preservation_status === 'local')
        .map(entry => ({
          id: entry.id,
          content: entry.content,
          sol_day: entry.sol_day,
          word_count: entry.word_count,
          created_at: entry.created_at,
          preservation_status: 'local' as const
        }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localEntries));
    } catch (err) {
      console.error('Error saving to local storage:', err);
    }
  }, []);

  // Create a new journal entry
  const createEntry = useCallback(async (data: CreateJournalEntryRequest): Promise<JournalEntry> => {
    setLoading(true);
    setError(null);

    try {
      // Create local entry first
      const newEntry: JournalEntry = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_fid: 0,
        sol_day: data.sol_day,
        content: data.content,
        word_count: data.content.trim().split(/\s+/).length,
        preservation_status: 'local',
        created_at: new Date().toISOString()
      };

      // Add to state
      setEntries(prev => {
        const newEntries = [newEntry, ...prev];
        saveToLocalStorage(newEntries);
        return newEntries;
      });

      // Try to save to API if user is authenticated
      try {
        const response = await fetch('/api/journal/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const { entry } = await response.json();
          // Replace local entry with server entry
          setEntries(prev => {
            const newEntries = prev.map(e => e.id === newEntry.id ? entry : e);
            saveToLocalStorage(newEntries);
            return newEntries;
          });
          return entry;
        }
      } catch (apiError) {
        console.warn('Failed to save to API, keeping local only:', apiError);
      }

      return newEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [saveToLocalStorage]);

  // Update a journal entry
  const updateEntry = useCallback(async (id: string, data: UpdateJournalEntryRequest): Promise<JournalEntry> => {
    setLoading(true);
    setError(null);

    try {
      const updatedEntry: JournalEntry = {
        ...entries.find(e => e.id === id)!,
        content: data.content,
        word_count: data.content.trim().split(/\s+/).length
      };

      // Update local state
      setEntries(prev => {
        const newEntries = prev.map(e => e.id === id ? updatedEntry : e);
        saveToLocalStorage(newEntries);
        return newEntries;
      });

      // Try to update on API if user is authenticated
      try {
        const response = await fetch(`/api/journal/entries/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const { entry } = await response.json();
          // Update with server response
          setEntries(prev => {
            const newEntries = prev.map(e => e.id === id ? entry : e);
            saveToLocalStorage(newEntries);
            return newEntries;
          });
          return entry;
        }
      } catch (apiError) {
        console.warn('Failed to update on API, keeping local only:', apiError);
      }

      return updatedEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [entries, saveToLocalStorage]);

  // Delete a journal entry
  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Remove from local state
      setEntries(prev => {
        const newEntries = prev.filter(e => e.id !== id);
        saveToLocalStorage(newEntries);
        return newEntries;
      });

      // Try to delete from API if user is authenticated
      try {
        const response = await fetch(`/api/journal/entries/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          console.warn('Failed to delete from API, but removed locally');
        }
      } catch (apiError) {
        console.warn('Failed to delete from API, but removed locally:', apiError);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [saveToLocalStorage]);

  // Load entries from API (for authenticated users)
  const loadEntries = useCallback(async (filters?: JournalFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.preservation_status) {
        params.append('preservation_status', filters.preservation_status);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const response = await fetch(`/api/journal/entries?${params.toString()}`);
      
      if (response.ok) {
        const { entries: apiEntries } = await response.json();
        // Merge with local entries, prioritizing API entries
        setEntries(prev => {
          const localEntries = prev.filter(e => e.preservation_status === 'local');
          const merged = [...apiEntries, ...localEntries];
          // Sort by created_at descending
          merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          saveToLocalStorage(merged);
          return merged;
        });
      } else {
        console.warn('Failed to load entries from API, using local only');
      }
    } catch (err) {
      console.warn('Error loading entries from API, using local only:', err);
    } finally {
      setLoading(false);
    }
  }, [saveToLocalStorage]);

  // Filter entries
  const getFilteredEntries = useCallback((filters?: JournalFilters) => {
    let filtered = entries;

    if (filters?.preservation_status && filters.preservation_status !== 'all') {
      filtered = filtered.filter(entry => entry.preservation_status === filters.preservation_status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.content.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [entries]);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    loadEntries,
    getFilteredEntries
  };
} 