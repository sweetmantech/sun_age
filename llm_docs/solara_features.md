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
- **Local Storage**: Entries saved locally until preserved
- **Auto-save**: Every 3 seconds to localStorage with user FID + Sol day key
- **Draft Persistence**: Drafts persist across sessions until saved/discarded
- **Preservation**: On-chain storage with client-side encryption
- **Editing**: Can edit local entries, preserved entries create new versions
- **Deletion**: Local entries deletable, preserved entries archived

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
- **Adaptive Layouts**:
  - **Quote Style**: Short entries (< 100 words) with large quotation marks
  - **Full Preview**: Medium entries (100-300 words) with partial text
  - **Truncated**: Long entries (300+ words) with "Read more" CTA
- **Content Elements**:
  ```typescript
  interface JournalShareImage {
    solDay: number;
    date: string;
    content: string; // Truncated appropriately
    userDisplayName: string; // "sol su 🌞"
    userFid: number; // 5543
    username?: string; // "sirsu.eth"
    isPreserved: boolean;
    layout: 'quote' | 'full' | 'truncated' | 'auto';
  }
  ```
- **Traffic Driver**: "Read full reflection on Solara →" CTA
- **Privacy**: Only preserved entries can be shared
- **Branding**: Solara logo, preserved badge, subtle Farcaster logo

#### 4.2 Wisdom Sharing (Phase 2 - Future)
- **Trigger**: "Share to Farcaster" on preserved wisdom
- **Theme**: Cosmic dark theme with space gradients and particles
- **Format**: Auto-formatted cast with Sol day context
- **Template**: 
  ```
  Sol [number] wisdom:
  "[wisdom text]"
  
  Tracking my cosmic journey on @solara
  ```
- **Privacy**: Only preserved wisdom can be shared
- **Tracking**: Mark wisdom as shared, show share count

#### 4.3 Frame Actions
- Cast includes Solara frame for engagement
- Frame buttons: "Start Your Journey", "View Profile"
- Deep links back to Solara mini app

#### 4.4 Entry Reading Interstitial (Mini App Modal)
- **Context**: When users click shared entry links, Mini App opens with modal overlay
- **Modal Design**: Bottom sheet overlay on existing Mini App content (no nested routing)
- **User State Awareness**: Different CTAs based on whether user has calculated Sol age
- **Navigation Flow**:
  ```
  Frame Click → Mini App + Modal → Preview → Full Entry → Back to Preview → Close Modal
  ```

**New User Experience:**
```typescript
interface NewUserModal {
  inspiration: "Ready to start your cosmic journey?";
  subtitle: "Discover how many days you've orbited the sun";
  primaryCTA: "Calculate Your Sol Age";
  secondaryCTA: "Learn More About Solara";
  authorStats: {
    years: number; // Calculated from Sol day
    solDay: number;
  };
}
```

**Existing User Experience:**
```typescript
interface ExistingUserModal {
  inspiration: "Inspired by this reflection?";
  subtitle: "Continue your own cosmic journey";
  primaryCTA: "Add a Reflection";
  secondaryCTA: "View Your Journey";
  userStats: {
    currentSolDay: number;
    entriesPreserved: number;
  };
}
```

**Full Entry Reading with Back Navigation:**
```typescript
// Mini App SDK back button integration
import { useMiniApp } from '@farcaster/miniapps-sdk';

const EntryModal = ({ entryId }: { entryId: string }) => {
  const { back } = useMiniApp();
  const [showFullEntry, setShowFullEntry] = useState(false);
  
  const handleReadFull = () => {
    setShowFullEntry(true); // Internal state change
  };
  
  const handleBackToPreview = () => {
    setShowFullEntry(false); // Internal navigation
  };
  
  const handleCloseModal = () => {
    back(); // Return to previous Farcaster context
  };
  
  return (
    <Modal onClose={handleCloseModal}>
      {showFullEntry ? (
        <FullEntryView 
          onBack={handleBackToPreview} // ← Back to preview button
          entry={entryData}
        />
      ) : (
        <EntryPreview 
          onReadFull={handleReadFull} // Read full reflection →
          entry={entryData}
          userState={userState}
        />
      )}
    </Modal>
  );
};
```

