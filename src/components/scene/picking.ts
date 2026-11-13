import * as THREE from "three";
import type { Target } from "@/store/useStore";

/** Invisible hit volumes. Islands and sub targets register themselves here. */
let list: THREE.Object3D[] = [];
export function registerPick(o: THREE.Object3D) {
  list = [...list, o];
}
export function unregisterPick(o: THREE.Object3D) {
  list = list.filter((x) => x !== o);
}

const ray = new THREE.Raycaster();

/** Sub targets (a single project) win over the island underneath them, whatever the distance. */
export function pickAt(ndc: THREE.Vector2, camera: THREE.Camera): Target | null {
  if (!list.length) return null;
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(list, false);
  if (!hits.length) return null;
  const sub = hits.find((h) => h.object.userData.sub);
  const h = sub ?? hits[0];
  return { island: h.object.userData.island, sub: h.object.userData.sub };
}
