import { HERO_POSE, flyTo, overviewPose } from "@/components/scene/rig";
import { useStore } from "@/store/useStore";

/** "View Projects": leave the hero and fly over to the projects island. */
export function viewProjects() {
  const st = useStore.getState();
  if (!st.revealed) return;
  st.setMode("explore");
  flyTo(overviewPose("projects"), 2.6);
}

/** "About": pull back to a wide shot of the whole city and open the About panel. */
export function openAbout() {
  const st = useStore.getState();
  if (!st.revealed) return;
  if (st.mode === "focus" && st.focus?.island === "about") return;
  st.focusOn({ island: "about" });
}

/** "Contact": the whole city stays in view and the contact form opens beside it. */
export function openContact() {
  const st = useStore.getState();
  if (!st.revealed) return;
  if (st.mode === "focus" && st.focus?.island === "contact") return;
  st.focusOn({ island: "contact" });
}

/** Open one island's panel (used by the slide-out menu). */
export function openIsland(id: "projects" | "experience") {
  const st = useStore.getState();
  if (!st.revealed) return;
  if (st.mode === "focus" && st.focus?.island === id && !st.focus.sub) return;
  st.focusOn({ island: id });
}

/** Back to the opening shot. */
export function goHome() {
  const st = useStore.getState();
  if (!st.revealed || st.mode === "hero") return;
  // from an open panel too: close it and fly back to the opening shot
  useStore.setState({ focus: null, hover: null, mode: "hero" });
}

/** Switch between the 3D city and the plain 2D page. The choice is remembered. */
export function switchMode(toLite: boolean) {
  try {
    localStorage.setItem("cc-mode", toLite ? "lite" : "3d");
  } catch {
    /* storage blocked: the switch still works for this visit */
  }
  useStore.getState().setLite(toLite);
  if (!toLite) flyTo(HERO_POSE, 2.4);
}
