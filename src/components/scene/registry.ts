import type * as THREE from "three";

/** Live island groups (so DOM labels can follow the floating islands). */
export const islandGroups = new Map<string, THREE.Object3D>();

/** DOM label elements, keyed by island id or "sub:<id>". The projector writes their screen position every frame. */
export const labelEls = new Map<string, HTMLElement>();

/** The hero text block (set by the hero). The projector keeps island labels from sitting behind it. */
export const heroCopy: { el: HTMLElement | null } = { el: null };
