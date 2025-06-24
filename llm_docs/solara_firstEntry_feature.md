# Solara $SOLAR Token Claim System Requirements

## Overview
Implement a one-time token reward system that incentivizes first-time users to complete their journal entry and share it, claiming 10,000 $SOLAR tokens upon completion.

## Technical Context
- **Platform**: Farcaster Frame/Mini App
- **Framework**: Next.js with Mini Apps SDK
- **Token**: $SOLAR (10,000 tokens per claim)
- **Contract**: `0x746042147240304098C837563aAEc0F671881B07`
- **Integration**: Temporary sharing system for local journal entries

## Core User Flow
```
Write First Entry → Share Entry (48h temp) → Notification Appears → Tap Notification → 
Mini App Opens → Claim Modal → Background Transaction → Success Message → Close Modal
```

## Feature Requirements

### 1. Token Claim Eligibility

#### 1.1 Eligibility Criteria
```typescript
interface ClaimEligibility {
  requirements: {
    firstEntry: "User must complete their first journal entry";
    firstShare: "User must share that entry (temporary or permanent)";
    oneTimeOnly: "One claim per Farcaster account (user_fid)";
    shareActive: "Share must be successfully created";
  };
  
  verification: {
    userFid: "Verify unique Farcaster account";
    entryExists: "Confirm entry was created and shared";
    claimStatus: "Check if user has already claimed";
    walletConnected: "Ensure user has connected wallet";
  };
}
```

#### 1.2 Claim Trigger Conditions
```typescript
const triggerClaim = async (entryId: string, shareId: string, userFid: number) => {
  // 1. Verify entry was created
  const entry = await getJournalEntry(entryId, userFid);
  if (!entry) throw new Error('Entry not found');
  
  // 2. Verify share was successful
  const share = await getShareRecord(shareId);
  if (!share || share.user_fid !== userFid) throw new Error('Share invalid');
  
  // 3. Check if user already claimed
  const existingClaim = await getTokenClaim(userFid);
  if (existingClaim) throw new Error('Already claimed');
  
  // 4. User is eligible for claim
  return { eligible: true, entryId, shareId };
};
```

### 2. Notification System

#### 2.1 Notification Trigger
- **When**: Immediately after successful share creation
- **Frequency**: One-time only per user
- **Persistence**: Notification remains until claimed or dismissed

#### 2.2 Notification Content
```typescript
interface ClaimNotification {
  title: "🎉 Cosmic Achievement Unlocked!";
  message: "You've shared your first reflection. Claim your 10,000 $SOLAR tokens.";
  action: "Claim Tokens";
  
  metadata: {
    userId: number; // Farcaster FID
    entryId: string;
    shareId: string;
    claimAmount: 10000;
  };
}
```

#### 2.3 Notification Implementation
```typescript
// Farcaster notification integration
const sendClaimNotification = async (userFid: number, claimData: ClaimData) => {
  // Use Farcaster's notification system
  const notification = {
    recipient: userFid,
    type: 'token_claim',
    title: "🎉 Cosmic Achievement Unlocked!",
    body: "You've shared your first reflection. Claim your 10,000 $SOLAR tokens.",
    data: {
      action: 'claim_tokens',
      entry_id: claimData.entryId,
      share_id: claimData.shareId,
      amount: 10000
    }
  };
  
  await farcaster.sendNotification(notification);
};
```

### 3. Claim Modal Interface

#### 3.1 Modal Trigger
```typescript
// When user taps notification
const handleNotificationTap = (notificationData: ClaimNotificationData) => {
  // 1. Open Mini App
  window.open(`${MINI_APP_URL}/claim`, '_self');
  
  // 2. Pass claim data via URL params
  const claimUrl = `${MINI_APP_URL}/claim?entry=${notificationData.entryId}&share=${notificationData.shareId}`;
  
  // 3. Mini App opens with claim modal
};
```

#### 3.2 Claim Modal Design
```typescript
interface ClaimModalContent {
  header: {
    title: "Cosmic Achievement Unlocked!";
    icon: "🎉";
    closeButton: "× (dismisses modal)";
  };
  
  content: {
    achievement: "You've successfully shared your first cosmic reflection";
    reward: "Claim your 10,000 $SOLAR tokens";
    context: "Continue your journey by writing more reflections";
  };
  
  tokenDisplay: {
    amount: "10,000";
    symbol: "$SOLAR";
    contract: "0x746042147240304098C837563aAEc0F671881B07";
    visual: "Large, celebratory token amount display";
  };
  
  actions: {
    primary: "Claim 10,000 $SOLAR";
    secondary: "Learn About $SOLAR";
    dismiss: "Maybe Later";
  };
}
```

