"use client";

import React from 'react';
import type { JournalEntry } from '~/types/journal';

interface JournalEntryViewProps {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function JournalEntryView({
  entry,
  onEdit,
  onDelete,
  onBack
}: JournalEntryViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      onDelete();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-serif font-bold">Journal Entry</h3>
          <span className="text-xs font-mono text-gray-600">
            Sol {entry.sol_day}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded ${
            entry.preservation_status === 'preserved'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {entry.preservation_status === 'preserved' ? 'Preserved' : 'Local'}
          </span>
        </div>
      </div>

      {/* Entry Content */}
      <div className="space-y-4">
        {/* Date and Time */}
        <div className="text-xs text-gray-500">
          {formatDate(entry.created_at)}
        </div>

        {/* Content */}
        <div className="p-4 border border-gray-200 rounded bg-white">
          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {entry.content}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{entry.word_count} words</span>
          {entry.preservation_status === 'local' && (
            <span>~${(entry.word_count * 0.01).toFixed(2)} to preserve</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="text-xs font-mono uppercase tracking-widest text-gray-600 hover:text-black transition-colors duration-200"
        >
          ← Back to Timeline
        </button>
        
        <div className="flex space-x-2">
          {entry.preservation_status === 'local' && (
            <>
              <button
                onClick={onEdit}
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest border border-gray-300 text-gray-700 hover:border-black hover:text-black transition-colors duration-200"
              >
                Edit
              </button>
              
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest border border-red-300 text-red-700 hover:border-red-600 hover:text-red-800 transition-colors duration-200"
              >
                Delete
              </button>
            </>
          )}
          
          {entry.preservation_status === 'local' && (
            <button
              onClick={() => {
                // TODO: Implement wisdom extraction
                alert('Wisdom extraction coming soon!');
              }}
              className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition-colors duration-200"
            >
              Extract Wisdom
            </button>
          )}
          
          {entry.preservation_status === 'preserved' && (
            <button
              onClick={() => {
                // TODO: Implement sharing to Farcaster
                alert('Sharing to Farcaster coming soon!');
              }}
              className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition-colors duration-200"
            >
              Share to Farcaster
            </button>
          )}
        </div>
      </div>

      {/* Wisdom Section (placeholder for future feature) */}
      {entry.preservation_status === 'preserved' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-sm text-yellow-800">
            <div className="font-semibold mb-2">✨ Wisdom Extracted</div>
            <div className="text-gray-600">
              Wisdom extraction feature coming soon! You'll be able to extract profound insights from your preserved entries.
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 