**Modal Implementation Details:**
- **Overlay**: Semi-transparent backdrop over Mini App content
- **Animation**: Slide up from bottom with smooth transitions
- **Gesture**: Swipe down or tap outside to close (calls `back()`)
- **State Management**: Internal modal state for preview ↔ full entry
- **User Detection**: Check if user has calculated Sol age for appropriate CTAs
- **Stats Display**: Show author's cosmic journey context without full profile

### 5. Monetization Implementation

#### 5.1 Pricing Structure [prices are subject to change / adjust]
- **Journal Entry Preservation**: $0.10-0.15 (based on length)
- **Wisdom Preservation**: $0.05-0.08 (shorter content)
- **Bundle Pricing**: "Preserve entry + wisdom for $0.18"
- **Milestone Premium**: +$0.02 for milestone day entries

#### 5.2 Payment Flow
- **Integration**: Farcaster wallet for payments
- **UX**: Clear cost display before preservation
- **Confirmation**: Transaction status and receipt
- **Error Handling**: Graceful payment failure recovery

#### 5.3 Storage Economics
- **On-chain**: Encrypted wisdom hashes and metadata
- **IPFS**: Encrypted full content
- **Local**: Unpreserved entries in browser storage
- **Sync**: Optional encrypted backup for unpreserved content

### 6. Mini Apps SDK Integration

#### 6.1 Required SDK Features
- **Authentication**: Farcaster user authentication via useMiniApp hook
- **Wallet**: Payment processing for preservation
- **Context**: Access to user's Farcaster profile and FID
- **Casting**: Share wisdom to Farcaster timeline
- **Storage**: Secure data persistence

#### 6.2 Authentication & Security
```typescript
// Farcaster Mini Apps authentication
import { useMiniApp } from '@farcaster/miniapps-sdk';

const useFarcasterAuth = () => {
  const { user, isAuthenticated } = useMiniApp();
  
  return {
    userFid: user?.fid,
    isAuthenticated,
    username: user?.username,
    displayName: user?.displayName,
    pfpUrl: user?.pfpUrl
  };
};
```

#### 6.3 Frame Metadata
```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="[wisdom-image-url]" />
<meta property="fc:frame:button:1" content="Start Your Cosmic Journey" />
<meta property="fc:frame:button:2" content="View Wisdom" />
<meta property="fc:frame:post_url" content="[app-url]/api/frame" />
```

### 7. API Endpoints

#### 7.1 Daily Content APIs
```typescript
// Get today's daily content (affirmation + prompts)
GET /api/prompts/today

// Get content for specific date
GET /api/prompts/date/[date]

// Response format
{
  content: {
    date: "2025-06-20",
    primary: {
      type: "affirmation",
      text: "I am exactly where I need to be in my cosmic journey.",
      author: "Abri Mathos",
      id: "uuid"
    },
    secondary: [
      {
        type: "daily_prompt",
        text: "What small moment today reminded you that you're part of something infinite?",
        author: "Abri Mathos", 
        id: "uuid"
      }
      // ... 2 more prompts
    ]
  }
}
```

#### 7.2 Journal APIs (Farcaster-authenticated)
```typescript
// All journal APIs require Farcaster message verification
POST /api/journal/entries - Create journal entry
GET /api/journal/entries - List user's entries
PUT /api/journal/entries/[id] - Update entry
DELETE /api/journal/entries/[id] - Delete entry
POST /api/journal/entries/[id]/preserve - Preserve entry
POST /api/journal/entries/[id]/share - Share to Farcaster

// Authentication middleware
async function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const verified = await verifyFarcasterMessage(authHeader);
  if (!verified.valid) {
    return new Response('Invalid signature', { status: 401 });
  }
  req.userFid = verified.message.data.fid;
  return null;
}
```

