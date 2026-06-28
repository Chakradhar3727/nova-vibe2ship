'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, loading, user } = useAuth();

  // If already logged in, redirect
  useEffect(() => {
    if (user && !loading) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  if (user && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#272729] flex flex-col items-center justify-center relative px-4">
      {/* Global Nav - Apple Style */}
      <nav className="absolute top-0 w-full h-[44px] bg-black text-[#f5f5f7] flex items-center px-4 lg:px-[max(calc(50vw-490px),24px)] text-xs font-normal tracking-tight z-50">
        <div className="font-semibold text-white cursor-pointer" onClick={() => router.push('/')}>
          NOVA
        </div>
      </nav>

      {/* Login Card (store-utility-card style but dark) */}
      <div className="w-full max-w-[400px] bg-black border border-[#333333] rounded-[18px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center">
        
        {/* Apple ID Style Header */}
        <h1 className="text-[28px] font-semibold tracking-[-0.01em] text-white mb-2 text-center">
          Sign in
        </h1>
        <p className="text-[14px] text-[#cccccc] font-normal mb-10 text-center">
          Use your Google Account to access NOVA.
        </p>

        {/* Auth Buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full h-[44px] rounded-full bg-white text-black text-[17px] font-normal flex items-center justify-center gap-2 hover:bg-[#f5f5f7] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <button
            disabled={true}
            className="w-full h-[44px] rounded-[8px] bg-[#1d1d1f] text-white text-[14px] font-normal flex items-center justify-center opacity-50 cursor-not-allowed"
          >
            Sign in with Email (Coming Soon)
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center text-[12px] text-[#7a7a7a] tracking-tight">
          By signing in, you agree to the <br/>
          <span className="text-[#2997ff] cursor-pointer hover:underline">Terms of Service</span> and <span className="text-[#2997ff] cursor-pointer hover:underline">Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
}
