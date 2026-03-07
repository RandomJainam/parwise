"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import ParkingBottomSheet from "@/components/ParkingBottomSheet";
import { MUMBAI_PARKING_SITES } from "@/lib/mumbaiParkingData";
import type { ParkingSite } from "@/types";

const ParkingMap = dynamic(() => import("@/components/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading Mumbai map…</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [selected, setSelected]   = useState<ParkingSite | null>(null);
  const [available, setAvailable] = useState<number>(0);
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.0760, 72.8777]); // Mumbai

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Unable to get your location")
    );
  };

  const handleMarkerClick = (site: ParkingSite, avail: number) => {
    setSelected(site);
    setAvailable(avail);
  };

  const handleSearchSelect = (site: ParkingSite) => {
    setMapCenter([site.latitude, site.longitude]);
    setSelected(site);
    setAvailable(Math.floor(Math.random() * site.totalSlots));
  };

  return (
    <div className="relative w-full h-full">
      {/* Full-screen map */}
      <ParkingMap
        center={mapCenter}
        onMarkerClick={handleMarkerClick}
        selectedId={selected?.id ?? null}
      />

      {/* Floating search bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <SearchBar
          sites={MUMBAI_PARKING_SITES}
          onSelectSite={handleSearchSelect}
          onLocateMe={handleLocateMe}
        />
      </div>

      {/* Slot count badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow text-xs font-semibold text-gray-600">
          📍 {MUMBAI_PARKING_SITES.length} parking spots across Mumbai
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[999] bg-white/95 backdrop-blur-sm rounded-2xl shadow-card px-4 py-2.5 flex gap-4 text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          Filling Up
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          Almost Full
        </span>
      </div>

      {/* Bottom sheet */}
      {selected && (
        <ParkingBottomSheet
          site={selected}
          precomputedAvailable={available}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
