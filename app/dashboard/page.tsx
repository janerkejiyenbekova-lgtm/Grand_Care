"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, L, REGIONS, URGENCY_COLOR, type Person, type Status, type Urgency } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Avatar, Counter } from "@/components/ui";
import { LiveBadge } from "@/components/Chrome";
import { PersonDetail } from "@/components/PersonViews";

function Login() {
  const { login } = useStore();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const ok = await login(name.trim().toLowerCase(), pw);
    if (!ok) setErr(t("login.err"));
    setBusy(false);
  };
  return (
    <section className="wrap page narrow login-wrap">
      <form className="glass login" onSubmit={go}>
        <div className="big">🔐</div>
        <h1>{t("login.title")}</h1>
        <p className="muted">{t("login.desc")}</p>
        <label className="fld"><span>{t("login.name")}</span><input className="in" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" autoCapitalize="none" placeholder={t("login.namePh")} required /></label>
        <label className="fld"><span>{t("login.pw")}</span><input className="in" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" placeholder="••••" required /></label>
        {err && <div className="err big shake">{err}</div>}
        <button className="btn primary lg block" disabled={busy}>{busy ? t("common.checking") : t("login.submit")}</button>
        <Link href="/" className="back c">{t("login.back")}</Link>
      </form>
    </section>
  );
}

function PersonModal({ p, onClose }: { p: Person; onClose: () => void }) {
  const { staffAction } = useStore();
  const { t } = useI18n();
  const [note, setNote] = useState((p.staffNote || "").replace(/ — [^—]+$/, ""));
  const [saved, setSaved] = useState(false);
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card glass" onClick={(e) => e.stopPropagation()}>
        <button className="side-x" onClick={onClose}>✕</button>
        <PersonDetail p={p} showPrivate />
        <label className="fld"><span>{t("dash.note")}</span><textarea className="in" rows={3} value={note} onChange={(e) => { setNote(e.target.value); setSaved(false); }} placeholder={t("dash.notePh")} /></label>
        <div className="row">
          <button className="btn primary sm" onClick={async () => { setSaved(await staffAction("setNote", { id: p.id, note })); }}>{t("dash.saveNote")}</button>
          {saved && <span className="tiny" style={{ color: "#10b981" }}>{t("common.saved")}</span>}
          <Link href={`/person/${p.id}`} className="btn ghost sm">{t("dash.pageBtn")}</Link>
        </div>
      </div>
    </div>
  );
}

