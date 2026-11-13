import Root from "@/components/Root";
import SemanticMirror from "@/components/SemanticMirror";
import { profile } from "@/data/content";

export default function Page() {
  return (
    <>
      {/* Real HTML for screen readers and search engines. Always rendered on the server. */}
      <SemanticMirror />
      <Root />
      <noscript>
        {/* Without JavaScript the loader would cover everything, so show the essentials instead. */}
        <style>{`.loader{display:none!important}body{overflow:auto!important}`}</style>
        <div className="nojs">
          <strong style={{ fontSize: 32 }}>{profile.name}</strong>
          <span>
            {profile.role}. {profile.openTo}.
          </span>
          <span>
            <a href={profile.resumeUrl} style={{ color: "var(--c-cyan)" }}>
              Download resume
            </a>
            {" / "}
            <a href={profile.linkedin} style={{ color: "var(--c-cyan)" }}>
              LinkedIn
            </a>
            {" / "}
            <a href={profile.github} style={{ color: "var(--c-cyan)" }}>
              GitHub
            </a>
            {" / "}
            <a href={`mailto:${profile.email}`} style={{ color: "var(--c-cyan)" }}>
              {profile.email}
            </a>
          </span>
        </div>
      </noscript>
    </>
  );
}