#### 3.3 Modal Implementation
```typescript
const ClaimModal = ({ entryId, shareId }: ClaimModalProps) => {
  const { user } = useMiniApp();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  
  const handleClaim = async () => {
    setClaiming(true);
    try {
      // 1. Verify eligibility
      const eligibility = await verifyClaimEligibility(user.fid, entryId, shareId);
      if (!eligibility.eligible) throw new Error('Not eligible');
      
      // 2. Process claim in background
      const claimResult = await processClaim({
        userFid: user.fid,
        entryId,
        shareId,
        amount: 10000,
        contractAddress: '0x746042147240304098C837563aAEc0F671881B07'
      });
      
      // 3. Show success state
      setClaimed(true);
      
    } catch (error) {
      // Handle errors gracefully
      showErrorMessage(error.message);
    } finally {
      setClaiming(false);
    }
  };
  
  if (claimed) {
    return <SuccessModal claimResult={claimResult} />;
  }
  
  return (
    <Modal>
      <ClaimContent onClaim={handleClaim} claiming={claiming} />
    </Modal>
  );
};
```

### 4. Token Distribution System

#### 4.1 Background Transaction Processing
```typescript
interface TokenDistribution {
  contract: "0x746042147240304098C837563aAEc0F671881B07";
  amount: 10000;
  recipient: string; // User's wallet address from Farcaster
  
  process: {
    verification: "Verify claim eligibility";
    transaction: "Execute token transfer";
    confirmation: "Wait for blockchain confirmation";
    notification: "Update user with success/failure";
  };
}

const processClaim = async (claimData: ClaimData) => {
  // 1. Get user's wallet address
  const userWallet = await getUserWalletAddress(claimData.userFid);
  
  // 2. Prepare transaction
  const transaction = {
    to: userWallet,
    amount: 10000,
    contract: '0x746042147240304098C837563aAEc0F671881B07',
    data: encodeTransferCall(userWallet, 10000)
  };
  
  // 3. Execute transaction
  const txHash = await executeTokenTransfer(transaction);
  
  // 4. Record claim in database
  await recordTokenClaim({
    user_fid: claimData.userFid,
    amount: 10000,
    transaction_hash: txHash,
    trigger_entry_id: claimData.entryId,
    trigger_share_id: claimData.shareId,
    claimed_at: new Date()
  });
  
  return { success: true, txHash, amount: 10000 };
};
```

#### 4.2 Transaction States
```typescript
interface TransactionStates {
  pending: {
    message: "Processing your token claim...";
    visual: "Loading spinner";
    timeEstimate: "This may take 30-60 seconds";
  };
  
  confirmed: {
    message: "🎉 Success! 10,000 $SOLAR tokens claimed";
    details: `Transaction: ${txHash}`;
    nextSteps: "Tokens will appear in your wallet shortly";
  };
  
  failed: {
    message: "Claim failed. Please try again.";
    action: "Retry Claim";
    support: "Contact support if issue persists";
  };
}
```

### 5. Database Schema

#### 5.1 Token Claims Table
```sql
CREATE TABLE token_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid INTEGER UNIQUE NOT NULL,
  amount INTEGER NOT NULL DEFAULT 10000,
  transaction_hash TEXT,
  
  -- Claim context
  trigger_entry_id UUID NOT NULL,
  trigger_share_id UUID NOT NULL,
  
  -- Timing
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_confirmed_at TIMESTAMP WITH TIME ZONE,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  failure_reason TEXT,
  
  -- Metadata
  contract_address TEXT DEFAULT '0x746042147240304098C837563aAEc0F671881B07',
  wallet_address TEXT NOT NULL
);

-- Indexes
CREATE UNIQUE INDEX idx_token_claims_user_fid ON token_claims(user_fid);
CREATE INDEX idx_token_claims_status ON token_claims(status);
CREATE INDEX idx_token_claims_trigger_entry ON token_claims(trigger_entry_id);
```

#### 5.2 Claim Notifications Table
```sql
CREATE TABLE claim_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid INTEGER NOT NULL,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Claim data
  entry_id UUID NOT NULL,
  share_id UUID NOT NULL,
  claim_amount INTEGER DEFAULT 10000,
  
  -- Status
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  
  -- Prevent duplicates
  UNIQUE(user_fid, entry_id, share_id)
);
```

### 6. API Endpoints

#### 6.1 Claim Verification
```typescript
// GET /api/tokens/claim/verify?fid={fid}&entry={entryId}&share={shareId}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userFid = parseInt(searchParams.get('fid') || '0');
  const entryId = searchParams.get('entry');
  const shareId = searchParams.get('share');
  
  try {
    // Verify claim eligibility
    const eligibility = await verifyClaimEligibility(userFid, entryId, shareId);
    
    return NextResponse.json({
      eligible: eligibility.eligible,
      amount: 10000,
      contract: '0x746042147240304098C837563aAEc0F671881B07',
      reason: eligibility.reason
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 400 }
    );
  }
}
```

