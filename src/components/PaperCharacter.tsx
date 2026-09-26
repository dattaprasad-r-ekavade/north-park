import { Img, staticFile, useCurrentFrame } from "remotion";
import type { CharacterLayerPaths, CharacterPlacement, DialogueLine } from "../lib/types";
import {
  getMouthShapeForFrame,
  isCharacterSpeakingAtFrame,
  mouthShapeToLayer,
} from "../lib/mouthFlap";

interface PaperCharacterProps {
  id: string;
  layers: CharacterLayerPaths;
  placement: CharacterPlacement;
  dialogue: DialogueLine[];
  sceneStartFrame: number;
  fps: number;
}

const LAYER_WIDTH = 128;

const layerImg = (src: string, extra?: React.CSSProperties): React.CSSProperties => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: LAYER_WIDTH,
  height: "auto",
  ...extra,
});

const Layer: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={staticFile(src)} style={layerImg(src, style)} />
);

export const PaperCharacter: React.FC<PaperCharacterProps> = ({
  id,
  layers,
  placement,
  dialogue,
  sceneStartFrame,
  fps,
}) => {
  const frame = useCurrentFrame();
  const speaking = isCharacterSpeakingAtFrame(id, frame, dialogue, sceneStartFrame);
  const mouthShape = getMouthShapeForFrame(frame - sceneStartFrame, speaking, fps);
  const mouthSrc = mouthShapeToLayer(mouthShape, layers);

  const bob = speaking ? Math.sin((frame - sceneStartFrame) * 0.4) * 2 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: placement.x,
        top: placement.y + bob,
        width: LAYER_WIDTH,
        height: LAYER_WIDTH * 1.6,
        transform: `scale(${placement.scale})`,
        transformOrigin: "bottom center",
        filter: "drop-shadow(2px 3px 0 rgba(0,0,0,0.35))",
      }}
    >
      {/* Kenney sprites share one anchor — stack at origin, no manual offsets */}
      <Layer src={layers.body} />
      {layers.leftArm ? <Layer src={layers.leftArm} /> : null}
      {layers.rightArm ? (
        <Layer
          src={layers.rightArm}
          style={{ transform: "scaleX(-1)", transformOrigin: "center center" }}
        />
      ) : null}
      <Layer src={layers.head} />
      {layers.eyes ? <Layer src={layers.eyes} /> : null}
      {layers.eyebrows ? <Layer src={layers.eyebrows} /> : null}
      {layers.nose ? <Layer src={layers.nose} /> : null}
      <Layer src={mouthSrc} />
      {layers.hair ? <Layer src={layers.hair} /> : null}
    </div>
  );
};
