import type { MouthShape } from "./types";

/** Alternate mouth shapes on a fixed cadence — classic cutout flap look. */
export const getMouthShapeForFrame = (
  frame: number,
  isSpeaking: boolean,
  fps: number,
): MouthShape => {
  if (!isSpeaking) {
    return "closed";
  }

  // ~8 flaps per second at 12fps = swap every 1-2 frames
  const flapRate = Math.max(2, Math.round(fps / 6));
  const flapIndex = Math.floor(frame / flapRate);

  if (flapIndex % 3 === 0) {
    return "open";
  }
  if (flapIndex % 3 === 1) {
    return "wide";
  }
  return "closed";
};

export const isCharacterSpeakingAtFrame = (
  characterId: string,
  frame: number,
  dialogue: Array<{ characterId: string; startFrame: number; endFrame: number }>,
  sceneStartFrame: number,
): boolean => {
  const localFrame = frame - sceneStartFrame;
  return dialogue.some(
    (line) =>
      line.characterId === characterId &&
      localFrame >= line.startFrame &&
      localFrame < line.endFrame,
  );
};

export const mouthShapeToLayer = (
  shape: MouthShape,
  layers: { mouthClosed: string; mouthOpen: string; mouthWide?: string },
): string => {
  switch (shape) {
    case "wide":
      return layers.mouthWide ?? layers.mouthOpen;
    case "open":
      return layers.mouthOpen;
    case "o":
      return layers.mouthWide ?? layers.mouthOpen;
    case "closed":
    default:
      return layers.mouthClosed;
  }
};
