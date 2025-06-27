"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { composeAndShareEntry } from '~/lib/journal';
import { EntryPreviewModal } from './EntryPreviewModal';

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
  const [readingEntry, setReadingEntry] = useState<JournalEntry | null>(null);
  const [sharingEntry, setSharingEntry] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [devFarcaster, setDevFarcaster] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [preservationFilter, setPreservationFilter] = useState<'all' | 'local' | 'synced' | 'preserved'>('all');
  const { sdk, isInFrame, context, connectManually, loading: frameLoading } = useFrameSDK();
  const [previewEntry, setPreviewEntry] = useState<JournalEntry | null>(null);
  
  // Get userFid from Farcaster context or dev override
  const isDev = process.env.NODE_ENV === 'development';
  const farcasterUserFid = context?.user?.fid;
  const devUserFid = isDev && devFarcaster ? 5543 : undefined;
  const userFid = farcasterUserFid || devUserFid;
  
  const {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    migrateLocalEntries,
    loadEntries
  } = useJournal();

  // Compute local entries from the returned entries
  const localEntries = entries.filter(entry => entry.preservation_status === 'local');

  // Filter entries based on search query and preservation status
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = preservationFilter === 'all' || entry.preservation_status === preservationFilter;
    return matchesSearch && matchesFilter;
  });

  const handleStartWriting = () => {
    setEditingEntry({
      id: '',
      user_fid: userFid || 0,
      sol_day: solAge,
      content: '',
      preservation_status: 'local',
      word_count: 0,
      created_at: new Date().toISOString()
    });
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry({ ...entry });
  };

  const handleSave = async (entryToSave: { id?: string, content: string }) => {
    if (editingEntry && editingEntry.id) {
      await updateEntry(editingEntry.id, { content: entryToSave.content }, userFid);
    } else {
      // Create a new entry and update the editor state with the new entry (so future autosaves update, not create)
      const newEntry = await createEntry({ content: entryToSave.content, sol_day: solAge }, userFid);
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
      deleteEntry(entryToDelete, userFid);
      setEntryToDelete(null);
    }
  };

  const handleMigrateLocalEntries = async () => {
    setIsMigrating(true);
    setMigrationError(null);
    try {
      // Use dev toggle or real context
      if (!userFid) {
        const errorDetails = {
          farcasterUserFid,
          devUserFid,
          hasContext: !!context,
          hasUser: !!context?.user,
          isInFrame,
          isDev,
          devFarcaster
        };
        console.error('[Journal] Migration failed - no userFid available:', errorDetails);
        throw new Error(`You must be connected via Farcaster to migrate entries. Connection state: ${JSON.stringify(errorDetails)}`);
      }
      console.log('[Journal] Attempting to migrate local entries:', localEntries);
      const result = await migrateLocalEntries(userFid);
      console.log('[Journal] Migration result:', result);
      if (result.errors.length > 0) {
        setMigrationError(result.errors.map(e => (typeof e === 'string' ? e : e.message || JSON.stringify(e))).join('\n'));
        console.error('[Journal] Migration errors:', result.errors);
      } else if (result.migrated === 0) {
        setMigrationError('No entries were migrated.');
        console.warn('[Journal] No entries were migrated.');
      } else {
        setMigrationError(null);
        console.log('[Journal] Migration successful. Migrated:', result.migrated);
        // Refresh entries from the database after migration, passing userFid for dev override
        await loadEntries(undefined, userFid);
      }
    } catch (err: any) {
      setMigrationError(err.message || 'Migration failed.');
      console.error('[Journal] Migration failed:', err);
    } finally {
      setIsMigrating(false);
    }
  };

  // Fetch entries from API when userFid changes (for dev toggle)
  useEffect(() => {
    // Debug logging for connection state
    console.log('[Journal] Connection state:', {
      farcasterUserFid,
      devUserFid,
      finalUserFid: userFid,
      hasContext: !!context,
      hasUser: !!context?.user,
      isInFrame,
      isDev,
      devFarcaster
    });

    if (userFid) {
      loadEntries(undefined, userFid); // Load from API with dev override
    } else {
      loadEntries(undefined, undefined); // Load from local storage only
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFid]);

  // Handler to trigger direct share flow for a synced entry
  const handleShare = async (entry: JournalEntry) => {
    setIsSharing(true);
    setShareError(null);
    try {
      console.log('[Journal] Sharing entry:', {
        entryId: entry.id,
        entryUserFid: entry.user_fid,
        devUserFid: userFid,
        preservationStatus: entry.preservation_status
      });
      
      const result = await composeAndShareEntry(entry, sdk, isInFrame, userFid);
      
      console.log('Entry shared successfully');
    } catch (err: any) {
      setShareError(err.message || 'Failed to share entry');
      console.error('Share failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleRead = (entry: JournalEntry) => {
    setPreviewEntry(entry);
  };

  const handleSwitchToEdit = (entry: JournalEntry) => {
    setReadingEntry(null);
    setEditingEntry(entry);
  };

  const handleFilterChange = (filter: 'all' | 'local' | 'synced' | 'preserved') => {
    setPreservationFilter(filter);
  };

  // Handler for "Add a reflection" CTA
  const handleAddReflection = () => {
    setPreviewEntry(null);
    setEditingEntry({
      id: '',
      user_fid: userFid || 0,
      sol_day: solAge,
      content: '',
      preservation_status: 'local',
      word_count: 0,
      created_at: new Date().toISOString()
    });
  };

  // Handler for "View your journey" CTA
  const handleViewJourney = () => {
    setPreviewEntry(null);
    // Navigate to soldash sol age tab (implement navigation as needed)
    window.location.href = '/soldash';
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
        onAutoSave={handleSave}
        onFinish={handleCancel}
        mode="edit"
      />
    );
  }

  if (readingEntry) {
    return (
      <JournalEntryEditor
        entry={readingEntry}
        onSave={handleSave}
        onAutoSave={handleSave}
        onFinish={() => setReadingEntry(null)}
        onEdit={() => handleSwitchToEdit(readingEntry)}
        mode="read"
      />
    );
  }

  // Show the share modal/editor if sharingEntry is set
  if (sharingEntry) {
    return (
      <JournalEntryEditor
        entry={sharingEntry}
        onSave={handleSave}
        onAutoSave={handleSave}
        onFinish={() => setSharingEntry(null)}
        mode="edit"
      />
    );
  }

  // Show the entry preview modal if previewEntry is set
  if (previewEntry) {
    const isOwnEntry =
      previewEntry.preservation_status === 'local' ||
      (!!userFid && previewEntry.user_fid === userFid);
    return (
      <EntryPreviewModal
        entry={previewEntry}
        isOpen={!!previewEntry}
        onClose={() => setPreviewEntry(null)}
        isOwnEntry={isOwnEntry}
        onEdit={() => {
          setEditingEntry({ ...previewEntry });
          setPreviewEntry(null);
        }}
        onShare={() => {
          setPreviewEntry(null);
          handleShare(previewEntry);
        }}
      />
    );
  }

  // Debug: log entries and filteredEntries
  console.log('All entries:', entries);
  console.log('Filtered entries:', filteredEntries);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Dev-only Farcaster toggle */}
      {isDev && (
        <div className="mb-2 flex items-center gap-2 p-2 border border-dashed border-gray-400 bg-yellow-50">
          <label className="font-mono text-xs text-gray-700">
            <input
              type="checkbox"
              checked={devFarcaster}
              onChange={e => setDevFarcaster(e.target.checked)}
              className="mr-2"
            />
            Dev: Use Real FID (5543)
          </label>
        </div>
      )}

      {/* Connection status indicator */}
      {isInFrame && (
        <div className="mb-2 p-2 border border-gray-300 bg-gray-50">
          <div className="font-mono text-xs text-gray-700">
            <div className="flex items-center justify-between">
              <span>FARCASTER STATUS:</span>
              <span className={`font-bold ${userFid ? 'text-green-600' : 'text-red-600'}`}>
                {userFid ? `CONNECTED (FID: ${userFid})` : 'NOT CONNECTED'}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Context: {context ? 'Loaded' : 'Not loaded'} | 
              User: {context?.user ? 'Available' : 'Not available'} | 
              Frame: {isInFrame ? 'Active' : 'Inactive'}
            </div>
            {/* Debug details - only show in development */}
            {isDev && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">Debug Details</summary>
                <pre className="text-xs mt-1 bg-white p-2 border overflow-auto max-h-32">
                  {JSON.stringify({
                    farcasterUserFid,
                    devUserFid,
                    finalUserFid: userFid,
                    hasContext: !!context,
                    hasUser: !!context?.user,
                    contextUser: context?.user,
                    isInFrame,
                    isDev,
                    devFarcaster,
                    frameLoading,
                    contextDetails: context
                  }, null, 2)}
                </pre>
                {isDev && (
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={async () => {
                        try {
                          console.log('[Journal] Testing SDK initialization...');
                          await sdk.actions.ready({ disableNativeGestures: true });
                          console.log('[Journal] SDK ready successful');
                          const frameContext = await sdk.context;
                          console.log('[Journal] Frame context:', frameContext);
                          alert(`SDK test successful!\nContext: ${frameContext ? 'Loaded' : 'Not loaded'}\nUser: ${frameContext?.user ? 'Available' : 'Not available'}\nFID: ${frameContext?.user?.fid || 'None'}`);
                        } catch (err: any) {
                          console.error('[Journal] SDK test failed:', err);
                          alert(`SDK test failed: ${err.message}`);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs px-2 py-1 border"
                    >
                      Test SDK
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          console.log('[Journal] Testing manual connection...');
                          await connectManually();
                          console.log('[Journal] Manual connection successful');
                          alert('Manual connection successful!');
                        } catch (err: any) {
                          console.error('[Journal] Manual connection failed:', err);
                          alert(`Manual connection failed: ${err.message}`);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-mono text-xs px-2 py-1 border ml-1"
                    >
                      Test Connection
                    </button>
                  </div>
                )}
              </details>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center py-4 gap-2">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="SEARCH ENTRIES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-11 bg-white/90 border border-gray-300 text-black placeholder-gray-500 px-4 py-2 text-xs font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 w-11 bg-white/90 border border-gray-300 text-gray-500 hover:text-black flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleStartWriting}
          className="h-11 flex-shrink-0 bg-[#d4af37] text-black font-mono text-xs tracking-widest py-3 px-4 border border-black hover:bg-[#e6c75a] transition-colors"
        >
          + NEW
        </button>
      </div>

      {/* Filter dropdown */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white/90 border border-gray-300">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 text-xs font-mono tracking-widest border transition-colors ${
                preservationFilter === 'all'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => handleFilterChange('local')}
              className={`px-3 py-1 text-xs font-mono tracking-widest border transition-colors ${
                preservationFilter === 'local'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              LOCAL
            </button>
            <button
              onClick={() => handleFilterChange('synced')}
              className={`px-3 py-1 text-xs font-mono tracking-widest border transition-colors ${
                preservationFilter === 'synced'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              SYNCED
            </button>
            <button
              onClick={() => handleFilterChange('preserved')}
              className={`px-3 py-1 text-xs font-mono tracking-widest border transition-colors ${
                preservationFilter === 'preserved'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              PRESERVED
            </button>
          </div>
        </div>
      )}

      {/* Migration notice for local entries */}
      {localEntries.length > 0 && userFid && (
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
      {localEntries.length > 0 && !userFid && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200">
          <div className="text-center">
            <h4 className="font-mono text-sm text-blue-800 mb-1">
              LOCAL ENTRIES DETECTED
            </h4>
            <p className="text-xs text-blue-700 mb-3">
              You have {localEntries.length} {localEntries.length === 1 ? 'entry' : 'entries'} stored locally. 
              Connect via Farcaster to migrate them to the database and enable sharing.
            </p>
            {isInFrame && (
              <button
                onClick={async () => {
                  try {
                    await connectManually();
                  } catch (err: any) {
                    console.error('Manual connection failed:', err);
                    alert(`Connection failed: ${err.message}`);
                  }
                }}
                disabled={frameLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-mono text-xs tracking-widest py-2 px-3 border border-blue-700"
              >
                {frameLoading ? 'CONNECTING...' : 'CONNECT FARCASTER'}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Share error feedback */}
      {shareError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200">
          <div className="text-red-700 font-mono text-xs">
            SHARE ERROR: {shareError}
          </div>
        </div>
      )}
      
      {entries.length > 0 ? (
        <JournalTimeline 
          entries={filteredEntries} 
          onEdit={handleEdit} 
          onDelete={handleDeleteRequest} 
          onStartWriting={handleStartWriting} 
          onShare={handleShare} 
          onRead={handleRead} 
        />
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