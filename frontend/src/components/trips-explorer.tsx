"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, X, Compass, Filter, 
  ArrowUpDown, Check, RotateCcw
} from "lucide-react";

import TripCard from "@/components/trip-card";
import { Trip, Destination, Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TripsExplorerProps {
  initialTrips: Trip[];
  destinations: Destination[];
  categories: Category[];
  initialCategory?: string;
  initialDestination?: string;
  initialDifficulty?: string;
  initialSearch?: string;
}

export default function TripsExplorer({
  initialTrips,
  destinations,
  categories,
  initialCategory = "",
  initialDestination = "",
  initialDifficulty = "",
  initialSearch = "",
}: TripsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch || searchParams.get("search") || "");
  const [category, setCategory] = useState(initialCategory || searchParams.get("category") || "");
  const [destination, setDestination] = useState(initialDestination || searchParams.get("destination") || "");
  const [difficulty, setDifficulty] = useState(initialDifficulty || searchParams.get("difficulty") || "");
  const [sortBy, setSortBy] = useState<string>("featured");

  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Function to query backend API with active filter state
  const fetchFilteredTrips = useCallback(async (
    catVal: string,
    destVal: string,
    diffVal: string,
    searchVal: string
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (catVal) params.set("category", catVal);
      if (destVal) params.set("destination", destVal);
      if (diffVal) params.set("difficulty", diffVal);
      if (searchVal) params.set("search", searchVal);

      const queryString = params.toString();
      const apiUrl = `/api/v1/trips/${queryString ? `?${queryString}` : ""}`;

      const res = await fetch(apiUrl, {
        headers: { "Accept": "application/json" },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (Array.isArray(data)) {
          setTrips(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch filtered trips:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update browser URL query params without reloading
  const updateUrlParams = useCallback((
    catVal: string,
    destVal: string,
    diffVal: string,
    searchVal: string
  ) => {
    const params = new URLSearchParams();
    if (catVal) params.set("category", catVal);
    if (destVal) params.set("destination", destVal);
    if (diffVal) params.set("difficulty", diffVal);
    if (searchVal) params.set("search", searchVal);

    const newUrl = params.toString() ? `/trips?${params.toString()}` : "/trips";
    window.history.replaceState(null, "", newUrl);
  }, []);

  // Handle Search Input submit / change
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(category, destination, difficulty, search.trim());
    fetchFilteredTrips(category, destination, difficulty, search.trim());
  };

  const handleCategorySelect = (slug: string) => {
    const newCategory = category === slug ? "" : slug;
    setCategory(newCategory);
    updateUrlParams(newCategory, destination, difficulty, search.trim());
    fetchFilteredTrips(newCategory, destination, difficulty, search.trim());
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDest = e.target.value;
    setDestination(newDest);
    updateUrlParams(category, newDest, difficulty, search.trim());
    fetchFilteredTrips(category, newDest, difficulty, search.trim());
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiff = e.target.value;
    setDifficulty(newDiff);
    updateUrlParams(category, destination, newDiff, search.trim());
    fetchFilteredTrips(category, destination, newDiff, search.trim());
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setDestination("");
    setDifficulty("");
    setSortBy("featured");
    updateUrlParams("", "", "", "");
    fetchFilteredTrips("", "", "", "");
  };

  // Sort trips client-side after backend filtering
  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "duration_asc") return (a.duration_days || 0) - (b.duration_days || 0);
    if (sortBy === "rating") return (b.rating || 5.0) - (a.rating || 5.0);
    return 0; // default featured / backend ordering
  });

  const hasActiveFilters = Boolean(category || destination || difficulty || search);

  return (
    <div className="w-full space-y-8">
      {/* 1. Universal Search Bar (Mobile & Desktop) */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="pl-3 sm:pl-4 text-slate-400">
            <Search className="w-5 h-5 text-brand-ocean" />
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by package name, destination (e.g. Gokarna, Kedarkantha, Dandeli)..."
            className="w-full bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-brand-navy placeholder:text-slate-400 focus:outline-none font-medium"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateUrlParams(category, destination, difficulty, "");
                fetchFilteredTrips(category, destination, difficulty, "");
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full mr-2 transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="flex-shrink-0 inline-flex items-center space-x-1.5 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-brand-ocean hover:bg-brand-navy text-white text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 shadow-md active:scale-95"
          >
            <Search className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Search Adventures</span>
          </button>
        </form>

        {/* 2. Dropdown Filters: Destination, Difficulty, Sort By */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Destination Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Destination
            </label>
            <select
              value={destination}
              onChange={handleDestinationChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:bg-white transition"
            >
              <option value="">All Destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={handleDifficultyChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:bg-white transition"
            >
              <option value="">All Difficulty Levels</option>
              <option value="easy">Easy / Beginners</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging / High Altitude</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:bg-white transition"
            >
              <option value="featured">Featured / Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration_asc">Duration: Shortest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Active Filters Bar & Result Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-brand-navy">
            {isLoading ? "Searching backend..." : `Showing ${sortedTrips.length} ${sortedTrips.length === 1 ? "Adventure" : "Adventures"}`}
          </span>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1 text-xs text-brand-ocean hover:text-brand-navy font-semibold transition ml-2 underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            {category && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-light text-brand-ocean text-[11px] font-semibold border border-brand-sky/30">
                <span>Category: {category}</span>
                <button
                  onClick={() => handleCategorySelect("")}
                  className="hover:text-red-500"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {destination && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-light text-brand-ocean text-[11px] font-semibold border border-brand-sky/30">
                <span>Destination: {destination}</span>
                <button
                  onClick={() => {
                    setDestination("");
                    updateUrlParams(category, "", difficulty, search);
                    fetchFilteredTrips(category, "", difficulty, search);
                  }}
                  className="hover:text-red-500"
                  aria-label="Remove destination filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {difficulty && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-light text-brand-ocean text-[11px] font-semibold border border-brand-sky/30">
                <span>Difficulty: {difficulty}</span>
                <button
                  onClick={() => {
                    setDifficulty("");
                    updateUrlParams(category, destination, "", search);
                    fetchFilteredTrips(category, destination, "", search);
                  }}
                  className="hover:text-red-500"
                  aria-label="Remove difficulty filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {search && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-light text-brand-ocean text-[11px] font-semibold border border-brand-sky/30">
                <span>Search: &ldquo;{search}&rdquo;</span>
                <button
                  onClick={() => {
                    setSearch("");
                    updateUrlParams(category, destination, difficulty, "");
                    fetchFilteredTrips(category, destination, difficulty, "");
                  }}
                  className="hover:text-red-500"
                  aria-label="Remove search keyword"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 5. Trips Grid / Loading Shimmer / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/60"
            />
          ))}
        </div>
      ) : sortedTrips.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrips.map((trip, idx) => (
            <div key={trip.id} className="w-full">
              <TripCard trip={trip} priority={idx < 3} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-brand-light rounded-3xl border border-dashed border-slate-200">
          <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-brand-navy">
            No matching adventures found
          </h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Try adjusting your search keyword, category, or destination filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center space-x-2 mt-5 px-6 py-2.5 rounded-full bg-brand-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-ocean transition shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
