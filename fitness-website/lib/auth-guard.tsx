"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users. Defaults to "/login" */
  redirectTo?: string;
}

/**
 * Wrap any page/component that requires authentication.
 * Redirects to login if user is not signed in.
 */
export default function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Will be redirected by the useEffect above
    return null;
  }

  return <>{children}</>;
}
