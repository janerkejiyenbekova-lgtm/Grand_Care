"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { UZ_BOUNDS, URGENCY_COLOR, esc, initials, type Person } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { attachBaseTiles, uzbOutline, type TileStatus } from "@/lib/tiles";

export type MapSize = "s" | "m" | "l" | "full";
const SIZES = [
  { k: "s", key: "map.small" },
  { k: "m", key: "map.medium" },
  { k: "l", key: "map.large" },
  { k: "full", key: "map.full" },
] as const;

interface Props {
  people: Person[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  children?: ReactNode; // yon panel
}

function pinHtml(p: Person, selected: boolean) {
  const c = URGENCY_COLOR[p.urgency];
  const ini = esc(initials(p.name));
  const img = p.photo ? `<img src="${esc(p.photo)}" alt="" onerror="this.style.display='none'"/>` : "";
  return `<div class="pin ${p.urgency === "high" ? "pulse" : ""} ${p.status === "new" ? "isnew" : ""} ${selected ? "sel" : ""}" style="--c:${c}"><span class="pin-ini">${ini}</span>${img}<i></i></div>`;
}

export default function HelpMap({ people, selectedId, onSelect, children }: Props) {
  const { t } = useI18n();
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const [size, setSize] = useState<MapSize>("m");
  const [ready, setReady] = useState(false);
  const [tiles, setTiles] = useState<TileStatus>("loading");
  const cb = useRef(onSelect);
  cb.current = onSelect;
  const lastSel = useRef<string | null>(null);

  // Xaritani bir marta yaratish. Konteyner haqiqiy o'lchamga ega bo'lgandan keyin
  // joylaymiz (ResizeObserver) — yashirin/0 o'lchamli konteynerda xarita bo'sh chiqmasin.
  useEffect(() => {
    let cancelled = false;
    let fitted = false;
    let stopTiles: (() => void) | null = null;
    let ro: ResizeObserver | null = null;

    import("leaflet")
      .then((mod: any) => {
        const L = mod.default ?? mod;
        const node = el.current;
        if (cancelled || !node) return;
        LRef.current = L;

        const map = L.map(node, {
          zoomControl: true,
          minZoom: 5,
          maxZoom: 18,
          maxBounds: L.latLngBounds([[33.5, 51.5], [48.5, 77]]),
          maxBoundsViscosity: 0.8,
          attributionControl: true,
        });
        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);

        stopTiles = attachBaseTiles(L, map, (s) => { if (!cancelled) setTiles(s); });
        uzbOutline(L).addTo(map);
        map.on("click", () => cb.current(null));

        const fit = () => {
          if (cancelled || !mapRef.current) return;
          map.invalidateSize();
          if (!fitted && node.clientWidth > 0 && node.clientHeight > 0) {
            fitted = true;
            map.fitBounds(UZ_BOUNDS, { animate: false });
          }
        };
        if (typeof ResizeObserver !== "undefined") {
          ro = new ResizeObserver(fit);
          ro.observe(node);
        }
        fit();
        setTimeout(fit, 120);
        setTimeout(fit, 600);
        setReady(true);
      })
      .catch(() => { if (!cancelled) setTiles("offline"); });

    return () => {
      cancelled = true;
      ro?.disconnect();
      stopTiles?.();
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      setReady(false);
    };
  }, []);

  // Markerlarni chizish (ma'lumot yangilanganda avtomatik)
  useEffect(() => {
    const L = LRef.current, layer = layerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    people.filter((p) => p.status !== "closed").forEach((p) => {
      const sel = p.id === selectedId;
      const icon = L.divIcon({ className: "pin-wrap", html: pinHtml(p, sel), iconSize: [46, 54], iconAnchor: [23, 54] });
      const m = L.marker([p.lat, p.lng], { icon, zIndexOffset: sel ? 1000 : p.urgency === "high" ? 500 : 0, title: p.name, keyboard: true });
      m.on("click", (e: any) => { L.DomEvent.stopPropagation(e); cb.current(p.id); });
      m.addTo(layer);
    });
  }, [people, selectedId, ready]);

  // Tanlanganda xaritani unga olib borish
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId || lastSel.current === selectedId) { lastSel.current = selectedId; return; }
    lastSel.current = selectedId;
    const p = people.find((x) => x.id === selectedId);
    if (p) map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 9), { duration: 0.8 });
  }, [selectedId, people]);

  // O'lcham o'zgarganda
  useEffect(() => {
    const t1 = setTimeout(() => mapRef.current?.invalidateSize(), 60);
    const t2 = setTimeout(() => mapRef.current?.invalidateSize(), 420);
    document.body.classList.toggle("no-scroll", size === "full");
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [size]);
  useEffect(() => () => document.body.classList.remove("no-scroll"), []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setSize((s) => (s === "full" ? "l" : s)); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const fitAll = () => {
    const map = mapRef.current, L = LRef.current;
    if (!map || !L) return;
    const pts = people.filter((p) => p.status !== "closed").map((p) => [p.lat, p.lng]);
    if (pts.length > 1) map.flyToBounds(L.latLngBounds(pts).pad(0.2), { duration: 0.8 });
    else map.flyToBounds(UZ_BOUNDS, { duration: 0.8 });
  };

  return (
    <div className={`map-shell ${size}`} data-tiles={tiles}>
      <div ref={el} className="map-canvas" />
      <div className="map-ctrl">
        <div className="seg">
          {SIZES.map((s) => (
            <button key={s.k} type="button" className={size === s.k ? "on" : ""} onClick={() => setSize(s.k)}>
              {s.k === "full" ? "⤢" : t(s.key)}
            </button>
          ))}
        </div>
        <button type="button" className="btn glass sm" onClick={fitAll}>{t("map.showAll")}</button>
        {size === "full" && <button type="button" className="btn primary sm" onClick={() => setSize("l")}>{t("map.closeFull")}</button>}
      </div>
      <div className="map-legend">
        <span><i style={{ background: URGENCY_COLOR.high }} />{t("urg.high")}</span>
        <span><i style={{ background: URGENCY_COLOR.medium }} />{t("urg.medium")}</span>
        <span><i style={{ background: URGENCY_COLOR.low }} />{t("urg.low")}</span>
      </div>
      {children}
    </div>
  );
}
