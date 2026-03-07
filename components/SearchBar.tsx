"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Navigation, RefreshCw } from "lucide-react";
import type { ParkingSite } from "@/types";

interface SearchBarProps {
  sites: ParkingSite[];
  onSelectSite: (site: ParkingSite) => void;
  onLocateMe: () => void;
}

export default function SearchBar({ sites, onSelectSite, onLocateMe }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = query.length > 1
    ? sites.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.address.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="flex-1 flex items-center bg-white rounded-2xl shadow-float px-4 py-3 gap-3">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search parking area or landmark…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setOpen(false); }}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Action buttons */}
        <button
          onClick={onLocateMe}
          className="bg-white rounded-2xl shadow-float p-3 hover:bg-blue-50 transition-colors"
          title="Locate me"
        >
          <Navigation className="w-5 h-5 text-blue-600" />
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-white rounded-2xl shadow-float p-3 hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-16 mt-2 bg-white rounded-2xl shadow-float overflow-hidden z-50">
          {results.map((site) => (
            <button
              key={site.id}
              onClick={() => {
                onSelectSite(site);
                setQuery(site.name);
                setOpen(false);
              }}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">P</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{site.name}</p>
                <p className="text-xs text-gray-500">{site.address}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
