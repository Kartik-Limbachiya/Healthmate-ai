"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function NutritionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container py-8 mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 max-w-md w-full text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nutrition Section Issue</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Something went wrong in the nutrition section. Your workouts and chatbot are still working fine.
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
