import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SocialTagToast } from './SocialTagToast';

interface SocialTagToastContextType {
  showSocialTagToast: () => void;
}

const SocialTagToastContext = createContext<SocialTagToastContextType>({
  showSocialTagToast: () => {},
});

export function useSocialTagToast() {
  return useContext(SocialTagToastContext);
}

export function SocialTagToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  const showSocialTagToast = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <SocialTagToastContext.Provider value={{ showSocialTagToast }}>
      {children}
      {visible && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 9999,
          pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto' }}>
            <SocialTagToast onClose={handleClose} />
          </div>
        </div>
      )}
    </SocialTagToastContext.Provider>
  );
} 