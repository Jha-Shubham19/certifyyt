"use client";

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function LoginButton() {
  const { signIn, loading } = useAuth();

  return (
    <Button onClick={signIn} disabled={loading} className='text-xs sm:text-base h-8 flex items-center gap-1 p-3 sm:p-6'>
      <LogIn className="mr-1 h-3 w-4" />
      {loading ? 'Signing In...' : 'Sign in'}
    </Button>
  );
}
