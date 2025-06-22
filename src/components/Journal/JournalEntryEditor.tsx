"use client";

import { useState, useEffect } from 'react';
import { useDailyContent } from '~/hooks/useDailyContent';
import type { JournalEntry } from '~/types/journal';

interface JournalEntryEditorProps {
  entry: JournalEntry;
  onSave: (entryToSave: { id?: string, content: string }) => Promise<void>;
  onFinish: () => void;
}

interface DailyPromptDisplayProps {
    onDismiss: () => void;
}

function DailyPromptDisplay({ onDismiss }: DailyPromptDisplayProps) {
    const { content, isLoading, error } = useDailyContent();

    if (isLoading || error || !content) {
        return null; 
    }

    return (
        <div className="relative mb-4 p-4 border border-gray-200 bg-[#FFFCF2]/50 backdrop-blur-md">
            <button onClick={onDismiss} className="absolute top-2 right-2 text-gray-400 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="text-xs font-semibold tracking-widest text-yellow-700 mb-2">DAILY PROMPT</div>
            <p className="text-black font-serif text-xl tracking-[-0.04em]">{content.primary.text}</p>
        </div>
    );
}

export function JournalEntryEditor({ entry, onSave, onFinish }: JournalEntryEditorProps) {
  const [content, setContent] = useState(entry.content);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showDailyPrompt, setShowDailyPrompt] = useState(true);

  useEffect(() => {
    setContent(entry.content);
  }, [entry]);

  const handleSave = async () => {
    await onSave({ id: entry.id, content });
  };

  const handlePreserve = () => {
    // TODO: Implement preserve logic (on-chain)
    console.log('Preserving entry:', content);
    onFinish();
  };

  const handlePromptClick = (promptText: string | null) => {
    if (!promptText) return;
    setContent(prevContent => {
        if (prevContent.trim() === '') {
            return promptText;
        }
        return prevContent + '\\n\\n' + promptText;
    });
    setShowPrompts(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end">
        {/* Sunrise gradient overlay */}
        <div className="absolute inset-0 bg-solara-sunrise" />
        
        {/* Modal with blur effect */}
        <div className="relative z-10 backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 w-full max-w-md h-[95vh] max-h-[1000px] flex flex-col animate-slide-up">
            
            {/* Scrollable Content Area */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="flex-shrink-0 flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-4xl font-mono">SOL {entry.sol_day}</h3>
                        <p className="text-md text-gray-500 font-mono">{new Date(entry.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onFinish} className="p-2 text-gray-400 hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {showDailyPrompt && <DailyPromptDisplay onDismiss={() => setShowDailyPrompt(false)} />}

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What has your sol revealed to you today?"
                    className="flex-grow w-full bg-transparent text-black placeholder-gray-500/80 p-2 text-2xl font-serif focus:outline-none resize-none tracking-[-0.02em] placeholder:text-2xl placeholder:italic"
                />
            </div>

            {/* Sticky Footer Area */}
            <div className="flex-shrink-0">
                <div className="px-4 pb-4">
                    <div className="text-xs text-center text-gray-600 font-mono border border-gray-300 bg-white/70 py-2 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>PRIVATE UNTIL YOU CHOOSE TO SHARE IT</span>
                    </div>
                </div>
                <div className="bg-white p-4 pb-12 sm:pb-4 border-t border-gray-200">
                    <div className="flex flex-col gap-2">
                        {!showPrompts ? (
                            <button onClick={() => setShowPrompts(true)} className="w-full border border-gray-300 text-gray-500 font-mono py-3 px-2 text-xs tracking-widest hover:bg-gray-100 transition-colors" style={{ backgroundColor: '#FEFDF8' }}>
                                NEED INSPIRATION? TAP FOR PROMPTS
                            </button>
                        ) : (
                            <div className="border border-gray-300 p-4 bg-white relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-mono tracking-widest text-sm text-black">WRITING PROMPTS</h4>
                                    <button onClick={() => setShowPrompts(false)} className="text-gray-400 hover:text-black">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <button onClick={(e) => handlePromptClick(e.currentTarget.textContent)} className="w-full text-left p-3 border border-gray-200 font-serif text-black hover:bg-gray-50" style={{ backgroundColor: '#FEFDF8' }}>
                                        How did this Sol day shape me?
                                    </button>
                                    <button onClick={(e) => handlePromptClick(e.currentTarget.textContent)} className="w-full text-left p-3 border border-gray-200 font-serif text-black hover:bg-gray-50" style={{ backgroundColor: '#FEFDF8' }}>
                                        What patterns am I noticing in my cosmic journey?
                                    </button>
                                    <button onClick={(e) => handlePromptClick(e.currentTarget.textContent)} className="w-full text-left p-3 border border-gray-200 font-serif text-black hover:bg-gray-50" style={{ backgroundColor: '#FEFDF8' }}>
                                        What wisdom emerged from today's orbit?
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="flex-1 border border-black bg-white text-black font-mono py-3 rounded-none hover:bg-gray-100 transition-colors text-sm">
                            SAVE REFLECTION
                            </button>
                            <button onClick={handlePreserve} className="flex-1 border border-black bg-[#d4af37] text-black font-mono py-3 rounded-none hover:bg-[#e6c75a] transition-colors text-sm">
                            PRESERVE FOREVER
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}