#### 7.3 Entry Sharing & Reading APIs
```typescript
// Generate dynamic share image for journal entry
GET /api/journal/entries/[id]/image
// Returns: PNG image (600x400) with light theme, adaptive layout

// Get entry for reading modal (public endpoint for shared entries)
GET /api/journal/entries/[id]/read
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const entryId = params.id;
  
  // Only allow reading of preserved, shareable entries
  const { data: entry } = await supabase
    .from('journal_entries')
    .select(`
      id, sol_day, content, created_at, preservation_status,
      user_profiles!inner (fid, display_name, username)
    `)
    .eq('id', entryId)
    .eq('preservation_status', 'preserved')
    .single();
  
  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }
  
  // Calculate author stats
  const authorAge = Math.floor((Date.now() - new Date(entry.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const authorYears = Math.floor(entry.sol_day / 365.25);
  
  return NextResponse.json({
    entry: {
      id: entry.id,
      solDay: entry.sol_day,
      content: entry.content,
      date: entry.created_at,
      author: {
        displayName: entry.user_profiles.display_name,
        username: entry.user_profiles.username,
        fid: entry.user_profiles.fid,
        years: authorYears
      }
    }
  });
}

// Check user state for modal CTAs
GET /api/user/state
export async function GET(req: NextRequest) {
  const authResult = await authMiddleware(req);
  if (authResult) {
    // Not authenticated - return new user state
    return NextResponse.json({ 
      isNewUser: true,
      hasCalculatedAge: false 
    });
  }
  
  const userFid = req.userFid;
  
  // Check if user has calculated Sol age and has entries
  const { data: userData } = await supabase
    .from('user_profiles')
    .select('sol_age, (journal_entries(count))')
    .eq('fid', userFid)
    .single();
  
  const entryCount = userData?.journal_entries?.[0]?.count || 0;
  
  return NextResponse.json({
    isNewUser: false,
    hasCalculatedAge: !!userData?.sol_age,
    currentSolDay: userData?.sol_age,
    entriesPreserved: entryCount,
    stats: {
      solDay: userData?.sol_age,
      entriesCount: entryCount
    }
  });
}
```

#### 7.4 Wisdom APIs (Phase 2)
```typescript
POST /api/wisdom/extract - Extract wisdom from entry
GET /api/wisdom/list - List user's wisdom
POST /api/wisdom/[id]/preserve - Preserve wisdom
POST /api/wisdom/[id]/share - Share to Farcaster
GET /api/ai/suggest-wisdom - Get AI wisdom suggestions
GET /api/user/wisdom-progress - Get user's progression phase
```

### 8. Technical Implementation Details

#### 8.1 Database Schema (Supabase)
```sql
-- Journal entries table
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid INTEGER NOT NULL,
  sol_day INTEGER NOT NULL,
  content TEXT NOT NULL,
  preservation_status TEXT DEFAULT 'local',
  preservation_tx_hash TEXT,
  word_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  preserved_at TIMESTAMP
);

-- Wisdom extracts table
CREATE TABLE wisdom_extracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES journal_entries(id),
  user_fid INTEGER NOT NULL,
  sol_day INTEGER NOT NULL,
  wisdom_text TEXT NOT NULL,
  extraction_method TEXT NOT NULL,
  ai_confidence DECIMAL,
  preservation_status TEXT DEFAULT 'local',
  share_status TEXT DEFAULT 'private',
  preservation_tx_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  preserved_at TIMESTAMP,
  shared_at TIMESTAMP
);

-- User wisdom progress table
CREATE TABLE user_wisdom_progress (
  user_fid INTEGER PRIMARY KEY,
  current_phase INTEGER DEFAULT 1,
  total_extractions INTEGER DEFAULT 0,
  successful_ai_matches INTEGER DEFAULT 0,
  wisdom_streak INTEGER DEFAULT 0,
  last_extraction_date DATE,
  phase_updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies for security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_extracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wisdom_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data" ON journal_entries
  FOR ALL USING (user_fid = (current_setting('app.current_user_fid'))::integer);
```

