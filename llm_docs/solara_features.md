# Solara Journal + Wisdom Feature Requirements

## Overview
Implement journal entry creation and wisdom extraction within Solara's existing Farcaster Mini App structure, using progressive AI assistance to build user confidence in wisdom curation.

## Special Note
UI treatment will be provided. The minimal approach listed in this document is mainly there to act as a reminder to simplify and not overcomplicate the look, feel, and flow of the feature set. Let's use best practices and reuse components when necessary to create a cohesive experience that users can enjoy.

## Technical Context
- **Platform**: Farcaster Frame/Mini App
- **Framework**: Next.js with Mini Apps SDK
- **Storage**: Supabase + On-chain preservation (pay-per-use)
- **Existing Tabs**: Sol Age, Vows, Journal, Sol Signature

## Core User Flow
```
Dashboard Inspiration → Write Entry → Extract Wisdom → Preserve → Share to Farcaster
```

## Daily Prompts & Affirmations System

### 1. Content Management

#### 1.1 Content Types & Priority
- **Primary Content**: Affirmations (featured prominently on dashboard)
- **Secondary Content**: Daily prompts (integrated into writing experience)
- **Future Content**: Midday reflections, evening reflections (structure ready)

#### 1.2 Daily Content Structure
```javascript
interface DailyContent {
  date: string;
  primary: {
    type: 'affirmation';
    text: string;
    author: string; // "Abri Mathos"
    id: string;
  };
  secondary: Array<{
    type: 'daily_prompt';
    text: string;
    author: string;
    id: string;
  }>; // Limited to 3 per day
}
```

#### 1.3 Content Rotation Strategy
- **Affirmations**: Daily rotation through collection based on day of year
- **Daily Prompts**: 3 prompts per day (reduced from 4 to stretch content)
- **Deterministic**: Same date always shows same content for consistency
- **Content Longevity**: Optimized to maximize usage of existing high-quality content

### 2. Database Schema - Daily Content

```sql
-- Daily prompts/affirmations table
CREATE TABLE daily_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('affirmation', 'daily_prompt', 'midday_reflection', 'evening_reflection')),
  prompt_description TEXT NOT NULL,
  prompt_author TEXT DEFAULT 'Abri Mathos',
  inspiration_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily content selections (caching layer)
CREATE TABLE daily_content_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  primary_prompt_id UUID REFERENCES daily_prompts(id),
  secondary_prompt_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_prompts_type ON daily_prompts(prompt_type);
CREATE INDEX idx_daily_prompts_active ON daily_prompts(is_active);
CREATE UNIQUE INDEX idx_daily_content_date ON daily_content_selections(date);
```

## Feature Requirements

### 1. Journal Tab Enhancement

#### 1.1 Journal Timeline View (Default)
- **Layout**: Clean, minimal timeline showing journal entries chronologically
- **Empty State**: "Library friend" welcoming tone with invitation to write
  ```
  Welcome to the journal.
  
  Every day you visit Solara, you'll find a daily prompt, 
  an affirmation, or a reflection from our Sol Guide, 
  Abri Mathos. Some days you might be inspired to 
  share something you've learned, you felt, you 
  questioned—all are valid here. And sometimes if you 
  feel inclined, you can preserve these reflections so 
  that others may find the wisdom in your journey.
  
  Together we may seek the knowledge of the sun.
  
  Sol Seeker 🌞
  ~ Su
  ```
- **Entry Display**:
  - Sol day number (e.g., "Sol 11,452")
  - Entry preview (first 2-3 lines)
  - Preservation status indicator (local vs preserved)
  - Entry actions: Preserve, Extract Wisdom, Edit, Delete
- **Floating Action**: "+" button for new entries
- **Search**: Simple text search across all entries
- **Filtering**: Local vs Preserved entries toggle

#### 1.2 Journal Entry Creation (Apple-Style Sheet)
- **Presentation**: Bottom sheet with 90% screen height (not full modal)
- **Trigger**: Floating "+" button, empty state CTA, or dashboard daily prompt link
- **Sheet Structure**:
  ```
  ┌─────────────────────────────┐
  │ Header: "New Reflection"    │
  ├─────────────────────────────┤
  │ Sol Context: "Sol 11,452"   │
  │ Date: "June 20, 2025"       │
  ├─────────────────────────────┤
  │ Daily Inspiration Bar       │ ← Dismissible
  │ (Today's affirmation)       │
  ├─────────────────────────────┤
  │ Privacy Notice              │
  │ Large Writing Area          │
  │ (Clean, focused)            │
  ├─────────────────────────────┤
  │ Prompts Drawer (Hidden)     │ ← Toggle access
  ├─────────────────────────────┤
  │ Actions: Save | Preserve    │
  └─────────────────────────────┘
  ```

#### 1.3 Daily Inspiration Integration
- **Dashboard Prompt Link**: Direct link from dashboard affirmation to journal creation
- **Dismissible Bar**: Daily affirmation appears at top of creation sheet
- **Click to Use**: Tapping affirmation auto-fills textarea with formatted prompt
- **Clear Dismiss**: Obvious × button to remove inspiration bar entirely
- **Clean Writing Space**: Writing area gets maximum screen real estate

#### 1.4 Writing Prompts Drawer
- **Access**: "Need inspiration? Tap for prompts" toggle button
- **Content Mix**: Strategic blend of daily content and generic prompts
- **Drawer Layout**:
  ```
  ┌─────────────────────────────┐
  │ Today's Affirmation         │ ← Featured
  │ [Primary affirmation]       │
  ├─────────────────────────────┤
  │ Reflection Starters         │
  │ [Daily prompt 1]            │ ← Your content
  │ [Generic cosmic prompt 1]   │ ← Fallback
  │ [Generic cosmic prompt 2]   │ ← Fallback
  ├─────────────────────────────┤
  │ Deeper Exploration          │
  │ [Daily prompt 2]            │ ← Your content
  │ [Daily prompt 3]            │ ← Your content
  │ [Generic cosmic prompt 3]   │ ← Fallback
  └─────────────────────────────┘
  ```

