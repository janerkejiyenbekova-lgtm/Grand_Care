"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { initials } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export function Avatar({ src, name, size = 56, ring, style }: { src?: string; name: string; size?: number; ring?: string; style?: CSSProperties }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) || 0) * 11) % 360;
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg,hsl(${hue} 80% 70%),hsl(${(hue + 40) % 360} 80% 55%))`, boxShadow: ring ? `0 0 0 3px #fff, 0 0 0 5px ${ring}` : undefined, ...style }}
    >
      {src && !bad ? <img src={src} alt={name} loading="lazy" onError={() => setBad(true)} /> : initials(name)}
    </span>
  );
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${on ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = from.current, t0 = performance.now(), dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setN(Math.round(start + (to - start) * e));
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n.toLocaleString("en-US").replace(/,/g, "\u00a0")}{suffix}</>;
}

/** Kursor atrofida yumshoq yorug'lik (faqat sichqonchali qurilmalarda) */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const mv = (e: MouseEvent) => { x = e.clientX; y = e.clientY; };
    const loop = () => {
      cx += (x - cx) * 0.12; cy += (y - cy) * 0.12;
      if (ref.current) ref.current.style.transform = `translate(${cx - 200}px,${cy - 200}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", mv);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", mv); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="cursor-glow" aria-hidden />;
}

/** Karta ustiga sichqoncha olib borilganda yengil 3D qiyalik */
export function Tilt({ children, className = "", href, onClick }: { children: ReactNode; className?: string; href?: string; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-3px)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return <div ref={ref} className={`tilt ${className}`} onMouseMove={move} onMouseLeave={leave} onClick={onClick}>{children}</div>;
}

export function PhotoInput({ value, onChange, label, name = "Photo" }: { value: string; onChange: (dataUrl: string) => void; label?: string; name?: string }) {
  const { t } = useI18n();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const pick = async (f?: File | null) => {
    if (!f) return;
    setErr("");
    if (!f.type.startsWith("image/")) { setErr(t("form.photoOnly")); return; }
    setBusy(true);
    try {
      const { compressImage } = await import("@/lib/store");
      onChange(await compressImage(f));
    } catch { setErr(t("form.photoFail")); }
    setBusy(false);
  };
  return (
    <div className="photo-input">
      <label className="photo-drop">
        {value ? <img src={value} alt={name} /> : <span className="photo-ph">📷<small>{busy ? t("form.photoLoading") : label}</small></span>}
        <input type="file" accept="image/*" capture="environment" onChange={(e) => pick(e.target.files?.[0])} hidden />
      </label>
      {value && <button type="button" className="btn ghost sm" onClick={() => onChange("")}>{t("form.photoRemove")}</button>}
      {err && <div className="err">{err}</div>}
    </div>
  );
}

export function Chip({ children, color }: { children: ReactNode; color?: string }) {
  return <span className="chip" style={color ? ({ "--chip": color } as CSSProperties) : undefined}>{children}</span>;
}
