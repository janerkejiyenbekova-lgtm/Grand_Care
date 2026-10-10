"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { HelpButton, PersonDetail } from "@/components/PersonViews";

export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const { people, ready, staff } = useStore();
  const { t } = useI18n();
  const p = people.find((x) => x.id === id);
  if (!ready) return <section className="wrap page narrow"><div className="empty">{t("common.loading")}</div></section>;
  if (!p) return <section className="wrap page narrow"><div className="glass success"><h1>{t("person.notFound")}</h1><Link href="/" className="btn primary">{t("common.home")}</Link></div></section>;
  return (
    <section className="wrap page narrow">
      <Link href="/#xarita" className="back">{t("person.backMap")}</Link>
      <div className="glass profile">
        <PersonDetail p={p} showPrivate={!!staff} />
        <div className="side-actions"><HelpButton p={p} /></div>
      </div>
    </section>
  );
}
