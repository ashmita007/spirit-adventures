import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft, Mountain, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-white px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-light border border-brand-sky/30 flex items-center justify-center text-brand-ocean shadow-lg">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: "12s" }} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-ocean">
            Lost on the Trail &bull; 404
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-navy uppercase tracking-tight">
            Off The Map
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            The page or expedition you are looking for might have been rescheduled, moved, or never existed on this trail.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow-md hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/trips"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-brand-light hover:bg-slate-100 text-brand-navy text-xs font-bold uppercase tracking-wider transition border border-slate-200"
          >
            <Mountain className="w-4 h-4 text-brand-ocean" />
            <span>Explore Trips</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
