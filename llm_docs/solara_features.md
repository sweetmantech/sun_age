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
Write Entry → Extract Wisdom → Preserve → Share to Farcaster
```

## Feature Requirements

### 1. Journal Tab Enhancement

#### 1.1 Journal Timeline View (Default)
- **Layout**: Minimal timeline showing journal entries chronologically
- **Entry Display**:
  - Sol day number (e.g., "Sol 11,452")
  - Entry preview (first 2-3 lines)
  - Preservation status indicator (local vs preserved)
  - Entry actions: Preserve, Extract Wisdom, Edit, Delete
- **Floating Action**: "+" button for new entries
- **Search**: Simple text search across all entries
- **Filtering**: Local vs Preserved entries toggle

#### 1.2 Journal Entry Creation
- **Trigger**: Floating "+" button or empty state CTA
- **UI**: Full-screen overlay with:
  - Current Sol day and date context
  - Large text area for journal entry
  - Privacy notice: "🔒 Private until you choose to share"
  - Auto-save to local storage (every 3 seconds)
  - Bottom actions: "Save Local" (free) vs "Preserve Forever" ($0.10-15)
  - Word count and preservation cost estimate

#### 1.3 Entry Management
- **Local Storage**: Entries saved locally until preserved
- **Preservation**: On-chain storage with encryption
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

#### 4.1 Wisdom Sharing
- **Trigger**: "Share to Farcaster" on preserved wisdom
- **Format**: Auto-formatted cast with Sol day context
- **Template**: 
  ```
  Sol [number] wisdom:
  "[wisdom text]"
  
  Tracking my cosmic journey on @solara
  ```
- **Privacy**: Only preserved wisdom can be shared
- **Tracking**: Mark wisdom as shared, show share count

#### 4.2 Frame Actions
- Cast includes Solara frame for engagement
- Frame buttons: "Start Your Journey", "View Profile"
- Deep links back to Solara mini app

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
- **Authentication**: Farcaster user authentication
- **Wallet**: Payment processing for preservation
- **Context**: Access to user's Farcaster profile
- **Casting**: Share wisdom to Farcaster timeline
- **Storage**: Secure data persistence

#### 6.2 Frame Metadata
```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="[wisdom-image-url]" />
<meta property="fc:frame:button:1" content="Start Your Cosmic Journey" />
<meta property="fc:frame:button:2" content="View Wisdom" />
<meta property="fc:frame:post_url" content="[app-url]/api/frame" />
```

### 7. Technical Implementation Details

#### 7.1 Database Schema (Supabase)
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
```

#### 7.2 API Endpoints
```
POST /api/journal/entries - Create journal entry
GET /api/journal/entries - List user's entries
PUT /api/journal/entries/[id] - Update entry
DELETE /api/journal/entries/[id] - Delete entry
POST /api/journal/entries/[id]/preserve - Preserve entry

POST /api/wisdom/extract - Extract wisdom from entry
GET /api/wisdom/list - List user's wisdom
POST /api/wisdom/[id]/preserve - Preserve wisdom
POST /api/wisdom/[id]/share - Share to Farcaster

GET /api/ai/suggest-wisdom - Get AI wisdom suggestions
GET /api/user/wisdom-progress - Get user's progression phase
```

#### 7.3 AI Integration
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

#### 7.4 Encryption Implementation
```javascript
// Client-side encryption before storage
class EntryEncryption {
  async encryptEntry(content, userKey) {
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(12)) },
      userKey,
      new TextEncoder().encode(content)
    );
    return encrypted;
  }
  
  async decryptEntry(encryptedData, userKey) {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: encryptedData.iv },
      userKey,
      encryptedData.data
    );
    return new TextDecoder().decode(decrypted);
  }
}
```

### 8. User Experience Flow

#### 8.1 First-Time User Journey
1. User lands on Solara from Farcaster
2. Calculate Sol Age, explore milestones
3. Prompted to create first journal entry
4. AI suggests wisdom extraction (Phase 1 mode)
5. User preserves first wisdom
6. Encouraged to share wisdom to Farcaster
7. Progression tracking begins

#### 8.2 Returning User Experience
1. See Sol Age and any new milestones
2. Journal tab shows previous entries
3. Gentle nudge for new reflection
4. Wisdom extraction based on current phase
5. Optional milestone celebration for preserved wisdom

#### 8.3 Wisdom Master Journey
1. Advanced users get minimal AI assistance
2. Focus shifts to wisdom curation and sharing
3. Achievement badges for consistent extraction
4. Recognition as wisdom contributor to community

