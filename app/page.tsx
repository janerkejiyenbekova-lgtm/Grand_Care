"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, L, REGIONS, URGENCY_COLOR, type Category, type Urgency } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Avatar, Counter, Reveal } from "@/components/ui";
import { LiveBadge } from "@/components/Chrome";
import { MapPanel, PersonCard } from "@/components/PersonViews";
import HeroMap from "@/components/HeroMap";
import { LiveFeed } from "@/components/LiveFeed";

const HelpMap = dynamic(() => import("@/components/HelpMap"), { ssr: false, loading: () => <MapLoading /> });
function MapLoading() { const { t } = useI18n(); return <div className="map-loading">{t("map.loading")}</div>; }

function Typing() {
  const { t, lang } = useI18n();
  const WORDS = [t("hero.w1"), t("hero.w2"), t("hero.w3"), t("hero.w4")];
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => { setTxt(""); setDel(false); }, [lang]);
  useEffect(() => {
    const w = WORDS[i % WORDS.length];
    const tm = setTimeout(() => {
      if (!del) {
        if (txt.length < w.length) setTxt(w.slice(0, txt.length + 1));
        else setTimeout(() => setDel(true), 1100);
      } else if (txt.length > 0) setTxt(w.slice(0, txt.length - 1));
      else { setDel(false); setI((x) => x + 1); }
    }, del ? 28 : 55);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txt, del, i, lang]);
  return <span className="grad typing">{txt}<em /></span>;
}

