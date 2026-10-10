"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { REGIONS } from "@/lib/data";
import { attachBaseTiles, uzbOutline } from "@/lib/tiles";

interface Props {
  region: string;
  value: { lat: number; lng: number } | null;
  onChange: (v: { lat: number; lng: number }) => void;
}

export default function LocationPicker({ region, value, onChange }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const cb = useRef(onChange);
  cb.current = onChange;
  const fromClick = useRef(false);

  const place = (lat: number, lng: number) => {
    const L = LRef.current, map = mapRef.current;
    if (!L || !map) return;
    const icon = L.divIcon({ className: "pick-wrap", html: '<div class="pick-pin">📍</div>', iconSize: [34, 34], iconAnchor: [17, 32] });
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    else markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
  };

  useEffect(() => {
    let off = false;
    let stopTiles: (() => void) | null = null;
    import("leaflet").then((mod) => {
      const L = (mod as any).default ?? mod;
      if (off || !el.current || mapRef.current) return;
      LRef.current = L;
      const rc = REGIONS.find((r) => r.name === region) ?? REGIONS[0];
      const map = L.map(el.current, { minZoom: 5, maxZoom: 18 }).setView(value ? [value.lat, value.lng] : [rc.lat, rc.lng], value ? 13 : 9);
      mapRef.current = map;
      stopTiles = attachBaseTiles(L, map);
      uzbOutline(L).addTo(map);
      map.on("click", (e: any) => { fromClick.current = true; place(e.latlng.lat, e.latlng.lng); cb.current({ lat: e.latlng.lat, lng: e.latlng.lng }); });
      if (value) place(value.lat, value.lng);
      setTimeout(() => map.invalidateSize(), 50);
    });
    return () => { off = true; stopTiles?.(); mapRef.current?.remove(); mapRef.current = null; markerRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Viloyat o'zgarsa xarita markazi o'tadi
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const rc = REGIONS.find((r) => r.name === region);
    if (rc && !value) map.flyTo([rc.lat, rc.lng], 9, { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  // Tashqaridan (GPS) qiymat kelsa
  useEffect(() => {
    if (fromClick.current) { fromClick.current = false; return; }
    if (value && mapRef.current) { place(value.lat, value.lng); mapRef.current.flyTo([value.lat, value.lng], 14, { duration: 0.6 }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  return <div ref={el} className="pick-map" />;
}
