"use client";

import React, { useState, useEffect } from 'react';
import { useJournal } from '~/hooks/useJournal';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import type { JournalEntry, JournalTabState, JournalFilters } from '~/types/journal';
import JournalTimeline from './JournalTimeline';
import JournalEntryEditor from './JournalEntryEditor';
import JournalEntryView from './JournalEntryView';

interface JournalProps {
  solDay: number;
  onClose?: () => void;
}

export default function Journal({ solDay, onClose }: JournalProps) {
  const [currentState, setCurrentState] = useState<JournalTabState>('timeline');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [filters, setFilters] = useState<JournalFilters>({ preservation_status: 'all' });
  
  const { context } = useFrameSDK();
  const { entries, loading, error, createEntry, updateEntry, deleteEntry, loadEntries, getFilteredEntries } = useJournal();

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleCreateEntry = async (content: string) => {
    try {
      await createEntry({ content, sol_day: solDay });
      setCurrentState('timeline');
    } catch (err) {
      console.error('Failed to create entry:', err);
    }
  };

  const handleUpdateEntry = async (id: string, content: string) => {
    try {
      await updateEntry(id, { content });
      setCurrentState('timeline');
      setSelectedEntry(null);
    } catch (err) {
      console.error('Failed to update entry:', err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id);
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
        setCurrentState('timeline');
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setCurrentState('view');
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setCurrentState('edit');
  };

  const handleBackToTimeline = () => {
    setCurrentState('timeline');
    setSelectedEntry(null);
  };

  const filteredEntries = getFilteredEntries(filters);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-serif font-bold">Journal</h2>
          {currentState === 'timeline' && (
            <span className="text-xs font-mono text-gray-600">
              Sol {solDay}
            </span>
          )}
        </div>
        
        {currentState === 'timeline' && (
          <button
            onClick={() => setCurrentState('create')}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-mono uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition-colors duration-200"
          >
            <span>+</span>
            <span>New Entry</span>
          </button>
        )}
        
        {currentState !== 'timeline' && (
          <button
            onClick={handleBackToTimeline}
            className="text-xs font-mono uppercase tracking-widest text-gray-600 hover:text-black transition-colors duration-200"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {/* Content */}
      {currentState === 'timeline' && (
        <JournalTimeline
          entries={filteredEntries}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
          onViewEntry={handleViewEntry}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntry}
          onCreateEntry={() => setCurrentState('create')}
        />
      )}

      {currentState === 'create' && (
        <JournalEntryEditor
          solDay={solDay}
          onSave={handleCreateEntry}
          onCancel={handleBackToTimeline}
        />
      )}

      {currentState === 'edit' && selectedEntry && (
        <JournalEntryEditor
          entry={selectedEntry}
          solDay={solDay}
          onSave={(content) => handleUpdateEntry(selectedEntry.id, content)}
          onCancel={handleBackToTimeline}
        />
      )}

      {currentState === 'view' && selectedEntry && (
        <JournalEntryView
          entry={selectedEntry}
          onEdit={() => handleEditEntry(selectedEntry)}
          onDelete={() => handleDeleteEntry(selectedEntry.id)}
          onBack={handleBackToTimeline}
        />
      )}
    </div>
  );
} 