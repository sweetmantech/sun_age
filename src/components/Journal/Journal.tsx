"use client";

import { useState, useMemo } from 'react';
import { JournalTimeline } from '~/components/Journal/JournalTimeline';
import { JournalEntryEditor } from '~/components/Journal/JournalEntryEditor';
import { useJournal } from '~/hooks/useJournal';
import type { JournalEntry } from '~/types/journal';
import { ConfirmationModal } from '~/components/ui/ConfirmationModal';

interface JournalProps {
  solAge: number;
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

  return (
    <div className="w-full max-w-md mx-auto">
      {editingEntry ? (
        <JournalEntryEditor 
          entry={editingEntry}
          onSave={handleSave}
          onFinish={handleCancel}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4 gap-2">
            <input
              type="text"
              placeholder="SEARCH ENTRIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white/90 border border-gray-300 text-black placeholder-gray-500 px-4 py-2 text-xs font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              onClick={handleStartWriting}
              className="bg-[#d4af37] text-black font-mono text-xs tracking-widest py-2 px-4 border border-black hover:bg-[#e6c75a] transition-colors"
            >
              + NEW
            </button>
          </div>
          <JournalTimeline 
            entries={filteredEntries} 
            onStartWriting={handleStartWriting}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest} 
          />
        </>
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