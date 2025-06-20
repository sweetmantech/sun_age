"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { JournalEntry } from '~/types/journal';

interface JournalEntryEditorProps {
  entry?: JournalEntry;
  solDay: number;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export default function JournalEntryEditor({
  entry,
  solDay,
  onSave,
  onCancel
}: JournalEntryEditorProps) {
  const [content, setContent] = useState(entry?.content || '');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Auto-save functionality
  useEffect(() => {
    if (!content.trim()) return;

    const autoSaveTimer = setTimeout(() => {
      // Auto-save to local storage only
      try {
        const autoSaveKey = `journal_autosave_${entry?.id || 'new'}`;
        localStorage.setItem(autoSaveKey, content);
        setLastSaved(new Date());
      } catch (err) {
        console.warn('Failed to auto-save:', err);
      }
    }, 3000); // Auto-save every 3 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [content, entry?.id]);

  // Load auto-saved content on mount
  useEffect(() => {
    if (!entry) {
      try {
        const autoSaveKey = 'journal_autosave_new';
        const savedContent = localStorage.getItem(autoSaveKey);
        if (savedContent) {
          setContent(savedContent);
        }
      } catch (err) {
        console.warn('Failed to load auto-saved content:', err);
      }
    }
  }, [entry]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end for editing
      if (entry) {
        textareaRef.current.setSelectionRange(content.length, content.length);
      }
    }
  }, [entry, content.length]);

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Please enter some content before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(content.trim());
      
      // Clear auto-save after successful save
      const autoSaveKey = `journal_autosave_${entry?.id || 'new'}`;
      localStorage.removeItem(autoSaveKey);
    } catch (err) {
      console.error('Failed to save entry:', err);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Clear auto-save
    const autoSaveKey = `journal_autosave_${entry?.id || 'new'}`;
    localStorage.removeItem(autoSaveKey);
    onCancel();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-serif font-bold">
            {entry ? 'Edit Entry' : 'New Entry'}
          </h3>
          <span className="text-xs font-mono text-gray-600">
            Sol {solDay}
          </span>
        </div>
        
        {lastSaved && (
          <span className="text-xs text-gray-500">
            Auto-saved at {formatDate(lastSaved)}
          </span>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-center space-x-2 text-sm text-blue-800">
          <span>🔒</span>
          <span>Private until you choose to preserve</span>
        </div>
      </div>

      {/* Text Editor */}
      <div className="space-y-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts, reflections, or experiences for this Sol day..."
          className="w-full h-64 p-4 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          style={{ fontFamily: 'inherit' }}
        />
        
        {/* Word Count and Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{wordCount} words</span>
          <span>
            {wordCount > 0 && (
              <>
                ~${(wordCount * 0.01).toFixed(2)} to preserve
              </>
            )}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-mono uppercase tracking-widest text-gray-600 hover:text-black transition-colors duration-200"
        >
          Cancel
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="px-4 py-2 text-sm font-mono uppercase tracking-widest bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSaving ? 'Saving...' : 'Save Local'}
          </button>
          
          {content.trim() && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-mono uppercase tracking-widest border border-black text-black hover:bg-black hover:text-white transition-colors duration-200"
            >
              Preserve Forever
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 