export interface ParkingSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  totalSlots: number;
  hourlyRate: number;
  amenities?: string[];
  imageUrl?: string;
}

export interface ParkingSlot {
  id?: string;
  slotId: string;
  parkingId: string;
  occupied: boolean;
  reserved: boolean;
  updatedAt?: Date | number;
  reservedUntil?: Date | number;
}

export interface Booking {
  id?: string;
  userId: string;
  parkingId: string;
  parkingName: string;
  slotId: string;
  type: "now" | "prebook";
  startTime: Date | string;
  endTime?: Date | string;
  date?: string;
  time?: string;
  duration: number; // hours
  cost: number;
  status: "active" | "completed" | "cancelled";
  createdAt?: Date | string;
  vehiclePlate?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  vehiclePlate?: string;
  createdAt?: Date | string;
}

export type SlotStatus = "available" | "occupied" | "reserved";

export interface MapCenter {
  lat: number;
  lng: number;
  zoom?: number;
}

export interface BookingFormData {
  date?: string;
  time?: string;
  duration: number;
  vehiclePlate?: string;
}

export interface ESP32Payload {
  parkingId: string;
  slotId: string;
  occupied: boolean;
  timestamp: number;
}
