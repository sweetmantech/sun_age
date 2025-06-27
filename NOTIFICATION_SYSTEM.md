# Notification System Integration

This document describes the integrated notification system for the first entry claim feature.

## Overview

The notification system automatically sends Farcaster notifications to users when they share their first journal entry, allowing them to claim 10,000 $SOLAR tokens.

## Database Schema

### New Tables

#### `user_notification_details`
Stores Farcaster notification tokens and URLs for users:
```sql
CREATE TABLE user_notification_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fid INTEGER NOT NULL UNIQUE,
  token TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Updated `claim_notifications`
Enhanced to store more detailed notification data:
```sql
CREATE TABLE claim_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entry_id UUID REFERENCES journal_entries(id),
  share_id UUID REFERENCES journal_shares(id),
  claim_amount INTEGER NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Updated `token_claims`
Added fields to track what triggered the claim:
```sql
CREATE TABLE token_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid INTEGER NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_hash TEXT,
  trigger_entry_id UUID REFERENCES journal_entries(id),
  trigger_share_id UUID REFERENCES journal_shares(id),
  wallet_address TEXT,
  claimed_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### 1. Notification Claim (`POST /api/notifications/claim`)
Creates a notification record and sends Farcaster notification.

**Request:**
```json
{
  "userFid": 12345,
  "entryId": "uuid",
  "shareId": "uuid"
}
```

**Response:**
```json
{
  "sent": true,
  "notificationSent": true,
  "targetUrl": "https://app.com/claim?entry=...&share=..."
}
```

### 2. Webhook Handler (`POST /api/webhook`)
Handles Farcaster webhook events to store notification tokens.

**Events:**
- `frame_added`: User adds the frame
- `notifications_enabled`: User enables notifications

### 3. Claim Verification (`GET /api/journal/claim/verify`)
Checks if a user is eligible to claim tokens.

**Query Parameters:**
- `fid`: User's Farcaster ID
- `entry`: Entry ID
- `share`: Share ID

**Response:**
```json
{
  "eligible": true,
  "amount": 10000,
  "contract": "0x..."
}
```

### 4. Claim Processing (`POST /api/journal/claim`)
Processes the actual token claim.

**Request:**
```json
{
  "userFid": 12345,
  "entryId": "uuid",
  "shareId": "uuid",
  "walletAddress": "0x..."
}
```

### 5. Share Management (`GET /api/journal/share`)
Retrieves user's shares to check if it's their first share.

## Frontend Integration

### 1. Journal Sharing Flow
The notification is triggered automatically in `src/lib/journal.ts`:

```typescript
export async function composeAndShareEntry(entry, sdk, isInFrame, userFid) {
  const result = await shareJournalEntry(entry.id, userFid);
  
  // Trigger notification for first entry claim
  await maybeSendFirstEntryClaimNotification({
    userFid: finalUserFid,
    entryId: entry.id,
    shareId: result.shareId
  });
  
  // ... rest of sharing logic
}
```

### 2. Claim Page (`/claim`)
Users can access this page when they tap the notification:
- Checks eligibility
- Allows wallet address input
- Processes claim
- Shows success/error states

## Helper Functions

### `getNotificationTokenAndUrl(userFid)`
Retrieves notification token and URL for a user.

### `sendFarcasterNotification(userFid, notificationData)`
Sends a Farcaster notification to a user.

## Flow Summary

1. **User shares first entry** → `composeAndShareEntry()` is called
2. **Check if first share** → `maybeSendFirstEntryClaimNotification()` checks share count
3. **Create notification** → `POST /api/notifications/claim` creates DB record
4. **Send Farcaster notification** → `sendFarcasterNotification()` sends to user
5. **User taps notification** → Redirected to `/claim?entry=...&share=...`
6. **Verify eligibility** → `GET /api/journal/claim/verify` checks if eligible
7. **Process claim** → `POST /api/journal/claim` records the claim
8. **Show success** → User sees confirmation

## Testing

Run the test script to verify the system:
```bash
node scripts/test-notification.js
```

## Environment Variables

- `NEXT_PUBLIC_BASE_URL`: Base URL for the application (used in notification URLs)

## Security Considerations

- All endpoints use Row Level Security (RLS) policies
- Notification tokens are stored securely in the database
- Claims are verified before processing
- Users can only claim once per account

## Future Enhancements

- Add notification preferences
- Support for different notification types
- Analytics tracking for notification engagement
- Retry logic for failed notifications 