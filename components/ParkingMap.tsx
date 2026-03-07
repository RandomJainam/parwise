"use client";

import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { getAvailabilityColor, getAvailabilityLabel } from "@/lib/utils";
import { MUMBAI_PARKING_SITES, getRandomAvailability } from "@/lib/mumbaiParkingData";
import { useSlotTick } from "@/hooks/useSlotTick";
import { useLotBookedCount } from "@/hooks/useFirestore";
import type { ParkingSite } from "@/types";

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createParkingIcon(color: string, available: number, total: number) {
  const ring = color;
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:42px;height:42px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          border:3px solid ${ring};background:white;
          box-shadow:0 3px 10px rgba(0,0,0,0.22);
          display:flex;align-items:center;justify-content:center;flex-direction:column;
        ">
          <span style="font-size:11px;font-weight:800;color:${color};line-height:1;">${available}</span>
          <span style="font-size:8px;font-weight:600;color:#64748b;line-height:1.2;">free</span>
        </div>
        <div style="
          position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);
          width:0;height:0;
          border-left:6px solid transparent;border-right:6px solid transparent;
          border-top:8px solid ${ring};
        "></div>
      </div>
    `,
    iconSize: [42, 50],
    iconAnchor: [21, 50],
    popupAnchor: [0, -52],
  });
}

function MapController({ center }: { center: [number, number] }) {
  const map  = useMap();
  const prev = useRef<[number, number]>(center);
  useEffect(() => {
    if (prev.current[0] !== center[0] || prev.current[1] !== center[1]) {
      map.flyTo(center, 15, { duration: 1.2 });
      prev.current = center;
    }
  }, [center, map]);
  return null;
}

// ── Each marker subtracts its own Firestore booked count ──────────────────────
function SiteMarker({
  site, baseAvailable, onClick, isSelected,
}: {
  site: ParkingSite;
  baseAvailable: number;      // from 15-min random tick
  onClick: (site: ParkingSite) => void;
  isSelected: boolean;
}) {
  // Real-time booked count from Firestore for this specific lot
  const booked = useLotBookedCount(site.id);

  // Final available = random base − booked (floor at 0)
  const available = Math.max(0, baseAvailable - booked);
  const color     = getAvailabilityColor(available, site.totalSlots);
  const label     = getAvailabilityLabel(available, site.totalSlots);
  const icon      = createParkingIcon(color, available, site.totalSlots);

  return (
    <Marker
      position={[site.latitude, site.longitude]}
      icon={icon}
      opacity={isSelected ? 1 : 0.88}
      eventHandlers={{ click: () => onClick(site) }}
    >
      <Popup>
        <div style={{ minWidth: 160 }}>
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{site.name}</p>
          <p style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{site.address}</p>
          <p style={{ fontSize: 11 }}>
            <span style={{ color, fontWeight: 700 }}>{available} free</span>
            <span style={{ color: "#94a3b8" }}> / {site.totalSlots} total</span>
          </p>
          <p style={{ fontSize: 11, color: "#64748b" }}>₹{site.hourlyRate}/hr • {label}</p>
          {booked > 0 && (
            <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{booked} slot{booked>1?"s":""} booked</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

interface ParkingMapProps {
  center: [number, number];
  onMarkerClick: (site: ParkingSite, available: number) => void;
  selectedId: string | null;
}

export default function ParkingMap({ center, onMarkerClick, selectedId }: ParkingMapProps) {
  // Shared 15-min tick — same value for all users at the same clock time
  const tick = useSlotTick();

  // Recompute base availability only when the 15-min tick changes
  const baseAvailability = useMemo(() => {
    const map: Record<string, number> = {};
    MUMBAI_PARKING_SITES.forEach(s => {
      // Seed combines site id + tick so each 15-min window gives a new pattern
      // but the same tick → same numbers for all users simultaneously
      map[s.id] = getRandomAvailability(s.totalSlots);
    });
    return map;
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MapContainer center={center} zoom={12} style={{ width:"100%", height:"100%" }} zoomControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} />
      {MUMBAI_PARKING_SITES.map(site => (
        <SiteMarker
          key={site.id}
          site={site}
          baseAvailable={baseAvailability[site.id] ?? 0}
          onClick={s => onMarkerClick(s, Math.max(0, (baseAvailability[s.id]??0)))}
          isSelected={site.id === selectedId}
        />
      ))}
    </MapContainer>
  );
}
