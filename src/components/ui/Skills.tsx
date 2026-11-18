import { moreSkills, skillTracks, skillsIntro, type SkillItem } from "@/data/content";
import { Blocks, Section } from "./CaseStudy";

/**
 * The Skills page: Software Engineering and Cloud Engineering side by side, every row marked Used or Learning,
 * with the projects that prove it. Shared by the glass panel in the 3D city and the 2D page.
 * Everything comes from src/data/content.ts (`skillTracks`, `moreSkills`). It uses flat pieces (.tile, .chip) because it sits inside glass.
 * The panel and the 2D page draw their own heading above it.
 */

function Row({ s }: { s: SkillItem }) {
  const used = s.level === "used";
  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-[0.98rem] font-medium leading-snug text-fog">{s.name}</span>
        {s.where && <span className="meta mt-1 block leading-snug">{s.where}</span>}
      </span>
      <span className={`chip mt-0.5 shrink-0 ${used ? "chip-accent" : ""}`}>{used ? "Used" : "Learning"}</span>
    </li>
  );
}

/** `wide` puts the two columns side by side (the 2D page). The 3D panel is narrow, so it stacks them. */
export function SkillsBody({ rise = false, start = 0, wide = false }: { rise?: boolean; start?: number; wide?: boolean }) {
  return (
    <Blocks rise={rise} start={start}>
      {[
        <p key="intro" className="max-w-2xl text-[1.02rem] leading-relaxed text-fog/85">
          {skillsIntro}
        </p>,
        <div key="tracks" className={`mt-7 grid items-start gap-5 ${wide ? "md:grid-cols-2" : ""}`}>
          {skillTracks.map((t) => {
            const used = t.items.filter((i) => i.level === "used").length;
            const learning = t.items.length - used;
            return (
              <section key={t.title} className="tile !p-5">
                <h3 className="display text-[1.35rem] leading-tight">{t.title}</h3>
                <p className="meta mt-1">
                  {used} used{learning ? `, ${learning} learning` : ""}
                </p>
                <ul className="mt-3 divide-y divide-white/10">
                  {t.items.map((i) => (
                    <Row key={i.name} s={i} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>,
        <Section key="more" title="More skills" level={3}>
          <dl className={`grid gap-x-10 gap-y-5 ${wide ? "md:grid-cols-2" : ""}`}>
            {moreSkills.map((g) => (
              <div key={g.group}>
                <dt className="meta">{g.group}</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {g.items.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Section>,
      ]}
    </Blocks>
  );
}