#### 8.2 Content Selection Algorithm
```typescript
// Daily content selection (deterministic)
export const selectDailyContent = async (date: Date): Promise<DailyContent> => {
  const dateString = date.toISOString().split('T')[0];
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Check cache first
  let { data: existing } = await supabase
    .from('daily_content_selections')
    .select('*, primary_prompt:daily_prompts!primary_prompt_id(*)')
    .eq('date', dateString)
    .single();
  
  if (existing) return formatDailyContent(existing);
  
  // Generate new selection
  const { data: affirmations } = await supabase
    .from('daily_prompts')
    .select('*')
    .eq('prompt_type', 'affirmation')
    .eq('is_active', true);
  
  const { data: dailyPrompts } = await supabase
    .from('daily_prompts')
    .select('*')
    .eq('prompt_type', 'daily_prompt')
    .eq('is_active', true);
  
  // Select primary affirmation (rotating)
  const primaryIndex = dayOfYear % affirmations.length;
  const primaryPrompt = affirmations[primaryIndex];
  
  // Select 3 secondary prompts (rotating)
  const secondaryPrompts = [];
  for (let i = 0; i < 3; i++) {
    const index = (dayOfYear + i) % dailyPrompts.length;
    secondaryPrompts.push(dailyPrompts[index]);
  }
  
  // Cache the selection
  await supabase.from('daily_content_selections').insert({
    date: dateString,
    primary_prompt_id: primaryPrompt.id,
    secondary_prompt_ids: secondaryPrompts.map(p => p.id)
  });
  
  return formatDailyContent({ primaryPrompt, secondaryPrompts, date: dateString });
};
```

#### 8.3 AI Integration
```javascript
// Wisdom extraction service
class WisdomExtractor {
  async suggestWisdom(entryText, userPhase) {
    const suggestions = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Extract 2-3 profound, shareable one-liners from this journal entry. 
          Focus on universal truths, cosmic perspectives, and personal insights.
          User is in Phase ${userPhase} of wisdom development.
          Return JSON with: text, reasoning, confidence_score`
        },
        { role: "user", content: entryText }
      ]
    });
    
    return suggestions.choices[0].message.content;
  }
  
  async validateUserSelection(selectedText, entryText) {
    // Provide encouragement and validation for user selections
  }
}
```

#### 8.4 Encryption Implementation
```javascript
// Client-side encryption for Farcaster Mini Apps
export const encryptEntryContent = async (content: string, userFid: number): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  
  // Derive key from user FID
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userFid.toString().padStart(32, '0')),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('solara-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  
  // Return base64 encoded encrypted data with IV
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
};
```

### 9. Data Migration & Setup

#### 9.1 CSV Import Script
```typescript
// Import prompts from your CSV file
import Papa from 'papaparse';

