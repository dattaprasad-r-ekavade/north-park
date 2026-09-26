import { AbsoluteFill, Img, Sequence, staticFile, useVideoConfig } from "remotion";
import { PaperCharacter } from "./PaperCharacter";
import type { SceneShot, TestEpisodeProps } from "../lib/types";

interface CutoutSceneProps {
  shot: SceneShot;
  characters: TestEpisodeProps["episode"]["characters"];
  from: number;
}

export const CutoutScene: React.FC<CutoutSceneProps> = ({ shot, characters, from }) => {
  const { fps } = useVideoConfig();

  return (
    <Sequence from={from} durationInFrames={shot.durationInFrames}>
      <AbsoluteFill>
        <Img
          src={staticFile(shot.background)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            imageRendering: "auto",
          }}
        />
        {shot.characterIds.map((characterId) => {
          const character = characters[characterId];
          if (!character) return null;
          return (
            <PaperCharacter
              key={characterId}
              id={characterId}
              layers={character.layers}
              layout={character.layout}
              placement={shot.placements?.[characterId] ?? character.placement}
              dialogue={shot.dialogue}
              fps={fps}
            />
          );
        })}
        <SubtitleOverlay dialogue={shot.dialogue} />
      </AbsoluteFill>
    </Sequence>
  );
};

const SubtitleOverlay: React.FC<{ dialogue: SceneShot["dialogue"] }> = ({ dialogue }) => {
  return (
    <>
      {dialogue.map((line) => (
        <Sequence
          key={`${line.characterId}-${line.startFrame}`}
          from={line.startFrame}
          durationInFrames={line.endFrame - line.startFrame}
        >
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.75)",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 8,
              fontFamily: "Arial Black, Impact, sans-serif",
              fontSize: 28,
              textAlign: "center",
              maxWidth: "80%",
              border: "3px solid #fff",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {line.text}
          </div>
        </Sequence>
      ))}
    </>
  );
};
