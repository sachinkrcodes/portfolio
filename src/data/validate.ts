import { PROJECT_SLOTS } from "@/components/scene/constants";
import * as content from "./content";

/**
 * A safety net for src/data/content.ts. It runs by itself when the site is built (see src/app/layout.tsx):
 *  - errors are mistakes that would break the site (two projects with the same id, a link that is not a link).
 *    They stop `npm run build`, so a broken change can never reach your live site.
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
  const { projects, miniProjects, islandOrder, about, jobs, profile, sigmax } = content;

  // ids are used in share links (/#id) and in React keys: they must be unique and must not clash with the built in places
  const reserved = new Set<string>(["about", "contact", "top", ...islandOrder]);
  const seen = new Map<string, string>();
  for (const [kind, list] of [
    ["projects", projects],
    ["miniProjects", miniProjects],
  ] as const) {
    for (const p of list) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) errors.push(`${kind}: id "${p.id}" must be lowercase words joined by dashes (it is used in the share link)`);
      if (reserved.has(p.id)) errors.push(`${kind}: id "${p.id}" is already used by the site (about, contact, top or an island)`);
      if (seen.has(p.id)) errors.push(`${kind}: id "${p.id}" is used twice (also in ${seen.get(p.id)})`);
      seen.set(p.id, kind);
    }
  }

  for (const p of projects) {
    if (!p.highlights.length) errors.push(`projects: "${p.id}" has no highlights`);
    if (!p.built.length) errors.push(`projects: "${p.id}" has nothing under "built"`);
  }
  for (const m of miniProjects) {
    if (m.points.length < 1 || m.points.length > 5) errors.push(`miniProjects: "${m.id}" should have 1 to 5 points (it has ${m.points.length})`);
  }
  if (projects.length > PROJECT_SLOTS.length) {
    warnings.push(
      `projects: there are ${projects.length} case studies and the 3D island has room for ${PROJECT_SLOTS.length} buildings. The extra ones show in the panel and on the 2D page, but have no building.`,
    );
  }
  if (about.story.length < 1) errors.push("about: the story is empty");
  if (about.story.length > 4) warnings.push(`about: ${about.story.length} paragraphs is a lot; 3 short ones read best`);
  const aboutWords = about.story.join(" ").split(/\s+/).length;
  if (aboutWords > 260) warnings.push(`about: ${aboutWords} words is long; recruiters read about 150 to 220`);
  if (sigmax.status === "Completed" && sigmax.plannedProjects.length > 0) warnings.push("sigmax: the status is Completed but plannedProjects is not empty");
  if (about.facts.length !== 4) warnings.push(`about: the page is laid out for 4 fact tiles (there are ${about.facts.length})`);
  if (!jobs.length) errors.push("jobs: there are no jobs");
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
