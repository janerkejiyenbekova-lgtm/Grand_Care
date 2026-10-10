"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { CATEGORIES, HELP_TYPES, L, REGIONS, type Category, type HelpType, type Urgency } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { PhotoInput } from "@/components/ui";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false, loading: () => <div className="pick-map" /> });

export default function ReportPage() {
  const { post } = useStore();
  const i = useI18n();
  const { t } = i;
  const [f, setF] = useState({
    name: "", age: "", category: "elderly" as Category, region: REGIONS[0].name, district: "", address: "",
    phone: "", story: "", urgency: "medium" as Urgency, reporter: "", photo: "",
  });
  const [help, setHelp] = useState<HelpType[]>([]);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const gps = () => {
    if (!navigator.geolocation) return setErr(t("report.errGeoUnsupported"));
    navigator.geolocation.getCurrentPosition(
      (p) => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setErr(t("report.errGeo")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (f.name.trim().length < 2) return setErr(t("report.errName"));
    if (f.story.trim().length < 5) return setErr(t("report.errStory"));
    if (!f.photo) return setErr(t("report.errPhoto"));
    if (help.length === 0) return setErr(t("report.errHelp"));
    setBusy(true);
    try {
      await post("/api/person", { action: "create", ...f, age: Number(f.age) || 0, help, lat: loc?.lat, lng: loc?.lng });
      setDone(true);
    } catch (e: any) {
      setErr(e?.message === "missing_fields" ? t("report.errMissing") : t("form.sendFail"));
    }
    setBusy(false);
  };

  if (done)
    return (
      <section className="wrap page narrow">
        <div className="glass success">
          <div className="big">💙</div>
          <h1>{t("report.thanks")}</h1>
          <p className="muted">{t("report.thanksDesc")}</p>
          <div className="row center">
            <Link href="/#xarita" className="btn primary">{t("report.seeOnMap")}</Link>
            <button className="btn ghost" onClick={() => { setDone(false); setF({ ...f, name: "", age: "", story: "", photo: "", address: "", phone: "" }); setHelp([]); setLoc(null); }}>{t("report.again")}</button>
          </div>
        </div>
      </section>
    );

  return (
    <section className="wrap page">
      <div className="page-head">
        <Link href="/" className="back">{t("form.back")}</Link>
        <h1>{t("report.title")}</h1>
        <p className="muted">{t("report.desc")}</p>
      </div>
      <form className="glass form" onSubmit={submit}>
        <div className="form-grid">
          <div className="col-photo">
            <label className="lbl">{t("report.photoLbl")}</label>
            <PhotoInput value={f.photo} onChange={(v) => set("photo", v)} label={t("report.photoPick")} />
          </div>
          <div className="col-fields">
            <div className="two">
              <label className="fld"><span>{t("form.fullName")}</span><input className="in" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder={t("report.namePh")} required /></label>
              <label className="fld"><span>{t("form.age")}</span><input className="in" type="number" min={0} max={120} value={f.age} onChange={(e) => set("age", e.target.value)} placeholder="78" /></label>
            </div>
            <label className="fld"><span>{t("report.category")}</span>
              <select className="in" value={f.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{i.category(c)}</option>)}
              </select>
            </label>
            <div className="two">
              <label className="fld"><span>{t("form.region")}</span>
                <select className="in" value={f.region} onChange={(e) => { set("region", e.target.value); }}>
                  {REGIONS.map((r) => <option key={r.name} value={r.name}>{i.region(r.name)}</option>)}
                </select>
              </label>
              <label className="fld"><span>{t("form.district")}</span><input className="in" value={f.district} onChange={(e) => set("district", e.target.value)} placeholder={t("report.districtPh")} required /></label>
            </div>
            <label className="fld"><span>{t("report.address")}</span><input className="in" value={f.address} onChange={(e) => set("address", e.target.value)} placeholder={t("report.addressPh")} required /></label>
            <label className="fld"><span>{t("report.phone")}</span><input className="in" type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+998 90 123 45 67" /></label>
          </div>
        </div>

        <div className="fld">
          <span>{t("report.location")}</span>
          <div className="row">
            <button type="button" className="btn glass sm" onClick={gps}>{t("report.myLoc")}</button>
            <span className="muted tiny">{loc ? t("report.marked", { lat: loc.lat.toFixed(4), lng: loc.lng.toFixed(4) }) : t("report.markHint")}</span>
          </div>
          <LocationPicker region={f.region} value={loc} onChange={setLoc} />
        </div>

        <div className="fld">
          <span>{t("report.needs")}</span>
          <div className="chips pick">
            {HELP_TYPES.map((h) => (
              <button key={h} type="button" className={`chip btnchip ${help.includes(h) ? "on" : ""}`} onClick={() => setHelp((s) => (s.includes(h) ? s.filter((x) => x !== h) : [...s, h]))}>
                {L.helpIcon[h]} {i.help(h)}
              </button>
            ))}
          </div>
        </div>

        <div className="fld">
          <span>{t("report.urgency")}</span>
          <div className="seg wide">
            {(["low", "medium", "high"] as const).map((u) => (
              <button key={u} type="button" className={f.urgency === u ? "on" : ""} onClick={() => set("urgency", u)}>{i.urgency(u)}</button>
            ))}
          </div>
        </div>

        <label className="fld"><span>{t("report.story")}</span><textarea className="in" rows={4} value={f.story} onChange={(e) => set("story", e.target.value)} placeholder={t("report.storyPh")} required /></label>
        <label className="fld"><span>{t("report.reporter")}</span><input className="in" value={f.reporter} onChange={(e) => set("reporter", e.target.value)} placeholder={t("report.reporterPh")} /></label>

        {err && <div className="err big">{err}</div>}
        <button className="btn primary lg block" disabled={busy}>{busy ? t("common.sending") : t("report.submit")}</button>
      </form>
    </section>
  );
}
