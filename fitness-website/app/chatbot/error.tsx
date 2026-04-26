"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function ChatbotError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container py-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 max-w-md w-full text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">AI Coach Unavailable</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The chatbot encountered an issue. Your other sections (workouts, nutrition) are unaffected.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
