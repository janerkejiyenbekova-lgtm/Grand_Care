"use client";
import uzb from "@/lib/uzb.json";
import { URGENCY_COLOR, type Person } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

// Oddiy proyeksiya: O'zbekiston chegarasi + har bir muhtoj inson nuqtasi (jonli ma'lumotdan)
const LON0 = 55.5, LON1 = 73.5, LAT0 = 36.9, LAT1 = 45.8;
const K = Math.cos((41 * Math.PI) / 180);
const W = 1000;
const S = W / ((LON1 - LON0) * K);
const H = Math.round((LAT1 - LAT0) * S);
const px = (lng: number) => (lng - LON0) * K * S;
const py = (lat: number) => (LAT1 - lat) * S;

const LAND = (() => {
  const polys = (uzb as any).features[0].geometry.coordinates as number[][][][];
  return polys
    .map((poly) => poly.map((ring) => "M" + ring.map(([x, y]) => `${px(x).toFixed(1)} ${py(y).toFixed(1)}`).join("L") + "Z").join(""))
    .join("");
})();

export default function HeroMap({ people }: { people: Person[] }) {
  const { t } = useI18n();
  const open = people.filter((p) => p.status !== "closed");
  const regions = new Set(open.map((p) => p.region)).size;
  return (
    <figure className="hmap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("map.title")} preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="hm-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" className="hm-grid-line" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#hm-grid)" />
        <path d={LAND} className="hm-land" />
        {open.map((p) => {
          const c = URGENCY_COLOR[p.urgency];
          return (
            <g key={p.id} transform={`translate(${px(p.lng).toFixed(1)} ${py(p.lat).toFixed(1)})`} className={`hm-pin ${p.urgency}`} style={{ "--c": c } as React.CSSProperties}>
              <circle r="15" className="hm-halo" />
              <circle r="5" className="hm-dot" />
              <title>{p.name}</title>
            </g>
          );
        })}
      </svg>
      <figcaption>
        <span className="hm-live" />
        {t("map.count", { n: open.length, r: regions })}
      </figcaption>
    </figure>
  );
}