export const importPromptsFromCSV = async (csvFilePath: string) => {
  const csvContent = await fs.readFile(csvFilePath, 'utf8');
  
  const parsed = Papa.parse(csvContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  });
  
  for (const row of parsed.data) {
    const promptData = {
      prompt_type: row.prompt_type, // 'affirmation' or 'daily_prompt'
      prompt_description: row.prompt_description,
      prompt_author: row.prompt_author || 'Abri Mathos',
      inspiration_notes: row['for_Inspiration?'] || null,
      is_active: true
    };
    
    await supabase.from('daily_prompts').insert(promptData);
  }
};
```

### 10. User Experience Flow

#### 10.1 First-Time User Journey
1. User lands on Solara from Farcaster
2. Calculate Sol Age, see daily affirmation on dashboard
3. Click affirmation → direct to journal creation with pre-filled prompt
4. Write first entry, guided by daily inspiration
5. AI suggests wisdom extraction (Phase 1 mode)
6. User preserves first wisdom
7. Encouraged to share wisdom to Farcaster
8. Progression tracking begins

#### 10.2 Returning User Experience
1. See Sol Age and fresh daily affirmation on dashboard
2. Navigate to Journal tab, see welcoming empty state or timeline
3. Create new entry with optional daily inspiration
4. Wisdom extraction based on current phase
5. Optional milestone celebration for preserved wisdom

#### 10.3 Writing Flow Psychology
- **Dashboard Inspiration**: Plants seed with daily affirmation
- **Journal Tab**: Provides contemplative space ("library friend")
- **Creation Sheet**: Clean, focused writing environment
- **Optional Prompts**: Available but not intrusive
- **Progress Recognition**: Builds confidence through phases

### 11. Quality Assurance Requirements

#### 11.1 AI Quality Controls
- **Wisdom Validation**: Ensure extracted wisdom is meaningful
- **Content Filtering**: Prevent extraction of sensitive/inappropriate content
- **Length Limits**: Wisdom should be 5-50 words optimal
- **Uniqueness**: Avoid suggesting duplicate wisdom patterns

#### 11.2 User Testing Scenarios
- **New User**: Complete onboarding and first wisdom extraction
- **Phase Progression**: Verify smooth transition between assistance phases
- **Payment Flow**: Test preservation payment and error handling
- **Sharing Flow**: Verify Farcaster integration works correctly
- **Mobile UX**: Ensure text selection and sheet behavior work on mobile
- **Daily Content**: Verify content rotation and consistency

### 12. Performance Requirements

#### 12.1 Response Times
- **Entry Creation**: < 500ms save to local storage
- **AI Suggestions**: < 3 seconds for wisdom extraction
- **Preservation**: < 10 seconds for on-chain storage
- **Timeline Load**: < 1 second for entry list
- **Daily Content**: < 200ms from cache, < 1 second fresh generation

#### 12.2 Scalability Considerations
- **Content Caching**: Cache daily content selections
- **AI Rate Limiting**: Prevent AI abuse with reasonable limits
- **Draft Management**: Clean up old localStorage drafts
- **Image Generation**: Optional wisdom card generation for sharing

### 13. Security & Privacy

#### 13.1 Data Protection
- **Local Entries**: Browser storage only, not transmitted until preservation
- **Preserved Entries**: Client-side encrypted before transmission
- **User Keys**: Derived from Farcaster FID, never stored server-side
- **AI Processing**: Strip PII before sending to AI service
- **Daily Content**: Public content, no user data involved

#### 13.2 Access Controls
- **User Isolation**: Users can only access their own entries via RLS
- **Preservation Verification**: Verify Farcaster payment before permanent storage
- **Share Permissions**: Only preserved wisdom can be shared
- **Audit Trail**: Log all preservation and sharing actions

### 14. Analytics & Insights

#### 14.1 User Metrics
- **Engagement**: Entries per week, wisdom extraction rate
- **Progression**: Phase advancement timing and success
- **Monetization**: Preservation conversion rates
- **Sharing**: Wisdom share rates and viral coefficients
- **Content Usage**: Daily content engagement and preference patterns

#### 14.2 Product Insights
- **AI Accuracy**: User selection vs AI suggestion alignment
- **Content Quality**: Wisdom engagement rates on Farcaster
- **Retention**: User return rates by phase
- **Revenue**: LTV per user, pricing optimization data
- **Daily Content Performance**: Which affirmations/prompts drive most engagement

### 15. Development Phases

#### 15.1 Phase 1: Core Journal & Sharing (MVP)
**Timeline**: 4-6 weeks
**Primary Goal**: Enable users to write, preserve, and share journal entries

**Features Included:**
- ✅ Journal tab with clean timeline view and welcoming empty state
- ✅ Apple-style sheet for journal entry creation
- ✅ Daily affirmations system integrated with dashboard and journal creation
- ✅ Writing prompts drawer (3 daily prompts + 3 generic cosmic prompts)
- ✅ Local storage with auto-save and draft persistence
- ✅ Preservation system with Farcaster wallet integration
- ✅ **Full journal entry sharing** with dynamic light-theme images
- ✅ Adaptive image layouts (quote, full preview, truncated)
- ✅ Daily content rotation algorithm (deterministic)
- ✅ CSV import system for affirmations and prompts
- ✅ Basic user progression tracking foundation
- ✅ Farcaster Mini Apps integration with proper authentication

**Success Metrics:**
- 100+ daily journal entries created
- 40%+ preservation rate on entries
- 20%+ sharing rate on preserved entries
- 70%+ daily affirmation engagement

**Notable Exclusions:**
- ❌ Wisdom extraction (comes in Phase 2)
- ❌ Markdown support (decided against over-engineering)
- ❌ Writing limits (let users find their natural style)

#### 15.2 Phase 2: Wisdom Extraction System
**Timeline**: 6-8 weeks after Phase 1
**Primary Goal**: Enable AI-assisted wisdom curation and sharing

**Features Added:**
- ✅ AI wisdom extraction with 4-phase user progression:
  - **Training Wheels**: AI suggests 3 wisdom options with reasoning
  - **Collaborative**: User highlights + AI suggestions
  - **User-Led**: User highlights first, AI validates
  - **Mastery**: Independent extraction with optional AI enhancement
- ✅ Wisdom-specific dynamic images (cosmic dark theme)
- ✅ "Extract Wisdom" functionality on existing preserved entries
- ✅ Wisdom preservation system (cheaper than full entries)
- ✅ Enhanced Sol Age tab with milestone wisdom display
- ✅ Wisdom sharing to Farcaster with cosmic theme
- ✅ User progression tracking and phase advancement
- ✅ Achievement badges for wisdom mastery

**Migration Strategy:**
- Existing preserved entries become candidates for wisdom extraction
- Users can retroactively extract wisdom from Phase 1 entries
- Dual sharing system: full entries (light) + wisdom (dark)

**Success Metrics:**
- 60%+ of journal entries extract wisdom
- 40%+ of wisdom gets preserved
- 80%+ advance to Phase 2 within 4 weeks
- 25%+ of preserved wisdom gets shared

#### 15.3 Phase 3: Advanced Features & Social
**Timeline**: 3-4 months after Phase 2
**Primary Goal**: Advanced personalization and community features

**Features Added:**
- ✅ Contextual content (midday/evening reflections based on time)
- ✅ Advanced AI personalization and content suggestions
- ✅ Social wisdom discovery (explore wisdom from other users)
- ✅ Personal analytics dashboard with insight patterns
- ✅ Seasonal content rotation and thematic prompts
- ✅ Premium tiers with advanced features
- ✅ Export capabilities (PDF journals, data export)
- ✅ Advanced search and filtering
- ✅ Wisdom collections and curation tools

**Success Metrics:**
- $2-5 ARPU per month
- 60%+ monthly retention rate
- 0.3+ viral coefficient from sharing

### 16. Success Metrics

#### 16.1 Primary KPIs
- **Daily Active Users**: Target 500+ DAU at 3 months
- **Wisdom Extraction Rate**: 60%+ of entries extract wisdom
- **Preservation Rate**: 40%+ of wisdom gets preserved
- **User Progression**: 80%+ advance to Phase 2 within 4 weeks
- **Farcaster Shares**: 25%+ of preserved wisdom gets shared
- **Daily Content Engagement**: 70%+ of users interact with daily affirmations

#### 16.2 Revenue Goals
- **ARPU**: $2-5 per month average revenue per user
- **Conversion**: 70%+ of users preserve at least one item
- **Retention**: 60%+ monthly retention rate
- **Viral Coefficient**: 0.3+ new users per sharing user

---

## Technical Dependencies

### Required Libraries/Services
- **Next.js 14+**: App framework
- **@farcaster/miniapps-sdk**: Frame integration and authentication
- **Supabase**: Database, RLS, and real-time features
- **OpenAI API**: Wisdom extraction AI
- **Web Crypto API**: Client-side encryption
- **Tailwind CSS**: Styling framework
- **Papa Parse**: CSV processing for content import

### Environment Variables
```bash
# Farcaster Mini Apps
NEXT_PUBLIC_MINIAPP_URL=https://your-app.vercel.app
FARCASTER_DEVELOPER_MNEMONIC=your_developer_mnemonic
FARCASTER_DEVELOPER_FID=your_developer_fid

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI & Encryption
OPENAI_API_KEY=your_openai_key
ENCRYPTION_SALT=your_encryption_salt_32_chars

# Blockchain (for preservation)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_id
PRESERVATION_CONTRACT_ADDRESS=your_contract_address
PRESERVATION_PRIVATE_KEY=your_preservation_wallet_key
```

### Deployment Considerations
- **Vercel**: Recommended deployment platform for Mini Apps
- **HTTPS Required**: All Mini Apps must be served over HTTPS
- **Domain Allowlist**: Register domain with Farcaster
- **Frame Headers**: Proper CSP for iframe compatibility
- **Mobile Optimization**: Must work in mobile Farcaster clients
- **Content Delivery**: Efficient delivery of daily content
- **Monitoring**: Error tracking and performance monitoring
- **Backup**: Database backup and recovery procedures

This comprehensive requirements document provides the foundation for implementing the Solara journal and wisdom extraction feature with integrated daily content system within the Farcaster Mini App framework.