import { Composition } from "remotion";
import { TestEpisode } from "./compositions/TestEpisode";
import testEpisode from "./data/testEpisode.json";
import type { EpisodeData, TestEpisodeProps } from "./lib/types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestEpisode"
        component={TestEpisode}
        width={1280}
        height={720}
        defaultProps={{ episode: testEpisode as EpisodeData } satisfies TestEpisodeProps}
        calculateMetadata={({ props }) => ({
          fps: props.episode.fps,
          durationInFrames: props.episode.scenes.reduce(
            (total, scene) => total + scene.durationInFrames,
            0,
          ),
        })}
      />
    </>
  );
};
