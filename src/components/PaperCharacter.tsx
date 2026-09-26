import { Img, staticFile, useCurrentFrame } from "remotion";
import type {
  CharacterLayers,
  CharacterLayout,
  CharacterPlacement,
  DialogueLine,
  MouthLayout,
  MouthShape,
} from "../lib/types";
import {
  getMouthShapeForFrame,
  isCharacterSpeakingAtFrame,
  mouthShapeToLayer,
} from "../lib/mouthFlap";

interface PaperCharacterProps {
  id: string;
  layers: CharacterLayers;
  layout: CharacterLayout;
  placement: CharacterPlacement;
  dialogue: DialogueLine[];
  fps: number;
}

const mouthLayoutFor = (shape: MouthShape, layout: CharacterLayout): MouthLayout => {
  switch (shape) {
    case "open":
      return layout.mouths.open;
    case "wide":
    case "o":
      return layout.mouths.wide;
    case "closed":
    default:
      return layout.mouths.closed;
  }
};

export const PaperCharacter: React.FC<PaperCharacterProps> = ({
  id,
  layers,
  layout,
  placement,
  dialogue,
  fps,
}) => {
  const frame = useCurrentFrame();
  const speaking = isCharacterSpeakingAtFrame(id, frame, dialogue);
  const mouthShape = getMouthShapeForFrame(frame, speaking, fps);
  const mouthSrc = mouthShapeToLayer(mouthShape, layers);
  const mouthBox = mouthLayoutFor(mouthShape, layout);
  const bob = speaking ? Math.sin(frame * 0.4) * 2 : 0;
  const { width, height } = layout.canvas;

  return (
    <div
      style={{
        position: "absolute",
        left: placement.x - width / 2,
        top: placement.y - height + bob,
        width,
        height,
        transform: `scale(${placement.scale})`,
        transformOrigin: "bottom center",
        filter: "drop-shadow(2px 3px 0 rgba(0,0,0,0.35))",
      }}
    >
      {layout.parts.map((part, index) => {
        const src = part.layer === "mouth" ? mouthSrc : layers[part.layer];
        if (!src) return null;
        const box = part.layer === "mouth" ? mouthBox : part;

        return (
          <Img
            key={`${part.layer}-${index}`}
            src={staticFile(src)}
            style={{
              position: "absolute",
              left: box.x,
              top: box.y,
              width: box.width,
              height: box.height,
              transform: part.flipX ? "scaleX(-1)" : undefined,
            }}
          />
        );
      })}
    </div>
  );
};
