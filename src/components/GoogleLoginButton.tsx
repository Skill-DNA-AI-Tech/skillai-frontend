import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuthApiBaseUrl } from '../lib/api';
import { AlertCircle } from 'lucide-react';

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onFailure?: (error: string) => void;
  clientId?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onFailure,
  clientId
}) => {
  const { login } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || clientId || '849754791910-kvubjul5bnqi8un3c38on96bdengsn37.apps.googleusercontent.com';
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if Google SDK is already loaded
    if (window.google?.accounts?.id) {
      setIsSdkLoaded(true);
      return;
    }

    // 2. Dynamically inject Google Client library script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsSdkLoaded(true);
    };
    script.onerror = () => {
      const err = 'Failed to load Google Identity Services SDK.';
      setError(err);
      if (onFailure) onFailure(err);
    };
    document.body.appendChild(script);

    return () => {
      // Clean up script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onFailure]);

  useEffect(() => {
    if (!isSdkLoaded || !buttonRef.current || !googleClientId) return;

    try {
      // 3. Initialize Google Accounts API
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // 4. Render standard styled Google Button
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: buttonRef.current.clientWidth || 320,
      });
    } catch (err: any) {
      const errMsg = err?.message || 'Error rendering Google Sign-In button.';
      setError(errMsg);
      if (onFailure) onFailure(errMsg);
    }
  }, [isSdkLoaded, googleClientId]);

  const handleCredentialResponse = async (response: any) => {
    setError(null);
    const idToken = response.credential;
    if (!idToken) {
      const err = 'No ID Token returned from Google.';
      setError(err);
      if (onFailure) onFailure(err);
      return;
    }

    try {
      // 5. Send ID Token to backend for verification
      const res = await fetch(`${getAuthApiBaseUrl()}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Google Authentication failed at backend.');
      }

      const data = await res.json();
      
      // 6. Complete login in React context
      login(
        {
          _id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatarUrl: data.user.avatarUrl,
        },
        data.access_token,
        data.refresh_token // optional refresh token
      );

      if (onSuccess) onSuccess(data.user);
    } catch (err: any) {
      const errMsg = err?.message || 'Google Auth login request failed.';
      setError(errMsg);
      if (onFailure) onFailure(errMsg);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {error && (
        <div className="w-full mb-3 flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Container where the Google SDK will render the native button */}
      <div 
        ref={buttonRef} 
        id="googleBtnParent" 
        className="w-full min-h-[44px] flex justify-center items-center bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg overflow-hidden transition-all duration-300"
      />
    </div>
  );
};

declare global {
  interface Window {
    google: any;
  }
}
