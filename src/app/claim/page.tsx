"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { truncateAddress } from '~/lib/truncateAddress';

interface ClaimData {
  eligible: boolean;
  reason?: string;
  amount?: number;
  contract?: string;
}

export default function ClaimPage() {
  const searchParams = useSearchParams();
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const entryId = searchParams.get('entry');
  const shareId = searchParams.get('share');
  const userFid = searchParams.get('fid');

  // Wagmi wallet state
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();

  // Dev mode detection
  const isDevMode = process.env.NODE_ENV !== 'production' || searchParams.get('dev') === '1';
  const fakeAddress = '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';

  useEffect(() => {
    // Mark that user has visited this claim page
    if (entryId) {
      sessionStorage.setItem(`claim-visited-${entryId}`, 'true');
    }

    const checkEligibility = async () => {
      if (!entryId || !shareId || !userFid) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/journal/claim/verify?fid=${userFid}&entry=${entryId}&share=${shareId}`);
        const data = await res.json();
        setClaimData(data);
      } catch (err) {
        setError('Failed to check eligibility');
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [entryId, shareId, userFid]);

  const handleClaim = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    setClaiming(true);
    setError(null);

    try {
      const res = await fetch('/api/journal/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userFid: parseInt(userFid!, 10),
          entryId,
          shareId,
          walletAddress: address
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      setSuccess(true);
      triggerConfetti();
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens');
    } finally {
      setClaiming(false);
    }
  };

  // Sun emoji confetti
  const triggerConfetti = () => {
    const sunEmojis = ['🌞', '☀️', '🌅', '🌄', '⭐', '🌟'];
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-50px';
        confetti.style.fontSize = (Math.random() * 20 + 20) + 'px';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        confetti.textContent = sunEmojis[Math.floor(Math.random() * sunEmojis.length)];
        document.body.appendChild(confetti);
        const animation = confetti.animate([
          { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
          { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
          duration: 4000 + Math.random() * 2000,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        animation.onfinish = () => {
          document.body.removeChild(confetti);
        };
      }, i * 150);
    }
  };

  // Debug log for state
  console.log('ClaimPage state', { loading, claimData, error, isDevMode, address, isConnected });

  // Top section: always rendered
  const TopSection: React.ReactNode = (
    <div className="flex flex-col items-center mb-8 relative">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 z-0" style={{ width: 120, height: 120 }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fffbe9 0%, #ffe9a7 60%, #fffbe900 100%)',
          filter: 'blur(16px)',
        }} />
      </div>
      <img src="/envelope.png" alt="Envelope art" className="w-20 h-20 object-contain mb-4 z-10" style={{ filter: 'grayscale(1)' }} />
      <h1 className="text-2xl font-serif font-bold mb-2 text-black text-center z-10">Notifications</h1>
      <p className="uppercase tracking-widest text-xs text-gray-500 text-center max-w-xs mb-2 z-10" style={{ letterSpacing: '0.15em' }}>
        As we rotate the app shifts and transforms. Learn about those changes here.
      </p>
    </div>
  );

  // Main claim card logic
  let CardContent: React.ReactNode = null;
  if (loading) {
    CardContent = (
      <div className="flex flex-col items-center justify-center min-h-[180px] w-full">
        <div className="text-[#d4af37] text-2xl mb-2">Loading...</div>
        <div className="text-gray-500 text-xs font-mono">Checking eligibility...</div>
      </div>
    );
  } else if (success) {
    CardContent = (
      <div className="flex flex-col items-center justify-center min-h-[180px] w-full">
        <div className="text-5xl mb-4">🌞</div>
        <h1 className="text-xl font-serif font-bold mb-2 text-[#d4af37]">Tokens Claimed!</h1>
        <p className="text-gray-700 font-mono mb-4 text-center">
          Your {claimData?.amount?.toLocaleString()} $SOLAR tokens have been claimed and are being processed.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-[#d4af37] text-black font-mono text-sm hover:bg-[#e6c75a] transition-colors"
        >
          RETURN TO SOLARA
        </button>
      </div>
    );
  } else if (error && !claimData?.eligible) {
    CardContent = (
      <div className="flex flex-col items-center justify-center min-h-[180px] w-full">
        <div className="text-3xl mb-4">🌞</div>
        <h1 className="text-xl font-serif font-bold mb-2 text-[#d4af37]">Claim Not Available</h1>
        <p className="text-gray-500 font-mono text-center">{claimData?.reason || error}</p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 px-4 py-2 bg-[#d4af37] text-black font-mono text-sm hover:bg-[#e6c75a] transition-colors"
        >
          RETURN TO SOLARA
        </button>
      </div>
    );
  } else if (claimData?.eligible) {
    CardContent = (
      <>
        <img src="/envelope.png" alt="Envelope" className="w-12 h-12 object-contain mb-4" />
        <div className="text-lg font-serif font-bold text-center mb-2 text-black">You've shared your first reflection!</div>
        <div className="text-base font-serif text-center mb-6 text-black">You can claim {claimData?.amount?.toLocaleString()} $SOLAR tokens.</div>
        {(isConnected && address) ? (
          <>
            <div className="mb-4 text-xs text-gray-500 font-mono text-center">Wallet: {truncateAddress(address)}</div>
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-base font-bold hover:bg-[#e6c75a] transition-colors rounded-none border border-[#d4af37] disabled:bg-gray-300 disabled:text-gray-500"
              style={{ letterSpacing: '0.1em' }}
            >
              {claiming ? 'CLAIMING...' : 'CLAIM $SOLAR'}
            </button>
          </>
        ) : isDevMode ? (
          <>
            <div className="mb-4 text-xs text-gray-500 font-mono text-center">[DEV MODE] Wallet: {truncateAddress(fakeAddress)}</div>
            <button
              onClick={async () => {
                setClaiming(true);
                setError(null);
                try {
                  const res = await fetch('/api/journal/claim', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userFid: parseInt(userFid!, 10),
                      entryId,
                      shareId,
                      walletAddress: fakeAddress
                    })
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Claim failed');
                  setSuccess(true);
                  triggerConfetti();
                } catch (err: any) {
                  setError(err.message || 'Failed to claim tokens');
                } finally {
                  setClaiming(false);
                }
              }}
              disabled={claiming}
              className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-base font-bold hover:bg-[#e6c75a] transition-colors rounded-none border border-[#d4af37] disabled:bg-gray-300 disabled:text-gray-500"
              style={{ letterSpacing: '0.1em' }}
            >
              {claiming ? 'CLAIMING...' : '[DEV] CLAIM $SOLAR'}
            </button>
          </>
        ) : (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isConnecting}
            className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-base font-bold hover:bg-[#e6c75a] transition-colors rounded-none border border-[#d4af37] disabled:bg-gray-300 disabled:text-gray-500"
            style={{ letterSpacing: '0.1em' }}
          >
            {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
          </button>
        )}
        {error && (
          <div className="text-red-500 text-sm font-mono mt-4">{error}</div>
        )}
      </>
    );
  } else {
    CardContent = (
      <>
        <span className="text-2xl mb-2">✨</span>
        <div className="text-lg font-serif font-bold text-center mb-6 text-black">
          There is nothing for you to claim or do here! Go explore SOLARA.
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-base font-bold hover:bg-[#e6c75a] transition-colors rounded-none border border-[#d4af37] mt-2"
          style={{ letterSpacing: '0.1em' }}
        >
          BACK TO APP
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbe9] flex flex-col items-center pt-4 pb-8 px-2">
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={() => window.location.href = '/'}
          className="mb-6 text-xs text-gray-500 font-mono hover:underline bg-transparent border-none flex items-center gap-1"
          style={{ letterSpacing: '0.05em' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>&larr;</span> BACK TO DASHBOARD
        </button>
        {TopSection}
        <div className="border border-[#d4af37] bg-white p-6 shadow-sm flex flex-col items-center" style={{ boxShadow: '0 2px 8px 0 #e6c75a22' }}>
          {CardContent}
        </div>
      </div>
    </div>
  );
} 