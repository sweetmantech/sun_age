"use client";

import React from 'react';
import type { JournalEntry } from '~/types/journal';

interface JournalTimelineProps {
  entries: JournalEntry[];
  onStartWriting: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const PreservationStatus = ({ status }: { status: 'local' | 'preserved' | 'private' }) => {
  const isPreserved = status === 'preserved';
  const color = isPreserved ? 'text-yellow-600' : 'text-gray-500';

  return (
    <div className={`flex items-center text-xs font-mono tracking-widest ${color}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${isPreserved ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
      {status.toUpperCase()}
    </div>
  );
};

export function JournalTimeline({ entries, onStartWriting, onEdit, onDelete }: JournalTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="border border-gray-300 p-6 bg-white/90">
        <div className="text-center font-mono text-xs tracking-widest text-gray-500 mb-6">
          🌞 NO ENTRIES YET 🌞
        </div>
        <h3 className="text-xl font-serif font-bold mb-4">Welcome to the journal.</h3>
        <div className="font-serif text-lg text-gray-800 space-y-4 leading-tight tracking-[-0.02em]">
          <p>
            Every day you visit Solara, you&apos;ll find a daily prompt, an affirmation, or a reflection from our Sol Guide, Abri Mathos. Some days you might be inspired to share something you&apos;ve learned, you felt, you questioned—all are valid here. And sometimes if you feel inclined, you can preserve these reflections so that others may find the wisdom in your journey.
          </p>
          <p>
            Together we may seek the knowledge of the sun.
          </p>
        </div>
        <div className="mt-6 font-serif text-lg text-gray-800">
          <p>Sol Seeker 🌞</p>
          <p>- Su</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="border border-gray-300 p-6 bg-white/90">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-mono text-xs">SOL {entry.sol_day}</h4>
            <PreservationStatus status={entry.preservation_status} />
          </div>
          <p className="text-gray-800 font-serif text-xl mb-6 leading-snug line-clamp-3">
            {entry.content}
          </p>
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest">
            {entry.preservation_status === 'local' ? (
                <div className="flex gap-4">
                    <button className="text-yellow-600 hover:text-yellow-700 underline underline-offset-2">PRESERVE</button>
                    <button onClick={() => onEdit(entry)} className="text-gray-500 hover:text-black underline underline-offset-2">EDIT</button>
                    <button onClick={() => onDelete(entry.id)} className="text-red-500 hover:text-red-700 underline underline-offset-2">DELETE</button>
                </div>
            ) : (
                <div className="flex gap-4">
                    <button className="text-gray-500 hover:text-black underline underline-offset-2">SHARE</button>
                    <button className="text-gray-500 hover:text-black underline underline-offset-2">READ</button>
                </div>
            )}
            <span className="text-gray-500">{entry.word_count} words</span>
          </div>
        </div>
      ))}
    </div>
  );
}