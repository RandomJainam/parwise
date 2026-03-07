"use client";

import { useState } from "react";
import { X, ChevronLeft, CheckCircle, Calendar, Clock, Car, Navigation } from "lucide-react";
import { toast } from "sonner";
import { createBooking } from "@/hooks/useFirestore";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, estimateCost } from "@/lib/utils";
import type { ParkingSite, ParkingSlot } from "@/types";

interface BookingPanelProps {
  site: ParkingSite;
  slots: ParkingSlot[];
  selectedSlot: string | null;
  mode: "now" | "later";
  isLive?: boolean;
  onClose: () => void;
  onFullClose: () => void;
}

type Step = "select" | "confirm" | "success";

const HOUR_OPTIONS = [1, 2, 3, 4, 6, 8, 12];

export default function BookingPanel({
  site, slots, selectedSlot: initialSlot, mode, onClose, onFullClose
}: BookingPanelProps) {
  const { user } = useAuth();

  const [step, setStep]             = useState<Step>("select");
  const [chosenSlot, setChosenSlot] = useState<string>(initialSlot ?? "");
  const [duration, setDuration]     = useState(2);
  const [date, setDate]             = useState("");
  const [timeFrom, setTimeFrom]     = useState("");
  const [loading, setLoading]       = useState(false);

  const cost  = estimateCost(duration, site.hourlyRate);
  const today = new Date().toISOString().split("T")[0];

  const canProceed = () => {
    if (!chosenSlot) { toast.error("Please select a slot"); return false; }
    if (mode === "later") {
      if (!date)     { toast.error("Please pick a date"); return false; }
      if (!timeFrom) { toast.error("Please pick a start time"); return false; }
    }
    return true;
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Use real Firebase Auth UID if logged in, else guest-user
      const userId = user?.uid ?? "guest-user";
      const userName = user?.displayName ?? user?.email ?? "Guest";

      await createBooking({
        userId,
        userName,
        parkingId:   site.id,
        parkingName: site.name,
        latitude:    site.latitude,
        longitude:   site.longitude,
        slotId:      chosenSlot,
        type:        mode === "now" ? "now" : "prebook",
        startTime:   mode === "now" ? new Date().toISOString() : `${date}T${timeFrom}`,
        date,
        time:        timeFrom,
        duration,
        cost,
        status:      "active",
        vehiclePlate: user ? "" : "",
      });
      setStep("success");
      toast.success("Booking confirmed! 🎉");
    } catch {
      toast.error("Booking failed — check Firebase rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[2000]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl slide-up"
        style={{ maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl z-10 px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-900">
                {mode === "now" ? "🚗 Park Now" : "🗓 Book for Later"}
              </h2>
              <p className="text-xs text-gray-400">{site.name}</p>
            </div>
            <button onClick={onFullClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          {/* Step indicator */}
          {step !== "success" && (
            <div className="flex gap-1.5 mt-3">
              {["select","confirm"].map((s, i) => (
                <div key={s} className={`h-1 rounded-full flex-1 transition-all ${
                  (step === "select" && i === 0) || step === "confirm" ? "bg-blue-600" : "bg-gray-200"
                }`} />
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-5 space-y-6">

          {/* ── STEP 1: SELECT ── */}
          {step === "select" && (
            <>
              {/* Booking as info */}
              <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-base">P</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-blue-900 text-sm">{site.name}</p>
                  <p className="text-xs text-blue-600">{site.address}</p>
                  <p className="text-xs font-semibold text-blue-800 mt-0.5">{formatCurrency(site.hourlyRate)}/hr</p>
                </div>
                {user ? (
                  <div className="text-right">
                    <p className="text-xs text-blue-400">Booking as</p>
                    <p className="text-xs font-bold text-blue-700 truncate max-w-[80px]">{user.displayName ?? user.email}</p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-xs text-orange-400 font-semibold">Guest</p>
                  </div>
                )}
              </div>

              {/* Slot grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800">Choose a Slot</p>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block"/>Free</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block"/>Taken</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-300 inline-block"/>Booked</span>
                  </div>
                </div>

                {(() => {
                  const rows: Record<string, ParkingSlot[]> = {};
                  slots.forEach(s => {
                    const r = s.slotId.charAt(0);
                    if (!rows[r]) rows[r] = [];
                    rows[r].push(s);
                  });
                  return (
                    <div className="space-y-2">
                      {Object.entries(rows).sort(([a],[b]) => a.localeCompare(b)).map(([row, rowSlots]) => (
                        <div key={row} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-300 w-4 flex-shrink-0">{row}</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {rowSlots.sort((a,b) => a.slotId.localeCompare(b.slotId,undefined,{numeric:true})).map(slot => {
                              const isAvail    = !slot.occupied && !slot.reserved;
                              const isSelected = chosenSlot === slot.slotId;
                              return (
                                <button
                                  key={slot.slotId}
                                  disabled={!isAvail}
                                  onClick={() => setChosenSlot(isSelected ? "" : slot.slotId)}
                                  className={[
                                    "w-12 h-10 rounded-lg text-xs font-bold border-2 transition-all",
                                    slot.occupied  ? "bg-red-50 border-red-200 text-red-300 cursor-not-allowed" : "",
                                    slot.reserved && !slot.occupied ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed" : "",
                                    isAvail && !isSelected ? "bg-green-50 border-green-400 text-green-700 hover:scale-105" : "",
                                    isSelected ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-lg" : "",
                                  ].join(" ")}
                                >
                                  {slot.slotId}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {chosenSlot && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-blue-700 text-center">
                    ✓ Slot <span className="font-black">{chosenSlot}</span> selected
                  </div>
                )}
              </div>

              {/* Book Later: Date + Time + Hours */}
              {mode === "later" && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-gray-800">Schedule Details</p>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      <Calendar className="w-3.5 h-3.5"/> Date
                    </label>
                    <input type="date" value={date} min={today}
                      onChange={e => setDate(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      <Clock className="w-3.5 h-3.5"/> Start Time
                    </label>
                    <input type="time" value={timeFrom}
                      onChange={e => setTimeFrom(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      <Clock className="w-3.5 h-3.5"/> Duration
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {HOUR_OPTIONS.map(h => (
                        <button key={h} onClick={() => setDuration(h)}
                          className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${duration===h ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105" : "bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300"}`}>
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Park Now: Hours only */}
              {mode === "now" && (
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    <Clock className="w-3.5 h-3.5"/> How long will you park?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {HOUR_OPTIONS.map(h => (
                      <button key={h} onClick={() => setDuration(h)}
                        className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${duration===h ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105" : "bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300"}`}>
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost preview */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-200 text-xs font-medium">Estimated Total</p>
                    <p className="text-3xl font-black">{formatCurrency(cost)}</p>
                  </div>
                  <div className="text-right text-blue-200 text-xs">
                    <p>{formatCurrency(site.hourlyRate)} × {duration}h</p>
                    {chosenSlot && <p className="mt-1 font-semibold text-white">Slot {chosenSlot}</p>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => canProceed() && setStep("confirm")}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-blue-700 active:scale-95 transition-all shadow-md"
              >
                Continue →
              </button>
            </>
          )}

          {/* ── STEP 2: CONFIRM ── */}
          {step === "confirm" && (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-2xl overflow-hidden">
                {[
                  ["Booking As",  user?.displayName ?? user?.email ?? "Guest"],
                  ["Parking",     site.name],
                  ["Slot",        chosenSlot],
                  ...(mode === "later"
                    ? [["Date", date], ["Start Time", timeFrom]]
                    : [["Start", "Immediately"]]),
                  ["Duration",    `${duration} hour${duration > 1 ? "s" : ""}`],
                  ["Type",        mode === "now" ? "Park Now" : "Pre-booked"],
                  ["Total",       formatCurrency(cost)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between px-4 py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-bold text-gray-900 text-right max-w-[55%] truncate">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("select")}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50">
                  ← Back
                </button>
                <button onClick={handleConfirm} disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Confirming…" : "Confirm Booking ✓"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === "success" && (
            <div className="text-center py-4 space-y-5">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Booking Confirmed!</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {mode === "now" ? "Head to the parking lot now." : `Scheduled for ${date} at ${timeFrom}`}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left space-y-2">
                {([
                  [<Car className="w-4 h-4" key="car"/>,   "Slot",     chosenSlot],
                  [<Clock className="w-4 h-4" key="clk"/>, "Duration", `${duration}h`],
                ] as [React.ReactNode, string, string][]).map(([icon, label, val]) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm">
                    <span className="text-green-500">{icon}</span>
                    <span className="text-gray-500">{label}</span>
                    <span className="font-bold text-gray-800 ml-auto">{val}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-green-200 flex justify-between">
                  <span className="text-sm text-gray-500">Total Estimate</span>
                  <span className="text-lg font-black text-green-600">{formatCurrency(cost)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={onFullClose}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold">
                  Done
                </button>
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${site.latitude},${site.longitude}`)}
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2">
                  <Navigation className="w-4 h-4"/> Navigate
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
