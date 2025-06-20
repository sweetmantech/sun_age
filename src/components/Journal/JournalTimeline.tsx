"use client";

import React, { useState } from 'react';
import type { JournalEntry, JournalFilters } from '~/types/journal';

interface JournalTimelineProps {
  entries: JournalEntry[];
  loading: boolean;
  filters: JournalFilters;
  onFiltersChange: (filters: JournalFilters) => void;
  onViewEntry: (entry: JournalEntry) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry) => void;
  onCreateEntry: () => void;
}

export default function JournalTimeline({
  entries,
  loading,
  filters,
  onFiltersChange,
  onViewEntry,
  onEditEntry,
  onDeleteEntry,
  onCreateEntry
}: JournalTimelineProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value });
  };

  const handleFilterChange = (preservation_status: 'all' | 'local' | 'preserved') => {
    onFiltersChange({ ...filters, preservation_status });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPreviewText = (content: string) => {
    const words = content.split(' ');
    if (words.length <= 20) return content;
    return words.slice(0, 20).join(' ') + '...';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 p-4 rounded">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-300">
          {[
            { value: 'all' as const, label: 'All' },
            { value: 'local' as const, label: 'Local' },
            { value: 'preserved' as const, label: 'Preserved' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleFilterChange(filter.value)}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest transition-colors duration-200 ${
                filters.preservation_status === filter.value
                  ? 'border-b-2 border-black font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            {searchTerm || filters.preservation_status !== 'all' 
              ? 'No entries match your filters'
              : 'No journal entries yet'
            }
          </div>
          {!searchTerm && filters.preservation_status === 'all' && (
            <button
              onClick={onCreateEntry}
              className="px-4 py-2 text-sm font-mono uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition-colors duration-200"
            >
              Write Your First Entry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 p-4 rounded hover:border-gray-300 transition-colors duration-200 cursor-pointer"
              onClick={() => onViewEntry(entry)}
            >
              {/* Entry Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-gray-600">
                    Sol {entry.sol_day}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    entry.preservation_status === 'preserved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {entry.preservation_status === 'preserved' ? 'Preserved' : 'Local'}
                  </span>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEntry(entry);
                      }}
                      className="text-xs text-gray-500 hover:text-black transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEntry(entry);
                      }}
                      className="text-xs text-gray-500 hover:text-red-600 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Entry Preview */}
              <div className="text-sm text-gray-800 leading-relaxed">
                {getPreviewText(entry.content)}
              </div>

              {/* Word Count */}
              <div className="mt-2 text-xs text-gray-500">
                {entry.word_count} words
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 