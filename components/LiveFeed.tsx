"use client";
import { useMemo } from "react";
import { L, initials } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

/** Eng so'nggi so'rovlar — ism bosh harflar bilan (maxfiylik uchun) jonli lentada aylanadi */
export function LiveFeed() {
  const { people } = useStore();
  const { t, help, timeAgo, region } = useI18n();

  const items = useMemo(
    () =>
      [...people]
        .filter((p) => p.status !== "closed" && p.help.length > 0)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10),
    [people],
  );

  if (items.length === 0) return null;

  const row = (k: number) =>
    items.map((p) => {
      const h = p.help[0];
      return (
        <b key={`${k}-${p.id}`}>
          <span className="feed-ini">{initials(p.name)}</span>
          {L.helpIcon[h]} {help(h)}
          <em>· {p.district || region(p.region)} · {timeAgo(p.createdAt)}</em>
          <i>✦</i>
        </b>
      );
    });

  return (
    <section className="feed" aria-label={t("feed.title")}>
      <div className="wrap feed-in">
        <span className="feed-tag"><span className="hm-live" />{t("feed.title")}</span>
        <div className="feed-track" aria-hidden>
          <div>
            <span>{row(0)}</span>
            <span>{row(1)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
