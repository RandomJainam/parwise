"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ParkingSlot } from "@/types";

interface SlotGridProps {
  slots: ParkingSlot[];
  loading: boolean;
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  // For fake/static mode when no Firebase slots exist
  totalSlots?: number;
  availableCount?: number;
}

function generateFakeSlots(total: number, availableCount: number): ParkingSlot[] {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const perRow = Math.ceil(total / rows.length);
  const slots: ParkingSlot[] = [];
  let count = 0;
  let occupiedSet = new Set<number>();

  // Randomly decide which indices are occupied
  const occupiedCount = total - availableCount;
  while (occupiedSet.size < occupiedCount) {
    occupiedSet.add(Math.floor(Math.random() * total));
  }

  for (const row of rows) {
    for (let i = 1; i <= perRow && count < total; i++, count++) {
      slots.push({
        id: `${row}${i}`,
        slotId: `${row}${i}`,
        parkingId: "fake",
        occupied: occupiedSet.has(count),
        reserved: false,
      });
    }
  }
  return slots;
}

export default function SlotGrid({
  slots,
  loading,
  selectedSlot,
  onSelectSlot,
  totalSlots = 20,
  availableCount = 10,
}: SlotGridProps) {

  // Use real Firebase slots if available, otherwise generate fake ones
  const displaySlots = useMemo(() => {
    if (slots.length > 0) return slots;
    return generateFakeSlots(Math.min(totalSlots, 48), availableCount); // cap at 48 for display
  }, [slots, totalSlots, availableCount]);

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Group by row
  const rows: Record<string, ParkingSlot[]> = {};
  displaySlots.forEach((slot) => {
    const row = slot.slotId.charAt(0);
    if (!rows[row]) rows[row] = [];
    rows[row].push(slot);
  });

  const realAvail = displaySlots.filter((s) => !s.occupied && !s.reserved).length;

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />
            Occupied
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" />
            Reserved
          </span>
        </div>
        <span className="text-xs font-semibold text-green-600">{realAvail} free</span>
      </div>

      {/* Grid */}
      {Object.entries(rows)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([row, rowSlots]) => (
          <div key={row} className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-300 w-4 flex-shrink-0">{row}</span>
            <div className="flex gap-1.5 flex-wrap">
              {rowSlots
                .sort((a, b) => a.slotId.localeCompare(b.slotId, undefined, { numeric: true }))
                .map((slot) => {
                  const isOccupied  = slot.occupied;
                  const isReserved  = slot.reserved;
                  const isAvailable = !isOccupied && !isReserved;
                  const isSelected  = selectedSlot === slot.slotId;

                  return (
                    <button
                      key={slot.slotId}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && onSelectSlot(isSelected ? "" : slot.slotId)}
                      className={cn(
                        "slot-cell w-12 h-10 rounded-lg text-xs font-bold border-2 transition-all",
                        isOccupied  && "bg-red-50 border-red-300 text-red-400 cursor-not-allowed occupied",
                        isReserved  && "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed occupied",
                        isAvailable && !isSelected && "bg-green-50 border-green-400 text-green-700 cursor-pointer",
                        isSelected  && "bg-blue-600 border-blue-600 text-white scale-105 shadow-md"
                      )}
                    >
                      {slot.slotId}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}

      {selectedSlot && (
        <div className="text-center text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl py-2.5">
          ✓ Slot {selectedSlot} selected — tap Park Now to confirm
        </div>
      )}

      {slots.length === 0 && (
        <p className="text-center text-xs text-gray-300 mt-1">
          Showing simulated layout • Connect ESP32 for live data
        </p>
      )}
    </div>
  );
}
