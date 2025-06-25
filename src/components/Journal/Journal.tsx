"use client";

import { useState, useMemo } from 'react';
import { JournalTimeline } from '~/components/Journal/JournalTimeline';
import { JournalEntryEditor } from '~/components/Journal/JournalEntryEditor';
import { useJournal } from '~/hooks/useJournal';
import type { JournalEntry } from '~/types/journal';
import { ConfirmationModal } from '~/components/ui/ConfirmationModal';
import { useDailyContent } from '~/hooks/useDailyContent';
import Image from 'next/image';
import React from 'react';
import { PulsingStarSpinner } from "~/components/ui/PulsingStarSpinner";
import { useFrameSDK } from '~/hooks/useFrameSDK';

interface JournalProps {
  solAge: number;
}

function JournalEmptyState() {
  return (
    <div className="text-center py-8 border border-gray-300 bg-white/80 px-6 pt-8 pb-6">
      <div className="mb-6">
        <span className="text-base font-mono">🌞 NO ENTRIES YET 🌞</span>
      </div>
      <div className="text-left max-w-xl mx-auto">
        <p style={{ fontSize: '17px', lineHeight: '20px', letterSpacing: '-0.02em', color: '#505050' }} className="font-serif mb-4">Welcome to the journal.</p>
        <p style={{ fontSize: '17px', lineHeight: '20px', letterSpacing: '-0.02em', color: '#505050' }} className="font-serif mb-4">
          Every day you visit Solara, you&#39;ll find a daily prompt, an affirmation, or a reflection from our Sol Guide, Abri Mathos. Some days you might be inspired to share something you&#39;ve learned, you felt, you questioned—all are valid here. And sometimes if you feel inclined, you can preserve these reflections so that others may find the wisdom in your journey.
        </p>
        <p style={{ fontSize: '17px', lineHeight: '20px', letterSpacing: '-0.02em', color: '#505050' }} className="font-serif mb-4">
          Together we may seek the knowledge of the sun.
        </p>
        <p style={{ fontSize: '17px', lineHeight: '20px', letterSpacing: '-0.02em', color: '#505050' }} className="font-serif mb-0">Sol Seeker 🌞</p>
        <p style={{ fontSize: '17px', lineHeight: '20px', letterSpacing: '-0.02em', color: '#505050' }} className="font-serif">- Su</p>
      </div>
    </div>
  );
}