#### 6.2 Claim Processing
```typescript
// POST /api/tokens/claim
export async function POST(req: NextRequest) {
  const { userFid, entryId, shareId, walletAddress } = await req.json();
  
  try {
    // 1. Verify eligibility (double-check)
    const eligibility = await verifyClaimEligibility(userFid, entryId, shareId);
    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: 'Not eligible for claim' },
        { status: 400 }
      );
    }
    
    // 2. Process token distribution
    const claimResult = await processClaim({
      userFid,
      entryId,
      shareId,
      walletAddress,
      amount: 10000
    });
    
    return NextResponse.json({
      success: true,
      transactionHash: claimResult.txHash,
      amount: 10000,
      status: 'pending'
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Claim processing failed' },
      { status: 500 }
    );
  }
}
```

#### 6.3 Claim Status
```typescript
// GET /api/tokens/claim/status/{userFid}
export async function GET(
  req: NextRequest,
  { params }: { params: { userFid: string } }
) {
  const userFid = parseInt(params.userFid);
  
  const claim = await supabase
    .from('token_claims')
    .select('*')
    .eq('user_fid', userFid)
    .single();
  
  if (!claim.data) {
    return NextResponse.json({ hasClaimed: false });
  }
  
  return NextResponse.json({
    hasClaimed: true,
    amount: claim.data.amount,
    status: claim.data.status,
    transactionHash: claim.data.transaction_hash,
    claimedAt: claim.data.claimed_at
  });
}
```

### 7. Success Modal Design

#### 7.1 Success State Content
```typescript
const SuccessModal = ({ claimResult }: { claimResult: ClaimResult }) => (
  <Modal>
    <div className="success-content">
      <div className="celebration-icon">🎉</div>
      <h2>Cosmic Achievement Complete!</h2>
      <p>You've successfully claimed 10,000 $SOLAR tokens</p>
      
      <div className="token-details">
        <div className="amount">10,000 $SOLAR</div>
        <div className="transaction">
          Transaction: {formatTxHash(claimResult.txHash)}
        </div>
      </div>
      
      <div className="next-steps">
        <p>Your tokens will appear in your wallet shortly.</p>
        <p>Continue your cosmic journey by writing more reflections!</p>
      </div>
      
      <div className="actions">
        <button onClick={viewInWallet}>View in Wallet</button>
        <button onClick={continueJourney}>Write Another Entry</button>
        <button onClick={closeModal}>Close</button>
      </div>
    </div>
  </Modal>
);
```

### 8. Error Handling

#### 8.1 Common Error States
```typescript
interface ErrorStates {
  alreadyClaimed: {
    title: "Already Claimed";
    message: "You've already claimed your 10,000 $SOLAR tokens";
    action: "View Transaction History";
  };
  
  notEligible: {
    title: "Not Eligible";
    message: "Complete your first journal entry and share it to claim tokens";
    action: "Create First Entry";
  };
  
  walletNotConnected: {
    title: "Wallet Required";
    message: "Connect your wallet to claim $SOLAR tokens";
    action: "Connect Wallet";
  };
  
  transactionFailed: {
    title: "Transaction Failed";
    message: "Token distribution failed. Please try again.";
    action: "Retry Claim";
  };
}
```

### 9. Analytics & Tracking

#### 9.1 Claim Funnel Metrics
```typescript
interface ClaimAnalytics {
  events: {
    notificationSent: "Track notification delivery";
    notificationViewed: "Track notification opens";
    modalOpened: "Track claim modal opens";
    claimAttempted: "Track claim button clicks";
    claimSuccessful: "Track successful token distributions";
    claimFailed: "Track failed claims with reasons";
  };
  
  metrics: {
    notificationToModal: "% of notifications that open modal";
    modalToClaim: "% of modal opens that attempt claim";
    claimSuccess: "% of claim attempts that succeed";
    overallConversion: "% of eligible users who successfully claim";
  };
}
```

### 10. Testing Requirements

#### 10.1 Test Scenarios
- **Happy Path**: New user creates entry, shares, gets notification, claims successfully
- **Already Claimed**: User tries to claim twice, gets appropriate error
- **Invalid Entry**: User tries to claim with non-existent entry/share
- **Wallet Issues**: User with disconnected wallet tries to claim
- **Transaction Failure**: Network issues during token distribution
- **Modal Dismissal**: User dismisses modal, can still claim later

#### 10.2 Edge Cases
- User deletes entry after sharing but before claiming
- Share expires before user attempts to claim
- User changes wallet address between share and claim
- Multiple rapid claim attempts (rate limiting)

## Success Metrics

### Primary KPIs
- **Claim Rate**: 80%+ of eligible users claim tokens
- **Time to Claim**: 90% of claims within 24 hours of notification
- **Transaction Success**: 95%+ of claim attempts result in successful token distribution
- **Retention**: 60%+ of token claimers return to write additional entries

### Secondary Metrics  
- **Notification Open Rate**: 70%+ of notifications get opened
- **Modal Conversion**: 85%+ of modal opens result in claim attempts
- **Viral Growth**: Token rewards drive 20%+ increase in sharing rate

This token claim system creates a powerful growth incentive while introducing users to the $SOLAR economy and encouraging continued engagement with the platform.