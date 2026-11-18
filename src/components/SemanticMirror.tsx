import {
  about,
  certifications,
  cloudWork,
  deployments,
  education,
  inProgress,
  islandOrder,
  islands,
  jobs,
  learning,
  miniProjects,
  moreSkills,
  profile,
  projectLinks,
  projects,
  research,
  sigmax,
  site,
  skillTracks,
  skillsIntro,
} from "@/data/content";
import { siteUrl } from "@/lib/site";

/**
 * A plain HTML copy of everything on the site, rendered on the server.
 * Screen readers, search engines and link previews read this; sighted visitors never see it (sr-only).
 * It is hidden in the 2D version, which already is plain HTML.
 * Its links have tabIndex -1: a keyboard user would otherwise tab through links they cannot see. Screen readers still read and open them.
 */
export default function SemanticMirror() {
  const base = siteUrl();
  const person = {
    "@type": "Person",
    "@id": `${base}/#person`,
    name: profile.name,
    jobTitle: profile.role,
    description: site.description,
    url: base,
    email: `mailto:${profile.email}`,
    sameAs: [profile.linkedin, profile.github],
    address: { "@type": "PostalAddress", addressLocality: profile.location.city, addressRegion: profile.location.region, addressCountry: "IN" },
    alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
    knowsAbout: [...profile.stack, "Spring Boot", "FastAPI", "RAG", "REST APIs", "GitHub Actions", "Cloud Computing"],
  };
  // a person and the website that is about them, as one linked graph (this is what search engines read)
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: `${profile.name} | Portfolio`,
        inLanguage: "en",
        about: { "@id": person["@id"] },
        publisher: { "@id": person["@id"] },
      },
    ],
  };

  return (
    <main id="content" className="mirror sr-only">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
      <h1>
        {profile.name}, {profile.role}
      </h1>
      <p>{profile.headline}</p>
      <p>{profile.summary}</p>
      <p>
        {profile.openTo}. Based in {profile.location.city}, {profile.location.region}, {profile.location.country}.
      </p>
      <p>
        <a tabIndex={-1} href={profile.resumeUrl}>
          Download resume (PDF)
        </a>
      </p>

      <section aria-labelledby="m-about">
        <h2 id="m-about">About: {about.title}</h2>
        <p>{about.intro}</p>
        {about.groups.map((g) => (
          <div key={g.title}>
            <h3>{g.title}</h3>
            <ul>
              {g.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
        <ul>
          {about.facts.map((f) => (
            <li key={f.label}>
              {f.value} {f.label}
            </li>
          ))}
        </ul>
        <p>Spoken languages: {about.spoken}.</p>
      </section>

      {islandOrder.map((id) => (
        <section key={id} aria-labelledby={`m-${id}`}>
          <h2 id={`m-${id}`}>{islands[id].title}</h2>
          <p>{islands[id].blurb}</p>

          {id === "projects" && <h3>Major projects</h3>}
          {id === "projects" && (
            <ul>
              {projects.map((p) => (
                <li key={p.id}>
                  <h4>{p.name}</h4>
                  <p>
                    {p.kind}. {p.status === "building" ? "In progress" : "Completed"}
                    {p.when ? `, ${p.when}` : ""}.
                  </p>
                  <p>{p.summary}</p>
                  <ul>
                    {p.stats.map((s) => (
                      <li key={s.label}>
                        {s.value} {s.label}
                      </li>
                    ))}
                  </ul>
                  {p.shots && p.shots.length > 0 && (
                    <>
                      <h5>Screenshots</h5>
                      <ul>
                        {p.shots.map((s) => (
                          <li key={s.src}>{s.caption}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <h5>Problem</h5>
                  <p>{p.problem}</p>
                  <h5>What I built</h5>
                  <ul>
                    {p.built.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <h5>Tech</h5>
                  <ul>
                    {p.tech.map((g) => (
                      <li key={g.group}>
                        {g.group}: {g.items.join(", ")}
                      </li>
                    ))}
                  </ul>
                  <h5>Highlights</h5>
                  <ul>
                    {p.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  {(p.progress || p.next) && (
                    <>
                      <h5>Where it stands</h5>
                      {p.progress && <p>Works today: {p.progress}</p>}
                      {p.next && <p>Still to do: {p.next}</p>}
                    </>
                  )}
                  <h5>Links</h5>
                  {p.liveNote && !p.liveUrl && <p>{p.liveNote}</p>}
                  <ul>
                    {projectLinks(p).map((l) => (
                      <li key={l.label}>
                        <a tabIndex={-1} href={l.href}>
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          {id === "projects" && miniProjects.length > 0 && (
            <>
              <h3>Minor projects</h3>
              <ul>
                {miniProjects.map((m) => (
                  <li key={m.id}>
                    <h4>{m.name}</h4>
                    <p>
                      {m.kind}. {m.status === "building" ? "In progress" : "Completed"}
                      {m.when ? `, ${m.when}` : ""}. {m.summary}
                    </p>
                    <ul>
                      {m.points.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                    {m.progress && <p>Works today: {m.progress}</p>}
                    {m.next && <p>Still to do: {m.next}</p>}
                    <p>Tech: {m.stack.join(", ")}.</p>
                    <ul>
                      {projectLinks(m).map((l) => (
                        <li key={l.label}>
                          <a tabIndex={-1} href={l.href}>
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          )}

          {id === "research" && (
            <div>
              <h3>{research.title}</h3>
              <p>
                {research.kind}. {research.status}. {research.role}.
              </p>
              <h4>Problem</h4>
              <p>{research.problem}</p>
              <h4>What we are doing</h4>
              <ul>
                {research.approach.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p>Cost areas in scope: {research.scope.join(", ")}.</p>
              <h4>Where it stands</h4>
              <p>{research.outcome}</p>
            </div>
          )}

          {id === "experience" && (
            <ul>
              {jobs.map((j) => (
                <li key={j.id}>
                  <h3>
                    {j.title}, {j.company}, {j.place}
                  </h3>
                  <p>
                    {j.start} to {j.end}
                  </p>
                  <p>{j.summary}</p>
                  <ul>
                    {j.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <p>Tools and skills: {j.skills.join(", ")}.</p>
                </li>
              ))}
            </ul>
          )}

          {id === "building" && (
            <>
              {inProgress.length > 0 && (
                <>
                  <h3>In progress</h3>
                  <ul>
                    {inProgress.map((p) => (
                      <li key={p.id}>
                        <h4>{p.name}</h4>
                        <p>
                          In progress{p.when ? `, ${p.when}` : ""}. Tech: {p.stack.join(", ")}.
                        </p>
                        {p.progress && <p>Works today: {p.progress}</p>}
                        {p.next && <p>Still to do: {p.next}</p>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {deployments.length > 0 && (
                <>
                  <h3>Where my apps run</h3>
                  <ul>
                    {deployments.map((d) => (
                      <li key={d.id}>
                        {d.name}: {d.runsOn}.{" "}
                        {d.liveUrl && (
                          <a tabIndex={-1} href={d.liveUrl}>
                            Live demo
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <h3>Cloud and DevOps work</h3>
              <ul>
                {cloudWork.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p>Learning now: {learning.join(", ")}.</p>
              <p>
                {sigmax.title}, {sigmax.issuer} ({sigmax.when}). Covers {sigmax.covers}.
                {sigmax.programProjects.length > 0 && ` Program projects due ${sigmax.projectsDue}: ${sigmax.programProjects.join(", ")}.`}
              </p>
            </>
          )}
        </section>
      ))}

      <section aria-labelledby="m-skills">
        <h2 id="m-skills">Skills</h2>
        <p>{skillsIntro}</p>
        {skillTracks.map((t) => (
          <div key={t.title}>
            <h3>{t.title}</h3>
            <ul>
              {t.items.map((i) => (
                <li key={i.name}>
                  {i.name}: {i.level === "used" ? "used" : "learning"}
                  {i.where ? ` (${i.where})` : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <ul>
          {moreSkills.map((g) => (
            <li key={g.group}>
              {g.group}: {g.items.join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="m-edu">
        <h2 id="m-edu">Education and certifications</h2>
        <ul>
          {education.map((e) => (
            <li key={e.school}>
              {e.degree}, {e.school}, {e.place} ({e.when})
            </li>
          ))}
        </ul>
        <ul>
          <li>
            {sigmax.title}, {sigmax.issuer} ({sigmax.when}, {sigmax.status.toLowerCase()}). Covers {sigmax.covers}.
            {sigmax.programProjects.length > 0 && ` Program projects due ${sigmax.projectsDue}: ${sigmax.programProjects.join(", ")}.`}
          </li>
          {certifications.map((c) => (
            <li key={c.name}>
              {c.name}, {c.issuer} ({c.when})
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="m-contact">
        <h2 id="m-contact">Contact</h2>
        <ul>
          <li>
            <a tabIndex={-1} href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </li>
          <li>
            <a tabIndex={-1} href={profile.linkedin}>
              LinkedIn
            </a>
          </li>
          <li>
            <a tabIndex={-1} href={profile.github}>
              GitHub
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
