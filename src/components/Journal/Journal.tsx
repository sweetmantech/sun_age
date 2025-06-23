"use client";

import { useState, useMemo } from 'react';
import { JournalTimeline } from '~/components/Journal/JournalTimeline';
import { JournalEntryEditor } from '~/components/Journal/JournalEntryEditor';
import { useJournal } from '~/hooks/useJournal';
import type { JournalEntry } from '~/types/journal';
import { ConfirmationModal } from '~/components/ui/ConfirmationModal';
import { useDailyContent } from '~/hooks/useDailyContent';
import Image from 'next/image';

interface JournalProps {
  solAge: number;
}

function JournalEmptyState() {
  return (
    <div className="border border-gray-300 p-8 text-center bg-white/50">
      <h2 className="text-sm font-mono tracking-widest text-gray-700 mb-6">🌞 NO ENTRIES YET 🌞</h2>
      <div className="max-w-prose mx-auto text-left">
        <p className="font-serif text-gray-800 mb-6 text-[17px] leading-[20px] tracking-[-0.02em]">Welcome to the journal.</p>
        <p className="font-serif text-gray-800 text-[17px] leading-[20px] tracking-[-0.02em]">
          Every day you visit Solara, you&apos;ll find a daily prompt, an affirmation, or a reflection from our Sol Guide, Abri Mathos. Some days you might be inspired to share something you&apos;ve learned, you felt, you questioned—all are valid here. And sometimes if you feel inclined, you can preserve these reflections so that others may find the wisdom in your journey.
        </p>
        <p className="font-serif text-gray-800 mt-6 text-[17px] leading-[20px] tracking-[-0.02em]">
          Together we may seek the knowledge of the sun.
        </p>
        <p className="font-serif text-gray-800 mt-8 text-[17px] leading-[20px] tracking-[-0.02em]">
          Sol Seeker 🌞<br />- Su
        </p>
      </div>
    </div>
  );
}

export function Journal({ solAge }: JournalProps) {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { entries, createEntry, updateEntry, deleteEntry, loading, error } = useJournal();

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