export function Journal({ solAge }: JournalProps) {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const { entries, createEntry, updateEntry, deleteEntry, migrateLocalEntries, loading, error } = useJournal();
  const { context } = useFrameSDK();

  const localEntries = useMemo(() => 
    entries.filter(entry => entry.preservation_status === 'local'), 
    [entries]
  );

  const filteredEntries = useMemo(() => {
    if (!searchQuery) {
      return entries;
    }
    return entries.filter(entry =>
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery]);

  const handleStartWriting = () => {
    setEditingEntry({
      id: '', // New entry has no ID yet
      content: '',
      sol_day: solAge,
      word_count: 0,
      created_at: new Date().toISOString(),
      user_fid: 0,
      preservation_status: 'local',
    });
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
  };

  const handleSave = async (entryToSave: { id?: string, content: string }) => {
    if (editingEntry && editingEntry.id) {
      await updateEntry(editingEntry.id, { content: entryToSave.content });
    } else {
      await createEntry({ content: entryToSave.content, sol_day: solAge });
    }
    setEditingEntry(null);
  };

  const handleAutoSave = async (entryToSave: { id?: string, content: string }) => {
    if (editingEntry && editingEntry.id) {
      await updateEntry(editingEntry.id, { content: entryToSave.content });
    } else {
      // Create a new entry and update the editor state with the new entry (so future autosaves update, not create)
      const newEntry = await createEntry({ content: entryToSave.content, sol_day: solAge });
      setEditingEntry(newEntry);
    }
    // Don't close the editor for autosave
  };

  const handleCancel = () => {
    setEditingEntry(null);
  };

  const handleDeleteRequest = (id: string) => {
    setEntryToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
  };

  const handleMigrateLocalEntries = async () => {
    setIsMigrating(true);
    setMigrationError(null);
    try {
      // Get the actual user's FID from Farcaster context
      const userFid = context?.user?.fid;
      if (!userFid) {
        throw new Error('You must be connected via Farcaster to migrate entries');
      }
      const result = await migrateLocalEntries(userFid);
      if (result.errors.length > 0) {
        // Show all error messages, not just a generic one
        setMigrationError(result.errors.map(e => (typeof e === 'string' ? e : e.message || JSON.stringify(e))).join('\n'));
        console.error('Migration errors:', result.errors);
      } else if (result.migrated === 0) {
        setMigrationError('No entries were migrated.');
      } else {
        setMigrationError(null);
      }
    } catch (err: any) {
      setMigrationError(err.message || 'Migration failed.');
      console.error('Migration failed:', err);
    } finally {
      setIsMigrating(false);
    }
  };

  if (loading) {
    return <div>Loading journal...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading journal: {error}</div>;
  }

  if (editingEntry) {
    return (
      <JournalEntryEditor
        entry={editingEntry}
        onSave={handleSave}
        onAutoSave={handleAutoSave}
        onFinish={handleCancel}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center py-4 gap-2">
        <input
          type="text"
          placeholder="SEARCH ENTRIES..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 bg-white/90 border border-gray-300 text-black placeholder-gray-500 px-4 py-2 text-xs font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
        />
        <button
          onClick={handleStartWriting}
          className="h-11 flex-shrink-0 bg-[#d4af37] text-black font-mono text-xs tracking-widest py-3 px-4 border border-black hover:bg-[#e6c75a] transition-colors"
        >
          + NEW
        </button>
      </div>

      {/* Migration notice for local entries */}
      {localEntries.length > 0 && context?.user?.fid && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200">
          {migrationError && (
            <div className="mb-2 p-2 bg-red-100 border border-red-300 text-red-700 font-mono text-xs whitespace-pre-line">
              {migrationError}
            </div>
          )}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-mono text-sm text-yellow-800 mb-1">
                LOCAL ENTRIES DETECTED
              </h4>
              <p className="text-xs text-yellow-700">
                You have {localEntries.length} {localEntries.length === 1 ? 'entry' : 'entries'} stored locally. 
                Migrate them to the database to enable sharing.
              </p>
            </div>
            <button
              onClick={handleMigrateLocalEntries}
              disabled={isMigrating}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-mono text-xs tracking-widest py-2 px-3 border border-yellow-700"
            >
              {isMigrating ? (
                <div className="flex items-center justify-center">
                  <PulsingStarSpinner />
                  MIGRATING...
                </div>
              ) : 'MIGRATE'}
            </button>
          </div>
        </div>
      )}
      
      {/* Notice for local entries when not connected */}
      {localEntries.length > 0 && !context?.user?.fid && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200">
          <div className="text-center">
            <h4 className="font-mono text-sm text-blue-800 mb-1">
              LOCAL ENTRIES DETECTED
            </h4>
            <p className="text-xs text-blue-700">
              You have {localEntries.length} {localEntries.length === 1 ? 'entry' : 'entries'} stored locally. 
              Connect via Farcaster to migrate them to the database and enable sharing.
            </p>
          </div>
        </div>
      )}
      
      {entries.length > 0 ? (
        <JournalTimeline entries={filteredEntries} onEdit={handleEdit} onDelete={handleDeleteRequest} onStartWriting={handleStartWriting} />
      ) : (
        <JournalEmptyState />
      )}

      <ConfirmationModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Reflection"
        message="Are you sure you want to permanently delete this reflection?"
        confirmText="Delete"
      />
    </div>
  );
} 