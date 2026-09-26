import { Composition } from "remotion";
import { TestEpisode } from "./compositions/TestEpisode";
import testEpisode from "./data/testEpisode.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestEpisode"
        component={TestEpisode}
        durationInFrames={testEpisode.durationInFrames}
        fps={testEpisode.fps}
        width={1280}
        height={720}
        defaultProps={{
          episode: testEpisode,
        }}
      />
    </>
  );
};
