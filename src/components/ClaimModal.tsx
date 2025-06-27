"use client";

import { useState, useEffect } from 'react';
import { ConfirmationModal } from './ui/ConfirmationModal';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  shareId: string;
  userFid: number;
  claimAmount: number;
}

type ClaimStep = 'prompt' | 'claim' | 'success';

export function ClaimModal({ isOpen, onClose, entryId, shareId, userFid, claimAmount }: ClaimModalProps) {
  const [step, setStep] = useState<ClaimStep>('prompt');
  const [walletAddress, setWalletAddress] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVisitedLink, setHasVisitedLink] = useState(false);

  const claimUrl = `${window.location.origin}/claim?entry=${entryId}&share=${shareId}&fid=${userFid}`;

  // Check if user has visited the claim link
  useEffect(() => {
    if (isOpen && step === 'prompt') {
      const checkVisited = () => {
        // Check if we have a record of the user visiting the claim page
        const visited = sessionStorage.getItem(`claim-visited-${entryId}`);
        if (visited) {
          setHasVisitedLink(true);
          setStep('claim');
        }
      };
      
      checkVisited();
      // Check every 2 seconds
      const interval = setInterval(checkVisited, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, step, entryId]);

  const handleVisitLink = () => {
    // Mark as visited
    sessionStorage.setItem(`claim-visited-${entryId}`, 'true');
    setHasVisitedLink(true);
    setStep('claim');
  };

  const handleClaim = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter your wallet address');
      return;
    }

    setClaiming(true);
    setError(null);

    try {
      const res = await fetch('/api/journal/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userFid,
          entryId,
          shareId,
          walletAddress: walletAddress.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      setStep('success');
      triggerConfetti();
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens');
    } finally {
      setClaiming(false);
    }
  };

  const triggerConfetti = () => {
    // Sun emoji confetti effect
    const sunEmojis = ['🌞', '☀️', '🌅', '🌄', '⭐', '🌟'];
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-50px';
        confetti.style.fontSize = (Math.random() * 20 + 20) + 'px'; // Random size between 20-40px
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white border border-gray-200 p-6">
          {step === 'prompt' && (
            <div className="text-center">
              <div className="text-4xl mb-4">🌞</div>
              <h2 className="text-xl font-bold mb-2">Claim Your Tokens!</h2>
              <p className="text-gray-600 mb-6">
                You&apos;ve shared your first reflection! Visit the claim page to receive your {claimAmount.toLocaleString()} $SOLAR tokens.
              </p>
              
              <div className="space-y-4">
                <a
                  href={claimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-sm hover:bg-[#e6c75a] transition-colors text-center"
                >
                  VISIT CLAIM PAGE
                </a>
                
                <button
                  onClick={handleVisitLink}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-mono text-sm hover:bg-gray-50 transition-colors"
                >
                  I&apos;VE VISITED THE PAGE
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 text-gray-500 font-mono text-sm hover:text-gray-700 transition-colors"
                >
                  CLAIM LATER
                </button>
              </div>
            </div>
          )}

          {step === 'claim' && (
            <div className="text-center">
              <div className="text-4xl mb-4">🌞</div>
              <h2 className="text-xl font-bold mb-2">Enter Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Enter your wallet address to receive {claimAmount.toLocaleString()} $SOLAR tokens.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-mono mb-2">
                    WALLET ADDRESS
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 font-mono text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm font-mono">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleClaim}
                  disabled={claiming || !walletAddress.trim()}
                  className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-sm hover:bg-[#e6c75a] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                >
                  {claiming ? 'CLAIMING...' : 'CLAIM TOKENS'}
                </button>

                <button
                  onClick={() => setStep('prompt')}
                  className="w-full px-4 py-2 text-gray-500 font-mono text-sm hover:text-gray-700 transition-colors"
                >
                  BACK
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold mb-2">Tokens Claimed!</h2>
              <p className="text-gray-600 mb-6">
                Your {claimAmount.toLocaleString()} $SOLAR tokens have been claimed and are being processed.
              </p>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-[#d4af37] text-black font-mono text-sm hover:bg-[#e6c75a] transition-colors"
              >
                DONE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 