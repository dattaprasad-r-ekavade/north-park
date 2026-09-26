export type MouthShape = "closed" | "open" | "wide" | "o";

export type CharacterLayers = {
  shoes: string;
  legs: string;
  pants: string;
  neck: string;
  shirt: string;
  arms: string;
  hands: string;
  head: string;
  eyes: string;
  eyebrows: string;
  nose: string;
  hair?: string;
  mouthClosed: string;
  mouthOpen: string;
  mouthWide?: string;
};

/** Layer keys that can be placed directly; "mouth" is resolved per frame from the mouth shape. */
export type PartLayerKey = Exclude<keyof CharacterLayers, "mouthClosed" | "mouthOpen" | "mouthWide"> | "mouth";

export type PartLayout = {
  layer: PartLayerKey;
  x: number;
  y: number;
  width: number;
  height: number;
  flipX?: boolean;
};

export type MouthLayout = Omit<PartLayout, "layer" | "flipX">;

export type CharacterLayout = {
  canvas: { width: number; height: number };
  /** Back-to-front draw order. */
  parts: PartLayout[];
  mouths: { closed: MouthLayout; open: MouthLayout; wide: MouthLayout };
};

/** `x` is the horizontal center and `y` the feet baseline, in composition pixels. */
export type CharacterPlacement = {
  x: number;
  y: number;
  scale: number;
};

export type CharacterDefinition = {
  id: string;
  layers: CharacterLayers;
  layout: CharacterLayout;
  placement: CharacterPlacement;
};

export type DialogueLine = {
  characterId: string;
  text: string;
  startFrame: number;
  endFrame: number;
};

export type SceneShot = {
  id: string;
  background: string;
  durationInFrames: number;
  characterIds: string[];
  /** Per-scene override of a character's default placement. */
  placements?: Record<string, CharacterPlacement>;
  dialogue: DialogueLine[];
};

export type EpisodeData = {
  title: string;
  fps: number;
  characters: Record<string, CharacterDefinition>;
  scenes: SceneShot[];
};

export type TestEpisodeProps = {
  episode: EpisodeData;
};
