"use client";
import Link from "next/link";
import { useState } from "react";
import { L, URGENCY_COLOR, type Person } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/config";
import { useStore } from "@/lib/store";
import { Avatar, Chip, Tilt } from "./ui";

export function HelpButton({ p }: { p: Person }) {
  const { t } = useI18n();
  const { post, myVolunteerId } = useStore();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try { await post("/api/person", { action: "help", id: p.id }); setDone(true); } catch {}
    setBusy(false);
  };
  if (done)
    return (
      <div className="thanks">
        {t("help.thanks")}<a href={`tel:${SITE.contactPhone.replace(/\s/g, "")}`}>{SITE.contactPhone}</a>
        {!myVolunteerId && <div><Link href="/volunteer" className="link">{t("help.createProfile")}</Link></div>}
      </div>
    );
  return <button className="btn primary block" disabled={busy} onClick={go}>{busy ? "…" : t("help.btn")}</button>;
}

export function PersonDetail({ p, showPrivate = false }: { p: Person; showPrivate?: boolean }) {
  const i = useI18n();
  const { t } = i;
  const c = URGENCY_COLOR[p.urgency];
  return (
    <div className="pd">
      <div className="pd-photo">
        {p.photo ? <img src={p.photo} alt={p.name} onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} /> : null}
        <Avatar name={p.name} size={120} src="" style={{ position: "absolute", inset: 0, margin: "auto", zIndex: -1 }} />
        <span className="pd-urg" style={{ background: c }}>● {i.urgency(p.urgency)}</span>
        {p.status === "new" && <span className="pd-new">{t("pd.checking")}</span>}
      </div>
      <h3 className="pd-name">{p.name}</h3>
      <div className="pd-meta">
        {p.age ? `${t("common.yearsOld", { n: p.age })} · ` : ""}{i.category(p.category)}
      </div>
      <dl className="pd-list">
        <div><dt>{t("pd.region")}</dt><dd>{i.region(p.region)}{p.district ? `, ${p.district}` : ""}</dd></div>
        <div><dt>{t("pd.added")}</dt><dd>{i.timeAgo(p.createdAt)}</dd></div>
        <div><dt>{t("pd.status")}</dt><dd>{i.status(p.status)}</dd></div>
        <div><dt>{t("pd.helpers")}</dt><dd>{t("pd.helperCount", { n: p.helpers })}</dd></div>
        <div><dt>{t("pd.reporter")}</dt><dd>{p.reporter === "Noma'lum" ? t("pd.unknown") : p.reporter}</dd></div>
        {showPrivate && (
          <>
            <div><dt>{t("pd.address")}</dt><dd>{p.address || "—"}</dd></div>
            <div><dt>{t("pd.phone")}</dt><dd><a href={`tel:${p.phone.replace(/\s/g, "")}`}>{p.phone || "—"}</a></dd></div>
          </>
        )}
      </dl>
      <p className="pd-story">{p.story}</p>
      <div className="chips">{p.help.map((h) => <Chip key={h}>{L.helpIcon[h]} {i.help(h)}</Chip>)}</div>
      {!showPrivate && <p className="tiny muted">{t("pd.privacy")}</p>}
      {p.staffNote && showPrivate && <div className="note">📝 {p.staffNote}</div>}
    </div>
  );
}

export function MapPanel({ p, onClose }: { p: Person; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <aside className="side" onClick={(e) => e.stopPropagation()}>
      <button className="side-x" onClick={onClose} aria-label={t("common.close")}>✕</button>
      <PersonDetail p={p} />
      <div className="side-actions">
        <HelpButton p={p} />
        <Link href={`/person/${p.id}`} className="btn ghost block">{t("pd.openPage")}</Link>
      </div>
    </aside>
  );
}

export function PersonCard({ p, onOpen }: { p: Person; onOpen: () => void }) {
  const i = useI18n();
  const { t } = i;
  const c = URGENCY_COLOR[p.urgency];
  return (
    <Tilt className="pcard" onClick={onOpen}>
      <div className="pcard-top">
        <Avatar src={p.photo} name={p.name} size={64} ring={c} />
        <div>
          <b>{p.name}</b>
          <div className="muted tiny">{p.age ? `${t("common.yearsOld", { n: p.age })} · ` : ""}{i.regionShort(p.region)}</div>
        </div>
        <span className="dot" style={{ background: c }} title={i.urgency(p.urgency)} />
      </div>
      <p className="pcard-story">{p.story}</p>
      <div className="chips">{p.help.slice(0, 3).map((h) => <Chip key={h}>{L.helpIcon[h]} {i.help(h)}</Chip>)}</div>
      <div className="pcard-foot"><span>{i.category(p.category)}</span><span>🤝 {p.helpers}</span></div>
    </Tilt>
  );
}
