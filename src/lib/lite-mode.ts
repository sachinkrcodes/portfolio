import { useStore } from "@/store/useStore";

/**
 * From the 2D page to the 3D city. It lives apart from actions.ts on purpose:
 * actions.ts pulls in the camera code, and the 2D page should not download that until somebody asks for 3D.
 */
export function goTo3D() {
  try {
    localStorage.setItem("cc-mode", "3d");
  } catch {
    /* storage blocked: the switch still works for this visit */
  }
  useStore.getState().setLite(false);
  void import("@/components/scene/rig").then((m) => m.flyTo(m.HERO_POSE, 2.4));
}
