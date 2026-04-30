import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-services';

type GoogleIdentityButtonProps = {
  text: 'signup_with' | 'signin_with' | 'continue_with';
  onCredential: (credential: string) => Promise<void>;
  disabled?: boolean;
};

export function GoogleIdentityButton({
  text,
  onCredential,
  disabled = false,
}: GoogleIdentityButtonProps) {
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('VITE_GOOGLE_CLIENT_ID belum diatur.');
      return;
    }

    let isMounted = true;

    const initializeGoogle = () => {
      if (!window.google || !buttonContainerRef.current || !isMounted) return;

      buttonContainerRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!credential) {
            setError('Google tidak mengirim credential.');
            return;
          }

          try {
            setError('');
            setIsSubmitting(true);
            await onCredential(credential);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Autentikasi Google gagal.');
          } finally {
            if (isMounted) {
              setIsSubmitting(false);
            }
          }
        },
        ux_mode: 'popup',
      });

      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
      });

      setIsReady(true);
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google) {
        initializeGoogle();
      } else {
        existingScript.addEventListener('load', initializeGoogle, { once: true });
      }
      return () => {
        isMounted = false;
      };
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => {
      if (isMounted) {
        setError('Gagal memuat Google Identity Services.');
      }
    };
    document.head.appendChild(script);

    return () => {
      isMounted = false;
    };
  }, [onCredential, text]);

  return (
    <div className="space-y-3">
      <div
        ref={buttonContainerRef}
        className={`flex justify-center ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      />
      {!isReady && !error && (
        <Button type="button" variant="outline" className="mx-auto flex w-full max-w-xs" disabled>
          Memuat Google Sign-In...
        </Button>
      )}
      {isSubmitting && (
        <p className="text-sm text-gray-500 text-center">Memverifikasi akun Google...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
