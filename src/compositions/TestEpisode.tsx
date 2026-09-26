import { AbsoluteFill } from "remotion";
import { CutoutScene } from "../components/CutoutScene";
import type { TestEpisodeProps } from "../lib/types";

export const TestEpisode: React.FC<TestEpisodeProps> = ({ episode }) => {
  let frameOffset = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#87CEEB" }}>
      {episode.scenes.map((shot) => {
        const from = frameOffset;
        frameOffset += shot.durationInFrames;
        return (
          <CutoutScene
            key={shot.id}
            shot={shot}
            characters={episode.characters}
            from={from}
          />
        );
      })}
    </AbsoluteFill>
  );
};