#### 1.5 Entry Management
- **Local Storage First**: Entries are saved to `localStorage` by default. This is private to the user.
- **Auto-save**: Entries are auto-saved to `localStorage` every few seconds.
- **Preservation (Opt-in)**: Users can explicitly choose to "Preserve" an entry, which saves it to the Supabase database. This is a user-initiated action.
- **Editing**: Local entries can be edited freely. Preserved entries are more complex (TBD: versioning vs. overwriting).
- **Deletion**: Local entries can be deleted. Deleting preserved entries requires confirmation.

### 2. Wisdom Extraction System

#### 2.1 Progressive AI Assistance (4 Phases)

**Phase 1: AI Training Wheels (First 2 weeks)**
- AI analyzes entry and suggests 3 wisdom options
- Each suggestion shows reasoning ("Shows growth", "Universal truth")
- User selects favorite option
- Positive reinforcement: "Great choice! This captures..."
- Goal: Pattern recognition training

**Phase 2: Collaborative (Weeks 3-8)**
- User can highlight text OR choose from AI suggestions
- AI validates user selections: "Great eye! This is profound"
- If user picks same as AI: "You're developing great instincts"
- AI suggestions become secondary options
- Goal: Build confidence in user judgment

**Phase 3: User-Led (Weeks 9-24)**
- User highlights first, AI provides validation
- AI occasionally suggests: "You might have missed this gem too"
- User becomes primary curator, AI supportive coach
- Goal: User ownership and mastery

**Phase 4: Wisdom Mastery (6+ months)**
- User extracts independently
- AI provides optional enhancement suggestions
- User recognized as "wisdom master" with achievement badges
- Goal: Complete user autonomy

#### 2.2 Wisdom Extraction UI
- **Trigger**: "Extract Wisdom" button on journal entries
- **Modal Interface**:
  - Phase indicator (builds progression awareness)
  - Confidence building message
  - Text selection interface (Phase 2+)
  - AI suggestions with reasoning
  - Selected wisdom preview
  - Actions: Cancel, Preserve Wisdom
  - Cost: $0.05-08 for wisdom preservation

#### 2.3 Wisdom Data Structure
```javascript
{
  id: string,
  journalEntryId: string,
  solDay: number,
  wisdomText: string,
  extractionMethod: 'ai' | 'user' | 'collaborative',
  aiConfidence: number,
  preservationStatus: 'local' | 'preserved',
  shareStatus: 'private' | 'shared',
  createdAt: timestamp,
  preservedAt: timestamp
}
```

### 3. Sol Age Tab Integration

#### 3.1 Milestone Wisdom Display
- Show wisdom created on milestone days
- Special highlighting for milestone wisdom
- "Your wisdom from Sol 10,000: '[wisdom text]'"
- Link to view full journal entry

#### 3.2 Wisdom Streak Tracking
- Display current wisdom extraction streak
- "7 days of cosmic insights"
- Monthly wisdom summary

### 4. Farcaster Integration

#### 4.1 Journal Entry Sharing (Phase 1)
- **Trigger**: "Share to Farcaster" on preserved journal entries
- **Dynamic Images**: Server-side image generation using mini-app-img-next
- **Theme**: Light minimal theme with clean white background
- **Metadata**: Embeds link to full wisdom on Solara
- **Call to Action**: "Extract your own wisdom"

#### 4.2 On-Chain Preservation (Phase 2)
- **Trigger**: "Preserve on-chain" from wisdom detail view
- **Mechanism**: Use Base L2 for low-cost transactions
- **Data Storage**: Store wisdom hash and metadata on-chain
- **User Control**: User owns the on-chain record

## Implementation Status & Next Steps

### Completed
- **Journal UI**: The main UI for the journal timeline, entry editor, and empty state are complete.
- **Local-First CRUD**: Full Create, Read, Update, and Delete functionality for journal entries is implemented using `localStorage`.
- **Search**: Client-side search for journal entries is functional.
- **SSR Bug Fix**: Resolved critical issue with `WagmiProvider` causing 404s on page refresh.
- **Daily Content**: We have a daily content system (`src/hooks/useDailyContent.ts`) that fetches prompts from a Supabase table. The schema for this is in `database/daily_content_schema.sql`.

### Next Steps / To-Do
- **Implement "Preserve" to Database**: Currently, all journal entries are local-only. We need to implement the "Preserve" functionality which allows a user to explicitly save (or "pin") a journal entry to the Supabase backend. This involves calling our existing `POST /api/journal/entries` endpoint.
- **Implement "Share"**: Add functionality to share a preserved journal entry. The method (e.g., Farcaster Frame, on-chain transaction) is TBD.
- **Milestone Integration**: Integrate journal entries with user milestones.
- **Settings/Data Management**: Allow users to export or delete all their local and preserved data.

## Metrics for Success
- **Adoption**: 25%+ of MAUs create at least one journal entry
- **Engagement**: 50%+ of journal users extract wisdom at least once
- **Retention**: 60%+ monthly retention rate
- **Viral Coefficient**: 0.3+ new users per sharing user

---

This comprehensive requirements document provides the foundation for implementing the Solara journal and wisdom extraction feature with integrated daily content system within the Farcaster Mini App framework. 