"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, MapPin, ChevronDown, ChevronUp, Navigation, LogIn, Loader2 } from "lucide-react";
import { useBookings, cancelBooking } from "@/hooks/useFirestore";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking } from "@/types";
import { toast } from "sonner";

function HistoryCard({ booking }: { booking: Booking }) {
  const [expanded, setExpanded]   = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(booking.id!);
      toast.success("Booking cancelled");
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const statusColors: Record<string, string> = {
    active:    "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{booking.parkingName}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Slot {booking.slotId} • {formatDate(booking.startTime as string)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {booking.type === "now" ? "🚗 Park Now" : "🗓 Pre-booked"} • {booking.duration}h
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[booking.status] ?? "bg-gray-100 text-gray-500"}`}>
            {booking.status}
          </span>
          <span className="text-sm font-bold text-gray-800">{formatCurrency(booking.cost)}</span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-300"/>
            : <ChevronDown className="w-4 h-4 text-gray-300"/>
          }
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              ["Duration",  `${booking.duration}h`],
              ["Type",      booking.type === "now" ? "Immediate" : "Pre-booked"],
              ["Slot",      booking.slotId],
              ["Rate",      `${formatCurrency(booking.cost / booking.duration)}/hr`],
              ...(booking.date ? [["Date", booking.date]] : []),
              ...(booking.time ? [["Time", booking.time]] : []),
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-xs text-gray-400">{k}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {booking.status === "active" && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 border border-red-300 text-red-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel"}
              </button>
              <button
                onClick={() => {
                  const url = (booking as Booking & {latitude?:number; longitude?:number}).latitude
                    ? `https://maps.google.com/?q=${(booking as Booking & {latitude?:number}).latitude},${(booking as Booking & {longitude?:number}).longitude}`
                    : `https://maps.google.com/?q=${encodeURIComponent(booking.parkingName + " Mumbai")}`;
                  window.open(url);
                }}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4"/> Navigate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Use real UID — falls back to guest-user so guest bookings still show
  const userId = user?.uid ?? "guest-user";
  const { bookings, loading, error } = useBookings(userId);

  const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  const activeCount    = bookings.filter(b => b.status === "active").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;

  if (authLoading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-lg mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
            {user && (
              <p className="text-xs text-gray-400 mt-0.5">
                {user.displayName ?? user.email}
              </p>
            )}
          </div>
          {!user && (
            <button
              onClick={() => router.push("/auth")}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl"
            >
              <LogIn className="w-4 h-4"/> Sign in
            </button>
          )}
        </div>

        {/* Stats row */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Total",     bookings.length,  "bg-blue-50 text-blue-700"],
              ["Active",    activeCount,       "bg-green-50 text-green-700"],
              ["Completed", completedCount,    "bg-gray-50 text-gray-600"],
            ].map(([label, count, cls]) => (
              <div key={String(label)} className={`${cls} rounded-2xl p-3 text-center`}>
                <p className="text-2xl font-black">{count}</p>
                <p className="text-xs font-semibold mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Not logged in notice */}
        {!user && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
            <LogIn className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-bold text-orange-800">You're browsing as a guest</p>
              <p className="text-xs text-orange-600 mt-1">Sign in to see your bookings across devices and keep your history saved.</p>
              <button onClick={() => router.push("/auth")}
                className="mt-2 text-xs font-bold text-orange-700 underline">
                Sign in now →
              </button>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "active", "completed", "cancelled"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === f
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "active" && activeCount > 0 && (
                <span className="ml-1.5 bg-white/30 text-white text-xs font-bold px-1.5 rounded-full">
                  {activeCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Booking list */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
            <p className="font-bold">Could not load bookings</p>
            <p className="text-xs mt-1 text-red-400">{error}</p>
            <p className="text-xs mt-2 text-red-500">Check Firestore rules — make sure read is allowed.</p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100"/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
            <p className="text-gray-400 font-semibold">
              {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
            </p>
            <p className="text-gray-300 text-sm mt-1">
              {filter === "all"
                ? "Tap any parking spot on the map to book"
                : `You have no ${filter} bookings`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => <HistoryCard key={b.id} booking={b}/>)}
          </div>
        )}

      </div>
    </div>
  );
}
