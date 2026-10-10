"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DAYS, HELP_TYPES, L, REGIONS, type Day, type HelpType } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { PhotoInput } from "@/components/ui";

export default function VolunteerSignup() {
  const { post, setMyVolunteerId, myVolunteerId } = useStore();
  const router = useRouter();
  const i = useI18n();
  const { t } = i;
  const [f, setF] = useState({ name: "", age: "", phone: "", region: REGIONS[0].name, district: "", about: "", photo: "" });
  const [days, setDays] = useState<Day[]>([]);
  const [skills, setSkills] = useState<HelpType[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const tog = <T,>(arr: T[], v: T, fn: (a: T[]) => void) => fn(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (f.name.trim().length < 2) return setErr(t("volreg.errName"));
    if (f.phone.trim().length < 7) return setErr(t("volreg.errPhone"));
    if (!f.photo) return setErr(t("volreg.errPhoto"));
    if (skills.length === 0) return setErr(t("volreg.errSkills"));
    if (days.length === 0) return setErr(t("volreg.errDays"));
    setBusy(true);
    try {
      const r = await post("/api/volunteer", { ...f, age: Number(f.age) || 18, days, skills });
      setMyVolunteerId(r.volunteer.id);
      router.push(`/volunteer/${r.volunteer.id}`);
    } catch {
      setErr(t("form.sendFail"));
      setBusy(false);
    }
  };

  return (
    <section className="wrap page">
      <div className="page-head">
        <Link href="/" className="back">{t("form.back")}</Link>
        <h1>{t("volreg.title")}</h1>
        <p className="muted">{t("volreg.desc")}</p>
        {myVolunteerId && <p className="tiny">{t("volreg.have")}<Link className="link" href={`/volunteer/${myVolunteerId}`}>{t("volreg.open")}</Link></p>}
      </div>
      <form className="glass form" onSubmit={submit}>
        <div className="form-grid">
          <div className="col-photo">
            <label className="lbl">{t("volreg.photoLbl")}</label>
            <PhotoInput value={f.photo} onChange={(v) => set("photo", v)} label={t("volreg.photoPick")} />
          </div>
          <div className="col-fields">
            <div className="two">
              <label className="fld"><span>{t("form.fullName")}</span><input className="in" value={f.name} onChange={(e) => set("name", e.target.value)} required /></label>
              <label className="fld"><span>{t("form.ageShort")}</span><input className="in" type="number" min={14} max={100} value={f.age} onChange={(e) => set("age", e.target.value)} /></label>
            </div>
            <label className="fld"><span>{t("form.phone")}</span><input className="in" type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+998 90 123 45 67" required /></label>
            <div className="two">
              <label className="fld"><span>{t("form.region")}</span>
                <select className="in" value={f.region} onChange={(e) => set("region", e.target.value)}>{REGIONS.map((r) => <option key={r.name} value={r.name}>{i.region(r.name)}</option>)}</select>
              </label>
              <label className="fld"><span>{t("form.districtOpt")}</span><input className="in" value={f.district} onChange={(e) => set("district", e.target.value)} /></label>
            </div>
          </div>
        </div>
        <div className="fld"><span>{t("volreg.days")}</span>
          <div className="chips pick">{DAYS.map((d) => <button key={d} type="button" className={`chip btnchip ${days.includes(d) ? "on" : ""}`} onClick={() => tog(days, d, setDays)}>{i.day(d)}</button>)}</div>
        </div>
        <div className="fld"><span>{t("volreg.skills")}</span>
          <div className="chips pick">{HELP_TYPES.map((h) => <button key={h} type="button" className={`chip btnchip ${skills.includes(h) ? "on" : ""}`} onClick={() => tog(skills, h, setSkills)}>{L.helpIcon[h]} {i.help(h)}</button>)}</div>
        </div>
        <label className="fld"><span>{t("volreg.about")}</span><textarea className="in" rows={4} value={f.about} onChange={(e) => set("about", e.target.value)} placeholder={t("volreg.aboutPh")} /></label>
        {err && <div className="err big">{err}</div>}
        <button className="btn primary lg block" disabled={busy}>{busy ? t("common.creating") : t("volreg.submit")}</button>
      </form>
    </section>
  );
}
