import { existsSync } from "node:fs";
import { join } from "node:path";
import { PROJECT_SLOTS } from "@/components/scene/constants";
import * as content from "./content";

/**
 * A safety net for src/data/content.ts. It runs by itself when the site is built (see src/app/layout.tsx):
 *  - errors are mistakes that would break the site (two projects with the same id, a link that is not a link,
 *    a screenshot file that does not exist). They stop `npm run build`, so a broken change can never reach your live site.
 *  - warnings are style slips (a long dash, a leftover TODO). They are printed in the build log.
 * Nothing here needs to be edited when you add a project or a job.
 */

const URL_FIELDS = ["repo", "liveUrl", "href", "linkedin", "github"];
// en dash and em dash, written as character codes so this file itself stays free of them
const LONG_DASH = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);

function* strings(value: unknown, path: string): Generator<[string, string]> {
  if (typeof value === "string") yield [path, value];
  else if (Array.isArray(value)) for (let i = 0; i < value.length; i++) yield* strings(value[i], `${path}[${i}]`);
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) yield* strings(v, `${path}.${k}`);
}

export function validateContent(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { projects, miniProjects, islandOrder, about, jobs, profile, sigmax, skillTracks } = content;

  // ids are used in share links (/#id) and in React keys: they must be unique and must not clash with the built in places
  const reserved = new Set<string>(["about", "skills", "contact", "top", ...islandOrder]);
  const seen = new Map<string, string>();
  for (const [kind, list] of [
    ["projects", projects],
    ["miniProjects", miniProjects],
  ] as const) {
    for (const p of list) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) errors.push(`${kind}: id "${p.id}" must be lowercase words joined by dashes (it is used in the share link)`);
      if (reserved.has(p.id)) errors.push(`${kind}: id "${p.id}" is already used by the site (about, skills, contact, top or an island)`);
      if (seen.has(p.id)) errors.push(`${kind}: id "${p.id}" is used twice (also in ${seen.get(p.id)})`);
      seen.set(p.id, kind);
      if (p.status === "building" && !p.next) warnings.push(`${kind}: "${p.id}" is in progress but has no "next" line (it shows under "In progress" in the Cloud Lab)`);
      if (p.status === "building" && !p.progress) warnings.push(`${kind}: "${p.id}" is in progress but has no "progress" line (it shows under "In progress" in the Cloud Lab)`);
      if (p.status === "building" && !p.when) warnings.push(`${kind}: "${p.id}" is in progress but has no "when" (for example "Started Nov 2026")`);
    }
  }

  for (const p of projects) {
    if (!p.highlights.length) errors.push(`projects: "${p.id}" has no highlights`);
    if (!p.built.length) errors.push(`projects: "${p.id}" has nothing under "built"`);
    for (const s of p.shots ?? []) {
      if (!s.src.startsWith("/")) errors.push(`projects: "${p.id}" screenshot "${s.src}" must start with / (a file under public/)`);
      else if (!existsSync(join(process.cwd(), "public", s.src))) errors.push(`projects: "${p.id}" screenshot file public${s.src} does not exist`);
      if (!s.caption.trim()) errors.push(`projects: "${p.id}" screenshot "${s.src}" has no caption`);
    }
  }
  for (const m of miniProjects) {
    if (m.points.length < 1 || m.points.length > 5) errors.push(`miniProjects: "${m.id}" should have 1 to 5 points (it has ${m.points.length})`);
  }
  if (projects.length > PROJECT_SLOTS.length) {
    warnings.push(
      `projects: there are ${projects.length} case studies and the 3D island has room for ${PROJECT_SLOTS.length} buildings. The extra ones show in the panel and on the 2D page, but have no building.`,
    );
  }
  if (!about.intro.trim()) errors.push("about: the intro is empty");
  if (!about.groups.length) errors.push("about: there are no groups of bullet points");
  for (const g of about.groups) if (!g.items.length) errors.push(`about: the group "${g.title}" has no bullet points`);
  const aboutWords = [about.intro, ...about.groups.flatMap((g) => g.items)].join(" ").split(/\s+/).length;
  if (aboutWords > 520) warnings.push(`about: ${aboutWords} words is long; recruiters read about 300 to 450 words of bullet points`);
  if (sigmax.status === "Completed" && sigmax.programProjects.length > 0) warnings.push("sigmax: the status is Completed but programProjects is not empty");
  if (about.facts.length !== 4) warnings.push(`about: the page is laid out for 4 fact tiles (there are ${about.facts.length})`);
  if (!jobs.length) errors.push("jobs: there are no jobs");

  // skills: two columns, every row says Used or Learning, and a name appears once
  const rowNames = new Set<string>();
  for (const t of skillTracks) {
    if (!t.items.length) errors.push(`skillTracks: "${t.title}" has no rows`);
    for (const i of t.items) {
      if (i.level !== "used" && i.level !== "learning") errors.push(`skillTracks: "${i.name}" must be "used" or "learning"`);
      if (!i.name.trim()) errors.push(`skillTracks: a row in "${t.title}" has no name`);
      if (rowNames.has(i.name)) errors.push(`skillTracks: "${i.name}" is listed twice`);
      rowNames.add(i.name);
    }
  }
  if (skillTracks.length !== 2) warnings.push(`skillTracks: the Skills page is laid out for 2 columns (there are ${skillTracks.length})`);
  // a finished project must not keep "still to do" lines, and "runsOn" needs a live link to be worth showing
  for (const p of [...projects, ...miniProjects]) {
    if (p.status === "done" && (p.progress || p.next)) warnings.push(`"${p.id}" is completed but still has a "progress" or "next" line (delete them)`);
    if (p.runsOn && !p.liveUrl && !/portfolio/.test(p.id)) warnings.push(`"${p.id}" has "runsOn" but no "liveUrl", so Where my apps run shows no link for it`);
  }
  if (!/^\S+@\S+\.\S+$/.test(profile.email)) errors.push(`profile.email "${profile.email}" does not look like an email address`);

  // every link must be a real https link (GitHub links must be GitHub)
  for (const [path, value] of strings({ projects, miniProjects, profile, jobs, sigmax }, "content")) {
    const field =
      path
        .split(".")
        .pop()
        ?.replace(/\[\d+\]$/, "") ?? "";
    if (URL_FIELDS.includes(field) && !/^https:\/\/\S+$/.test(value)) errors.push(`${path}: "${value}" must start with https://`);
    if (field === "repo" && !/^https:\/\/github\.com\/[^/\s]+\/[^/\s]+$/.test(value)) errors.push(`${path}: "${value}" should look like https://github.com/name/repo`);
  }

  // style: no long dashes, no leftovers
  for (const [path, value] of strings(content, "content")) {
    if (LONG_DASH.test(value)) warnings.push(`${path}: contains a long dash (use a comma, a colon or a full stop)`);
    if (/\b(TODO|FIXME|lorem ipsum)\b/i.test(value)) warnings.push(`${path}: contains a leftover placeholder`);
  }

  return { errors, warnings };
}
