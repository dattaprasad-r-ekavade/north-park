export type MouthShape = "closed" | "open" | "wide" | "o";

export interface CharacterLayerPaths {
  body: string;
  head: string;
  eyes?: string;
  eyebrows?: string;
  nose?: string;
  hair?: string;
  mouthClosed: string;
  mouthOpen: string;
  mouthWide?: string;
  leftArm?: string;
  rightArm?: string;
}

export interface CharacterPlacement {
  x: number;
  y: number;
  scale: number;
}

export interface DialogueLine {
  characterId: string;
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface SceneShot {
  id: string;
  background: string;
  durationInFrames: number;
  characters: Array<{
    id: string;
    layers: CharacterLayerPaths;
    placement: CharacterPlacement;
  }>;
  dialogue: DialogueLine[];
}

export interface EpisodeData {
  title: string;
  fps: number;
  durationInFrames: number;
  scenes: SceneShot[];
}

export interface TestEpisodeProps {
  episode: EpisodeData;
}
