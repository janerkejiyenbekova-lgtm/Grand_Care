"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DAYS, L } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Avatar, Chip } from "@/components/ui";

export default function VolunteerProfile() {
  const { id } = useParams<{ id: string }>();
  const { volunteers, people, ready, myVolunteerId, staff } = useStore();
  const i = useI18n();
  const { t } = i;
  const v = volunteers.find((x) => x.id === id);

  if (!ready) return <section className="wrap page narrow"><div className="empty">{t("common.loading")}</div></section>;
  if (!v) return <section className="wrap page narrow"><div className="glass success"><h1>{t("vol.notFound")}</h1><Link href="/volunteer" className="btn primary">{t("hero.becomeVol")}</Link></div></section>;

  const mine = myVolunteerId === v.id;
  const showPhone = mine || !!staff;
  const near = people.filter((p) => p.region === v.region && p.status !== "closed").sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);

  return (
    <section className="wrap page narrow">
      <Link href="/#volontyorlar" className="back">{t("vol.backAll")}</Link>
      <div className="glass profile">
        <div className="profile-head">
          <Avatar src={v.photo} name={v.name} size={128} ring="#38bdf8" />
          <div>
            <span className="eyebrow">{mine ? t("vol.mine") : t("vol.one")}</span>
            <h1>{v.name}</h1>
            <p className="muted">{v.age ? `${t("common.yearsOld", { n: v.age })} · ` : ""}{i.region(v.region)}{v.district ? `, ${v.district}` : ""}</p>
            <p className="tiny muted">{t("vol.joined", { when: i.timeAgo(v.createdAt) })}</p>
          </div>
        </div>
        {v.about && <p className="pd-story">{v.about}</p>}
        <h4>{t("vol.skills")}</h4>
        <div className="chips">{v.skills.map((s) => <Chip key={s}>{L.helpIcon[s]} {i.help(s)}</Chip>)}</div>
        <h4>{t("vol.week")}</h4>
        <div className="week">
          {DAYS.map((d) => <span key={d} className={v.days.includes(d) ? "on" : ""} title={i.day(d)}>{i.dayShort(d)}</span>)}
        </div>
        {showPhone && <p><b>{t("vol.phone")}</b> <a href={`tel:${v.phone.replace(/\s/g, "")}`}>{v.phone}</a></p>}
        {!showPhone && <p className="tiny muted">{t("vol.phoneHidden")}</p>}

        {near.length > 0 && (
          <>
            <h4>{t("vol.near")}</h4>
            <div className="mini-list">
              {near.map((p) => (
                <Link key={p.id} href={`/person/${p.id}`} className="mini">
                  <Avatar src={p.photo} name={p.name} size={44} />
                  <div><b>{p.name}</b><div className="tiny muted">{p.district} · {i.urgency(p.urgency)}</div></div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
