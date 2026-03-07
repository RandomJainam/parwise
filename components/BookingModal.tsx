"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createBooking } from "@/hooks/useFirestore";
import { formatCurrency, estimateCost } from "@/lib/utils";
import type { ParkingSite, ParkingSlot, BookingFormData } from "@/types";

interface BookingModalProps {
  site: ParkingSite;
  slots: ParkingSlot[];
  availableCount?: number;
  selectedSlot: string | null;
  type: "now" | "prebook";
  onClose: () => void;
}

type Step = "form" | "confirm" | "success";

export default function BookingModal({
  site,
  slots,
  selectedSlot,
  type,
  onClose,
}: BookingModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [chosenSlot, setChosenSlot] = useState(selectedSlot ?? "");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormData>({
    defaultValues: { duration: 2 },
  });

  const duration = watch("duration");
  const cost = estimateCost(Number(duration) || 1, site.hourlyRate);

  const availableSlots = slots.length > 0
    ? slots.filter((s) => !s.occupied && !s.reserved)
    : Array.from({ length: availableCount ?? 5 }, (_, i) => ({ slotId: `A${i+1}`, occupied: false, reserved: false, parkingId: site.id } as ParkingSlot));

  const onSubmit = (data: BookingFormData) => {
    if (!chosenSlot) return toast.error("Please select a slot");
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!chosenSlot) return;
    setLoading(true);
    try {
      await createBooking({
        userId: "guest-user", // Replace with real auth uid
        parkingId: site.id,
        parkingName: site.name,
        slotId: chosenSlot,
        type,
        startTime: new Date().toISOString(),
        duration: Number(duration) || 1,
        cost,
        status: "active",
        vehiclePlate: "",
      });
      setStep("success");
      toast.success("Booking confirmed!");
    } catch (err) {
      toast.error("Booking failed. Check Firebase permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[2000] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {type === "now" ? "🚗 Park Now" : "🗓 Pre-book Slot"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* ── FORM ── */}
          {step === "form" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Site info */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="font-semibold text-blue-900">{site.name}</p>
                <p className="text-sm text-blue-600">{site.address}</p>
                <p className="text-sm font-medium text-blue-800 mt-1">
                  {formatCurrency(site.hourlyRate)}/hr
                </p>
              </div>

              {/* Slot picker */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Select Slot
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-gray-400">No slots available</p>
                  ) : (
                    availableSlots.map((slot) => (
                      <button
                        key={slot.slotId}
                        type="button"
                        onClick={() => setChosenSlot(slot.slotId)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                          chosenSlot === slot.slotId
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-green-50 text-green-700 border-green-400"
                        }`}
                      >
                        {slot.slotId}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Prebook date/time */}
              {type === "prebook" && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Date
                    </label>
                    <input
                      type="date"
                      {...register("date", { required: "Date is required" })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Time
                    </label>
                    <input
                      type="time"
                      {...register("time", { required: "Time is required" })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time.message}</p>}
                  </div>
                </>
              )}

              {/* Duration */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Duration: {duration} hour{duration > 1 ? "s" : ""}
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  {...register("duration")}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1h</span>
                  <span>12h</span>
                </div>
              </div>

              {/* Cost estimate */}
              <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Estimated cost</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(cost)}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </form>
          )}

          {/* ── CONFIRM ── */}
          {step === "confirm" && (
            <div className="space-y-5">
              <div className="space-y-3">
                {[
                  ["Parking", site.name],
                  ["Slot", chosenSlot],
                  ["Duration", `${duration} hour${duration > 1 ? "s" : ""}`],
                  ["Total", formatCurrency(cost)],
                  ["Type", type === "now" ? "Immediate" : "Pre-booked"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? "Confirming…" : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Booking Confirmed!</h3>
              <p className="text-gray-500 text-sm">
                Slot <strong>{chosenSlot}</strong> at {site.name} is reserved for you.
              </p>
              <div className="bg-green-50 rounded-2xl p-4">
                <p className="text-green-700 font-semibold">{formatCurrency(cost)} estimated</p>
                <p className="text-green-600 text-sm">{duration} hour{duration > 1 ? "s" : ""} parking</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${site.latitude},${site.longitude}`)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-semibold"
                >
                  Navigate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
