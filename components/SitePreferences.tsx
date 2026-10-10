"use client";
import { useEffect, useState } from "react";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function SitePreferences() {
  const { lang, setLang, t } = useI18n();
  const [dark, setDark] = useState(false);

  // Tema <head>dagi skript orqali allaqachon qo'yilgan — holatni shundan o'qiymiz
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("mehr-dark", next ? "1" : "0"); } catch {}
  };

  return (
    <div className="site-preferences">
      <select aria-label={t("pref.lang")} value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
        {LANGS.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
      </select>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggle}
        aria-label={dark ? t("pref.light") : t("pref.dark")}
        title={dark ? t("pref.light") : t("pref.dark")}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
}