### 9. Quality Assurance Requirements

#### 9.1 AI Quality Controls
- **Wisdom Validation**: Ensure extracted wisdom is meaningful
- **Content Filtering**: Prevent extraction of sensitive/inappropriate content
- **Length Limits**: Wisdom should be 5-50 words optimal
- **Uniqueness**: Avoid suggesting duplicate wisdom patterns

#### 9.2 User Testing Scenarios
- **New User**: Complete onboarding and first wisdom extraction
- **Phase Progression**: Verify smooth transition between assistance phases
- **Payment Flow**: Test preservation payment and error handling
- **Sharing Flow**: Verify Farcaster integration works correctly
- **Mobile UX**: Ensure text selection works on mobile devices

### 10. Performance Requirements

#### 10.1 Response Times
- **Entry Creation**: < 500ms save to local storage
- **AI Suggestions**: < 3 seconds for wisdom extraction
- **Preservation**: < 10 seconds for on-chain storage
- **Timeline Load**: < 1 second for entry list

#### 10.2 Scalability Considerations
- **Caching**: Cache AI suggestions for similar content
- **Rate Limiting**: Prevent AI abuse with reasonable limits
- **Data Archival**: Archive old local entries after preservation
- **Image Generation**: Optional wisdom card generation for sharing

### 11. Security & Privacy

#### 11.1 Data Protection
- **Local Entries**: Browser storage only, not transmitted
- **Preserved Entries**: Encrypted before transmission
- **User Keys**: Derived from Farcaster wallet, never stored
- **AI Processing**: Strip PII before sending to AI service

#### 11.2 Access Controls
- **User Isolation**: Users can only access their own entries
- **Preservation Verification**: Verify payment before permanent storage
- **Share Permissions**: Only preserved wisdom can be shared
- **Audit Trail**: Log all preservation and sharing actions

### 12. Analytics & Insights

#### 12.1 User Metrics
- **Engagement**: Entries per week, wisdom extraction rate
- **Progression**: Phase advancement timing and success
- **Monetization**: Preservation conversion rates
- **Sharing**: Wisdom share rates and viral coefficients

#### 12.2 Product Insights
- **AI Accuracy**: User selection vs AI suggestion alignment
- **Content Quality**: Wisdom engagement rates on Farcaster
- **Retention**: User return rates by phase
- **Revenue**: LTV per user, pricing optimization data

### 13. Launch Strategy

#### 13.1 MVP Scope (Phase 1)
- Basic journal entry creation and storage
- AI wisdom extraction (training wheels mode)
- Simple preservation with fixed pricing
- Basic Farcaster sharing
- Essential user progression tracking

#### 13.2 Future Enhancements
- **Advanced AI**: Better wisdom quality and personalization
- **Social Features**: Wisdom discovery from other users
- **Premium Tiers**: Advanced features for power users
- **Analytics**: Personal insights and pattern recognition
- **Integrations**: Export to other platforms, API access

### 14. Success Metrics

#### 14.1 Primary KPIs
- **Daily Active Users**: Target 500+ DAU at 3 months
- **Wisdom Extraction Rate**: 60%+ of entries extract wisdom
- **Preservation Rate**: 40%+ of wisdom gets preserved
- **User Progression**: 80%+ advance to Phase 2 within 4 weeks
- **Farcaster Shares**: 25%+ of preserved wisdom gets shared

#### 14.2 Revenue Goals
- **ARPU**: $2-5 per month average revenue per user
- **Conversion**: 70%+ of users preserve at least one item
- **Retention**: 60%+ monthly retention rate
- **Viral Coefficient**: 0.3+ new users per sharing user

---

## Technical Dependencies

### Required Libraries/Services
- **Next.js 14+**: App framework
- **Farcaster Mini Apps SDK**: Frame integration
- **Supabase**: Database and authentication
- **OpenAI API**: Wisdom extraction AI
- **Crypto API**: Client-side encryption
- **Tailwind CSS**: Styling framework

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_FARCASTER_APP_URL=
ENCRYPTION_SALT=
WISDOM_AI_MODEL=gpt-4
PAYMENT_WEBHOOK_SECRET=
```

### Deployment Considerations
- **Vercel**: Recommended deployment platform
- **Edge Functions**: For real-time AI processing
- **CDN**: For static assets and images
- **Monitoring**: Error tracking and performance monitoring
- **Backup**: Database backup and recovery procedures

This comprehensive requirements document provides the foundation for implementing the Solara journal and wisdom extraction feature within the existing Farcaster Mini App framework.