export default function Home() {
  const i18n = useI18n();
  const { t } = i18n;
  const { people, volunteers, helped, ready } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [region, setRegion] = useState("");
  const [cat, setCat] = useState<"" | Category>("");
  const [urg, setUrg] = useState<"" | Urgency>("");
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return people.filter((p) =>
      (!region || p.region === region) && (!cat || p.category === cat) && (!urg || p.urgency === urg) &&
      (!s || (p.name + " " + p.district + " " + p.story).toLowerCase().includes(s)));
  }, [people, region, cat, urg, q]);

  const sorted = useMemo(() => {
    const w: Record<Urgency, number> = { high: 0, medium: 1, low: 2 };
    return [...filtered].sort((a, b) => w[a.urgency] - w[b.urgency] || b.createdAt - a.createdAt);
  }, [filtered]);

  const selectedPerson = people.find((p) => p.id === selected) ?? null;
  const urgent = people.filter((p) => p.urgency === "high" && p.status !== "closed").length;
  const faces = people.filter((p) => p.photo).slice(0, 5);
  const regionsCovered = new Set(people.map((p) => p.region)).size;

  const openOnMap = (id: string) => {
    setSelected(id);
    document.getElementById("xarita")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* HERO */}
      <section className="hero wrap">
        <div className="hero-text">
          <LiveBadge />
          <h1>
            {t("hero.title1")}<br />{t("hero.title2")}
            <span className="hero-sub"><Typing /></span>
          </h1>
          <p className="lead">{t("hero.lead")}</p>
          <div className="hero-cta">
            <a href="#xarita" className="btn primary lg">{t("hero.openMap")}</a>
            <Link href="/volunteer" className="btn ghost lg">{t("hero.becomeVol")}</Link>
            <Link href="/report" className="btn text lg">{t("hero.report")} →</Link>
          </div>
          <div className="faces">
            {faces.map((f, i) => <Avatar key={f.id} src={f.photo} name={f.name} size={40} style={{ marginLeft: i ? -10 : 0 }} />)}
            <span className="muted tiny">{t("hero.waiting", { n: people.length })}</span>
          </div>
        </div>
        <div className="hero-visual">
          <HeroMap people={people} />
        </div>
      </section>

      <section className="wrap stats-strip">
        <div><b><Counter to={people.length} /></b><span>{t("stat.people")}</span></div>
        <div className="is-urgent"><b><Counter to={urgent} /></b><span>{t("stat.urgent")}</span></div>
        <div><b><Counter to={volunteers.length} /></b><span>{t("stat.vols")}</span></div>
        <div><b><Counter to={helped} /></b><span>{t("stat.helped")}</span></div>
      </section>

      {/* JONLI LENTA */}
      <LiveFeed />

      {/* MARQUEE */}
      <div className="marquee" aria-hidden>
        <div>{[...Array(2)].map((_, k) => (
          <span key={k}>{["food", "medicine", "company", "repair", "clothes", "cleaning", "money"].map((h) => (
            <b key={h}>{L.helpIcon[h as keyof typeof L.helpIcon]} {i18n.help(h as keyof typeof L.help)}<i>✦</i></b>
          ))}</span>
        ))}</div>
      </div>

      {/* XARITA */}
      <section id="xarita" className="section wrap">
        <Reveal>
          <div className="sec-head">
            <div>
              <span className="eyebrow">{t("map.eyebrow")}</span>
              <h2>{t("map.title")}</h2>
              <p className="muted">{t("map.desc")}</p>
            </div>
            <LiveBadge />
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="filters glass">
            <input className="in" placeholder={t("map.search")} value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="in" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">{t("common.regionTotal")}</option>
              {REGIONS.map((r) => <option key={r.name} value={r.name}>{i18n.region(r.name)}</option>)}
            </select>
            <select className="in" value={cat} onChange={(e) => setCat(e.target.value as Category | "")}>
              <option value="">{t("common.allCategories")}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{i18n.category(c)}</option>)}
            </select>
            <select className="in" value={urg} onChange={(e) => setUrg(e.target.value as Urgency | "")}>
              <option value="">{t("common.anyUrgency")}</option>
              {(["high", "medium", "low"] as const).map((u) => <option key={u} value={u}>{i18n.urgency(u)}</option>)}
            </select>
          </div>
          <div className="muted tiny count">{t("map.count", { n: filtered.length, r: regionsCovered })}</div>
          <HelpMap people={filtered} selectedId={selected} onSelect={setSelected}>
            {selectedPerson && <MapPanel p={selectedPerson} onClose={() => setSelected(null)} />}
          </HelpMap>
        </Reveal>
      </section>

      {/* MUHTOJLAR */}
      <section id="muhtojlar" className="section wrap">
        <Reveal>
          <div className="sec-head">
            <div>
              <span className="eyebrow">{t("people.eyebrow")}</span>
              <h2>{t("people.title")}</h2>
              <p className="muted">{t("people.desc")}</p>
            </div>
            <Link href="/report" className="btn primary">{t("people.add")}</Link>
          </div>
        </Reveal>
        {!ready && <div className="empty">{t("common.loading")}</div>}
        {ready && sorted.length === 0 && <div className="empty">{t("people.empty")}</div>}
        <div className="grid">
          {(showAll ? sorted : sorted.slice(0, 6)).map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 70}><PersonCard p={p} onOpen={() => openOnMap(p.id)} /></Reveal>
          ))}
        </div>
        {sorted.length > 6 && (
          <div className="center"><button className="btn glass" onClick={() => setShowAll((s) => !s)}>{showAll ? t("people.less") : t("people.more", { n: sorted.length - 6 })}</button></div>
        )}
      </section>

      {/* VOLONTYORLAR */}
      <section id="volontyorlar" className="section wrap">
        <Reveal>
          <div className="sec-head">
            <div>
              <span className="eyebrow">{t("vols.eyebrow")}</span>
              <h2>{t("vols.title")}</h2>
              <p className="muted">{t("vols.desc")}</p>
            </div>
            <Link href="/volunteer" className="btn primary">{t("hero.becomeVol")}</Link>
          </div>
        </Reveal>
        <div className="grid vgrid">
          {volunteers.slice(0, 8).map((v, i) => (
            <Reveal key={v.id} delay={(i % 4) * 60}>
              <Link href={`/volunteer/${v.id}`} className="vcard">
                <Avatar src={v.photo} name={v.name} size={72} />
                <b>{v.name}</b>
                <span className="muted tiny">{i18n.regionShort(v.region)}</span>
                <div className="chips c">{v.skills.slice(0, 3).map((s) => <span key={s} className="chip">{L.helpIcon[s]}</span>)}</div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* QADAMLAR */}
      <section className="section wrap">
        <div className="steps">
          {(["1", "2", "3"] as const).map((n, k) => (
            <Reveal key={n} delay={k * 90}><div className="step glass"><span>{n}</span><h4>{t(`steps.${n}.t` as const)}</h4><p className="muted">{t(`steps.${n}.d` as const)}</p></div></Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
