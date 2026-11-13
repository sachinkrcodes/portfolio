"use client";

import { ACCENT, FOG_COLOR, FOG_DENSITY, SCENE } from "./constants";
import CloudSea from "./CloudSea";
import DataLines from "./DataLines";
import BuildingIsland from "./islands/BuildingIsland";
import ExperienceIsland from "./islands/ExperienceIsland";
import ProjectsIsland from "./islands/ProjectsIsland";
import ResearchIsland from "./islands/ResearchIsland";
import Particles from "./Particles";
import Sky from "./Sky";

/** Everything that lives in the 3D world: sky, lights, fog, clouds, the four islands and the lines between them. */
export default function World() {
  return (
    <>
      {/* same maths as the hand written fog in the custom shaders */}
      <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />
      <hemisphereLight args={[SCENE.hemiSky, SCENE.hemiGround, 1.7]} />
      {/* moonlight from the back left, a cyan kicker from the front right */}
      <directionalLight position={[-30, 42, -24]} intensity={2.6} color={SCENE.moon} />
      <directionalLight position={[26, 10, 30]} intensity={0.7} color={ACCENT} />
      {/* the glowing cloud sea lights the undersides of the islands */}
      <directionalLight position={[-6, -40, 12]} intensity={2.2} color={SCENE.underglow} />

      <Sky />
      <CloudSea />
      <Particles />
      <DataLines />

      <ProjectsIsland />
      <ResearchIsland />
      <ExperienceIsland />
      <BuildingIsland />
    </>
  );
}