function Overview({ people, volunteers, helped }: { people: Person[]; volunteers: any[]; helped: number }) {
  const i = useI18n();
  const { t } = i;
  const active = people.filter((p) => p.status !== "closed");
  const byRegion = REGIONS.map((r) => ({ name: i.regionShort(r.name), n: active.filter((p) => p.region === r.name).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...byRegion.map((x) => x.n));
  const cats = CATEGORIES.map((c) => ({ c, n: active.filter((p) => p.category === c).length }));
  const total = Math.max(1, cats.reduce((s, x) => s + x.n, 0));
  const colors = ["#38bdf8", "#6366f1", "#10b981", "#f59e0b", "#ec4899"];
  let acc = 0;
  const conic = cats.map((x, i) => { const a = acc; acc += (x.n / total) * 100; return `${colors[i]} ${a}% ${acc}%`; }).join(",");
  const recent = [...people].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
  const kpi: [string, number, string][] = [
    [t("kpi.total"), people.length, "#0ea5e9"],
    [t("kpi.new"), people.filter((p) => p.status === "new").length, "#6366f1"],
    [t("kpi.urgent"), active.filter((p) => p.urgency === "high").length, URGENCY_COLOR.high],
    [t("kpi.helped"), people.filter((p) => p.status === "helped").length, "#10b981"],
    [t("kpi.vols"), volunteers.length, "#0284c7"],
    [t("kpi.totalHelp"), helped, "#f59e0b"],
  ];
  return (
    <>
      <div className="kpis">{kpi.map(([t, n, c]) => <div key={t} className="kpi glass"><b style={{ color: c }}><Counter to={n} /></b><span>{t}</span></div>)}</div>
      <div className="dash-two">
        <div className="glass pad">
          <h3>{t("dash.byRegion")}</h3>
          <div className="bars">
            {byRegion.map((r) => <div key={r.name} className="bar"><span>{r.name}</span><div><i style={{ width: `${(r.n / max) * 100}%` }} /></div><b>{r.n}</b></div>)}
            {byRegion.length === 0 && <p className="muted">{t("common.noData")}</p>}
          </div>
        </div>
        <div className="glass pad">
          <h3>{t("dash.categories")}</h3>
          <div className="donut-row">
            <div className="donut" style={{ background: `conic-gradient(${conic})` }}><span>{active.length}</span></div>
            <ul className="legend">{cats.map((x, k) => <li key={x.c}><i style={{ background: colors[k] }} />{i.category(x.c)} <b>{x.n}</b></li>)}</ul>
          </div>
          <h3 style={{ marginTop: 22 }}>{t("dash.recent")}</h3>
          <div className="mini-list">
            {recent.map((p) => <div key={p.id} className="mini static"><Avatar src={p.photo} name={p.name} size={38} /><div><b>{p.name}</b><div className="tiny muted">{i.timeAgo(p.createdAt)} · {i.status(p.status)}</div></div></div>)}
          </div>
        </div>
      </div>
    </>
  );
}

function PeopleTab({ people }: { people: Person[] }) {
  const { staffAction } = useStore();
  const i = useI18n();
  const { t } = i;
  const [st, setSt] = useState<"" | Status>("");
  const [region, setRegion] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const rows = useMemo(() => people.filter((p) => (!st || p.status === st) && (!region || p.region === region) && (!q || (p.name + p.district + p.phone).toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.createdAt - a.createdAt), [people, st, region, q]);
  const sel = people.find((p) => p.id === open) ?? null;

  const exportCsv = () => {
    const head = (["name", "age", "category", "region", "district", "address", "phone", "urgency", "status", "helpers", "added"] as const).map((k) => t(`csv.${k}` as const));
    const esc = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((p) => [p.name, p.age, i.category(p.category), i.region(p.region), p.district, p.address, p.phone, i.urgency(p.urgency), i.status(p.status), p.helpers, new Date(p.createdAt).toLocaleString(i.locale)].map(esc).join(","));
    const blob = new Blob(["\ufeff" + [head.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "muhtojlar.csv"; a.click();
  };

  return (
    <>
      <div className="filters glass">
        <input className="in" placeholder={t("dash.search")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="in" value={st} onChange={(e) => setSt(e.target.value as Status | "")}>
          <option value="">{t("common.allStatuses")}</option>
          {(["new", "verified", "helped", "closed"] as const).map((s) => <option key={s} value={s}>{i.status(s)}</option>)}
        </select>
        <select className="in" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">{t("common.regionTotal")}</option>
          {REGIONS.map((r) => <option key={r.name} value={r.name}>{i.region(r.name)}</option>)}
        </select>
        <button className="btn glass" onClick={exportCsv}>⬇ CSV</button>
      </div>
      <div className="table-wrap glass">
        <table className="tbl">
          <thead><tr><th>{t("th.person")}</th><th>{t("th.region")}</th><th>{t("th.category")}</th><th>{t("th.urgency")}</th><th>{t("th.status")}</th><th>🤝</th><th /></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className={p.status === "new" ? "hl" : ""}>
                <td><button className="who" onClick={() => setOpen(p.id)}><Avatar src={p.photo} name={p.name} size={42} /><span><b>{p.name}</b><small>{p.age ? `${t("common.yearsOld", { n: p.age })} · ` : ""}{i.timeAgo(p.createdAt)}</small></span></button></td>
                <td>{i.regionShort(p.region)}<small>{p.district}</small></td>
                <td>{i.category(p.category)}</td>
                <td>
                  <select className="in sm" style={{ color: URGENCY_COLOR[p.urgency] }} value={p.urgency} onChange={(e) => staffAction("setUrgency", { id: p.id, urgency: e.target.value as Urgency })}>
                    {(["high", "medium", "low"] as const).map((u) => <option key={u} value={u}>{i.urgency(u)}</option>)}
                  </select>
                </td>
                <td>
                  <select className={`in sm st-${p.status}`} value={p.status} onChange={(e) => staffAction("setStatus", { id: p.id, status: e.target.value })}>
                    {(["new", "verified", "helped", "closed"] as const).map((s) => <option key={s} value={s}>{i.status(s)}</option>)}
                  </select>
                </td>
                <td>{p.helpers}</td>
                <td className="acts">
                  {p.status === "new" && <button className="btn primary sm" onClick={() => staffAction("setStatus", { id: p.id, status: "verified" })}>{t("dash.verify")}</button>}
                  <button className="btn ghost sm danger" onClick={() => { if (confirm(t("dash.confirmDel", { name: p.name }))) staffAction("deletePerson", { id: p.id }); }}>🗑</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="empty">{t("common.nothingFound")}</td></tr>}
          </tbody>
        </table>
      </div>
      {sel && <PersonModal p={sel} onClose={() => setOpen(null)} />}
    </>
  );
}

function VolunteersTab() {
  const { volunteers, staffAction } = useStore();
  const i = useI18n();
  const { t } = i;
  return (
    <div className="table-wrap glass">
      <table className="tbl">
        <thead><tr><th>{t("th.vol")}</th><th>{t("th.region")}</th><th>{t("th.phone")}</th><th>{t("th.skills")}</th><th>{t("th.days")}</th><th /></tr></thead>
        <tbody>
          {[...volunteers].sort((a, b) => b.createdAt - a.createdAt).map((v) => (
            <tr key={v.id}>
              <td><Link href={`/volunteer/${v.id}`} className="who"><Avatar src={v.photo} name={v.name} size={42} /><span><b>{v.name}</b><small>{t("common.yearsOld", { n: v.age })} · {i.timeAgo(v.createdAt)}</small></span></Link></td>
              <td>{i.regionShort(v.region)}<small>{v.district}</small></td>
              <td><a href={`tel:${v.phone.replace(/\s/g, "")}`}>{v.phone}</a></td>
              <td>{v.skills.map((s) => L.helpIcon[s]).join(" ")}</td>
              <td>{v.days.map((d) => i.dayShort(d)).join(", ")}</td>
              <td className="acts"><button className="btn ghost sm danger" onClick={() => { if (confirm(t("dash.confirmDel", { name: v.name }))) staffAction("deleteVolunteer", { id: v.id }); }}>🗑</button></td>
            </tr>
          ))}
          {volunteers.length === 0 && <tr><td colSpan={6} className="empty">{t("dash.noVols")}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const { staff, logout, people, volunteers, helped, persistent, ready } = useStore();
  const [tab, setTab] = useState<"overview" | "people" | "vols">("overview");
  const [toast, setToast] = useState("");
  const seen = useRef<Set<string> | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!ready) return;
    const ids = new Set(people.map((p) => p.id));
    if (seen.current) {
      const fresh = people.filter((p) => !seen.current!.has(p.id));
      if (fresh.length) { setToast(t("dash.toast", { name: fresh[0].name }) + (fresh.length > 1 ? t("dash.toastMore", { n: fresh.length - 1 }) : "")); setTimeout(() => setToast(""), 5000); }
    }
    seen.current = ids;
  }, [people, ready]);

  if (!staff) return <Login />;
  const pending = people.filter((p) => p.status === "new").length;

  return (
    <section className="wrap page dash">
      <div className="dash-head">
        <div>
          <span className="eyebrow">{t("dash.eyebrow")}</span>
          <h1>{t("dash.hello", { name: staff.name.charAt(0).toUpperCase() + staff.name.slice(1) })}</h1>
        </div>
        <div className="row"><LiveBadge /><button className="btn ghost sm" onClick={logout}>{t("dash.logout")}</button></div>
      </div>
      {!persistent && ready && (
        <div className="warn">{t("dash.warn")}</div>
      )}
      <div className="tabs">
        <button className={tab === "overview" ? "on" : ""} onClick={() => setTab("overview")}>{t("dash.tabOverview")}</button>
        <button className={tab === "people" ? "on" : ""} onClick={() => setTab("people")}>{t("dash.tabPeople")} {pending > 0 && <em>{pending}</em>}</button>
        <button className={tab === "vols" ? "on" : ""} onClick={() => setTab("vols")}>{t("dash.tabVols")}</button>
      </div>
      {tab === "overview" && <Overview people={people} volunteers={volunteers} helped={helped} />}
      {tab === "people" && <PeopleTab people={people} />}
      {tab === "vols" && <VolunteersTab />}
      {toast && <div className="toast">{toast}</div>}
    </section>
  );
}
