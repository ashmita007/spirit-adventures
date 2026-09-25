"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App boundary caught runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">
            Adventure Interrupted
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-navy uppercase tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            We encountered a temporary trail obstacle. Don&apos;t worry, your connection is safe and we can resume immediately.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow-md hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-brand-light hover:bg-slate-100 text-brand-navy text-xs font-bold uppercase tracking-wider transition border border-slate-200"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
