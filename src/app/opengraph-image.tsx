import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/data/content";
import { BLUE, CYAN, FOG, INK, MUTE, rgba } from "@/lib/palette";
import { Islands } from "./_og/islands";

/**
 * The picture that WhatsApp, LinkedIn, Slack, X and Google show when the link is shared.
 * It is made at build time from content.ts and palette.ts, so it follows every change you make there
 * (name, role, headline, stack, "open to" line) without anyone touching an image editor.
 * The two fonts are static copies of the site fonts (SIL Open Font License) in src/app/_og.
 */
export const alt = `${profile.name}, ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (name: string) => readFile(join(process.cwd(), "src/app/_og", name));

export default async function OpengraphImage() {
  const [display, sans, logoFile] = await Promise.all([
    font("Bricolage-ExtraBold.ttf"),
    font("InstrumentSans-Medium.ttf"),
    readFile(join(process.cwd(), "public/logo.png")),
  ]);
  const logo = `data:image/png;base64,${logoFile.toString("base64")}`;

  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", background: INK, color: FOG, fontFamily: "Instrument Sans" }}>
      {/* soft light behind the islands and in the corner */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          display: "flex",
          backgroundImage: `radial-gradient(620px 520px at 80% 42%, ${rgba(BLUE, 0.5)}, ${rgba(BLUE, 0)}), radial-gradient(520px 380px at 0% 100%, ${rgba(CYAN, 0.16)}, ${rgba(CYAN, 0)})`,
        }}
      />
      <div style={{ position: "absolute", top: 60, left: 690, display: "flex" }}>
        <Islands width={520} height={520} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 760, height: 630, padding: "64px 0 60px 72px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 0, whiteSpace: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 20, letterSpacing: 2, color: MUTE, textTransform: "uppercase" }}>
            {/* the logo (public/logo.png) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={56} height={56} alt="" style={{ marginRight: 14 }} />
            Portfolio / Cloud City
          </div>
          <div style={{ display: "flex", fontSize: 22, color: CYAN }}>{profile.openTo}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Bricolage Grotesque", fontSize: 94, lineHeight: 1, letterSpacing: -3, color: FOG, whiteSpace: "nowrap" }}>{profile.name}</div>
          <div style={{ fontSize: 33, marginTop: 24, color: CYAN, whiteSpace: "nowrap" }}>{profile.role}</div>
          <div style={{ fontSize: 32, marginTop: 20, lineHeight: 1.3, color: MUTE, maxWidth: 640 }}>{profile.headline}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {/* the first four fit on one line next to the islands */}
          {profile.stack.slice(0, 4).map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                whiteSpace: "nowrap",
                fontSize: 24,
                padding: "10px 22px",
                marginRight: 14,
                borderRadius: 40,
                color: FOG,
                background: rgba(FOG, 0.08),
                border: `1.5px solid ${rgba(CYAN, 0.45)}`,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Bricolage Grotesque", data: display, weight: 800, style: "normal" },
        { name: "Instrument Sans", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}
