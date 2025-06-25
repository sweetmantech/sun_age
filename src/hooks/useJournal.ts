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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load entries from local storage on mount
  useEffect(() => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading local journal entries:', err);
      setError('Failed to load journal entries from local storage.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save entries to local storage
  const saveToLocalStorage = useCallback((newEntries: JournalEntry[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newEntries));
    } catch (err) {
      console.error('Error saving to local storage:', err);
      setError('Failed to save journal entry.');
    }
  }, []);

  // Migrate local entries to database
  const migrateLocalEntries = useCallback(async (userFid: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const localEntries = entries.filter(e => e.preservation_status === 'local');
      
      if (localEntries.length === 0) {
        return { migrated: 0, errors: [] };
      }

      const results = await Promise.allSettled(
        localEntries.map(async (entry) => {
          const response = await fetch('/api/journal/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: entry.content,
              sol_day: entry.sol_day,
              userFid: userFid
            })
          });

          if (!response.ok) {
            let errorMsg = `Failed to migrate entry: `;
            try {
              const errorBody = await response.json();
              if (errorBody && errorBody.error) {
                errorMsg += errorBody.error;
              } else {
                errorMsg += response.statusText;
              }
            } catch (e) {
              errorMsg += response.statusText;
            }
            throw new Error(errorMsg);
          }

          const { entry: newEntry } = await response.json();
          return { oldId: entry.id, newEntry };
        })
      );

      const migrated = results.filter(r => r.status === 'fulfilled').length;
      const errors = results.filter(r => r.status === 'rejected').map(r => 
        (r as PromiseRejectedResult).reason
      );

      // Remove migrated entries from local storage
      if (migrated > 0) {
        const remainingEntries = entries.filter(e => e.preservation_status !== 'local');
        setEntries(remainingEntries);
        saveToLocalStorage(remainingEntries);
      }

      return { migrated, errors };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to migrate entries';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [entries, saveToLocalStorage]);

  // Create a new journal entry locally
  const createEntry = useCallback(async (data: CreateJournalEntryRequest): Promise<JournalEntry> => {
    setLoading(true);
    setError(null);
    try {
      const newEntry: JournalEntry = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_fid: 0, // Not yet associated with a user
        sol_day: data.sol_day,
        content: data.content,
        word_count: data.content.trim().split(/\s+/).length,
        preservation_status: 'local',
        created_at: new Date().toISOString()
      };

      setEntries(prev => {
        const newEntries = [newEntry, ...prev];
        saveToLocalStorage(newEntries);
        return newEntries;
      });

      return newEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [saveToLocalStorage]);

  // Update a journal entry locally
  const updateEntry = useCallback(async (id: string, data: UpdateJournalEntryRequest): Promise<JournalEntry> => {
    setLoading(true);
    setError(null);
    
    try {
      const entryToUpdate = entries.find(e => e.id === id);

      if (!entryToUpdate) {
        throw new Error('Entry not found');
      }

      const updatedEntry: JournalEntry = {
        ...entryToUpdate,
        content: data.content,
        word_count: data.content.trim().split(/\s+/).length,
      };

      setEntries(prev => {
        const newEntries = prev.map(e => (e.id === id ? updatedEntry : e));
        saveToLocalStorage(newEntries);
        return newEntries;
      });

      return updatedEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update entry';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [entries, saveToLocalStorage]);

  // Delete a journal entry locally
  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setEntries(prev => {
        const newEntries = prev.filter(e => e.id !== id);
        saveToLocalStorage(newEntries);
        return newEntries;
      });
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
    getFilteredEntries,
    migrateLocalEntries
  };
} 