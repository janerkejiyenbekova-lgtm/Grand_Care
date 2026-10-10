"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/config";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Counter } from "./ui";
import { SitePreferences } from "./SitePreferences";
import { LogoMark, Wordmark } from "./Logo";

/** Dashboard (admin) sahifalarida navbar va footer ko'rinmaydi */
export function isDashboardPath(path: string | null): boolean {
  if (!path) return false;
  return path === "/admin" || path.startsWith("/admin/") || path === "/dashboard" || path.startsWith("/dashboard/");
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const { myVolunteerId } = useStore();
  const { t } = useI18n();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  if (isDashboardPath(path)) return null;
  const home = path === "/";
  const a = (hash: string) => (home ? hash : "/" + hash);
  return (
    <header className={`hdr ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap hdr-in">
        <Link href="/" className="logo" aria-label={SITE.name}>
          <LogoMark size={32} />
          <Wordmark />
        </Link>
        <nav className={`nav ${open ? "open" : ""}`}>
          <SitePreferences />
          <a href={a("#xarita")}>{t("nav.map")}</a>
          <a href={a("#muhtojlar")}>{t("nav.people")}</a>
          <a href={a("#volontyorlar")}>{t("nav.vols")}</a>
          {myVolunteerId && <Link href={`/volunteer/${myVolunteerId}`}>{t("nav.myProfile")}</Link>}
          <Link href="/report" className="btn primary sm nav-cta">{t("nav.report")}</Link>
        </nav>
        <button className="burger" aria-label={t("nav.menu")} onClick={() => setOpen((o) => !o)}><i /><i /><i /></button>
      </div>
    </header>
  );
}

export function LiveBadge() {
  const { lastSync, ready } = useStore();
  const { t } = useI18n();
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(t); }, []);
  const ago = lastSync ? Math.max(0, Math.round((Date.now() - lastSync) / 1000)) : null;
  return (
    <span className={`live ${ready ? "" : "off"}`}>
      <i />{ready ? t("common.live") : t("common.connecting")}{ago !== null && ready ? t("common.updatedAgo", { n: ago }) : ""}
    </span>
  );
}

export function Footer() {
  const path = usePathname();
  const { people, volunteers, helped } = useStore();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  if (isDashboardPath(path)) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(SITE.card.number.replace(/\s/g, "")); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <footer className="ftr" id="yordam">
      <div className="wrap ftr-grid">
        <div>
          <h3 className="ftr-title">{t("ftr.title")}</h3>
          <p className="muted">{t("ftr.desc")}</p>
          <div className="ftr-links">
            <Link href="/volunteer" className="btn primary">{t("hero.becomeVol")}</Link>
            <Link href="/report" className="btn ghost">{t("hero.reportLong")}</Link>
          </div>
          <div className="ftr-stats">
            <div><b><Counter to={people.length} /></b><span>{t("ftr.statPeople")}</span></div>
            <div><b><Counter to={volunteers.length} /></b><span>{t("ftr.statVols")}</span></div>
            <div><b><Counter to={helped} /></b><span>{t("ftr.statHelped")}</span></div>
          </div>
        </div>
        <div className="card3d">
          <div className="bank">
            <div className="bank-top">
              <span className="bank-brand"><LogoMark size={20} /> {SITE.name}</span>
              <span>{SITE.card.bank}</span>
            </div>
            <div className="bank-chip" />
            <div className="bank-num">{SITE.card.number}</div>
            <div className="bank-bot"><div><small>{t("ftr.cardOwner")}</small><b>{SITE.card.owner}</b></div></div>
          </div>
          <button className="btn glass copy" onClick={copy}>{copied ? t("ftr.copied") : t("ftr.copy")}</button>
        </div>
      </div>
      <div className="wrap ftr-bot">
        <span>© {new Date().getFullYear()} {SITE.name} — {t("ftr.rights")}</span>
        <span>{t("ftr.contact")} <a href={`tel:${SITE.contactPhone.replace(/\s/g, "")}`}>{SITE.contactPhone}</a></span>
      </div>
    </footer>
  );
}
