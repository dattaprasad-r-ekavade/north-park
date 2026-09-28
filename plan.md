# North Park: movie review video plan

## Goal

Make short movie review videos in which two original animated hosts appear over selected footage, pause or replay a moment, and give a specific critique or joke. The movie moment supplies context; the hosts' writing, voices, and visual commentary supply the reason to watch. Start with one 60–90 second pilot, then decide what to automate based on the result.

This plan supersedes the standalone cartoon assumption in the current README. The existing two-scene, 12 fps test remains a useful character-rendering prototype.

## Current starting point

- `src/data/testEpisode.json` defines still backgrounds, characters, and dialogue frame ranges.
- `CutoutScene.tsx` renders background images and character layers, with subtitles.
- `PaperCharacter.tsx` swaps mouth PNGs; `mouthFlap.ts` uses a fixed cadence rather than speech timing.
- `Root.tsx` registers one 1280×720 composition at the episode's 12 fps.
- There is no movie video track, voice track, music/effects track, clip cue system, or publishing workflow.

## Pilot format

Use two hosts with distinct points of view (for example, story/character versus filmmaking/absurd details). Keep their names, appearance, voices, and humor original. A pilot should have:

1. **Hook (0–5 s):** a concrete claim or question about one moment.
2. **Context (5–15 s):** enough footage or a still to understand the moment.
3. **Breakdown (15–65 s):** the hosts pop in, point out one or two specific observations, disagree or build on each other, and use a purposeful pause, replay, or zoom if it helps.
4. **Payoff (last 10–20 s):** a conclusion or joke that follows from the analysis; optional concise verdict.

Do not make the pilot a plot recap or a largely uninterrupted movie scene. Draft the commentary before selecting the exact visual excerpts. Make a 16:9 primary edit and a separately framed 9:16 cut if the pilot warrants a Short.

## Ordered implementation

### Phase 1 — A playable review timeline (must have)

- [ ] Define a new episode data model with ordered segments and time in seconds (or milliseconds), rather than making the author calculate local frame numbers. Segment types should cover movie clip, still/freeze frame, and host-only background. Each segment can specify source in/out, output duration, crop/fit, source-audio level, and optional attribution notes.
- [ ] Add local video playback in Remotion and register a `ReviewEpisode` composition. Render at 30 fps for normal footage; quantize character pose/mouth changes to approximately 12 updates per second for the cutout look. Do not reduce the movie footage itself to 12 fps.
- [ ] Add voice files and dialogue cues with `characterId`, text, audio path, start time, and optional word/phoneme timing. Use the audio as the timing source; first version may use speech-activity timing with closed mouths during pauses.
- [ ] Mix host speech, excerpt audio, and optional music/effects. Duck the excerpt under host speech and expose levels per segment. Default to no film audio when it is unnecessary to the critique.
- [ ] Keep the existing `TestEpisode` composition working while the new review format is developed.

**Done when:** One locally supplied example clip/still and two voice tracks render to a 60–90 second MP4. Speech, subtitles, host visibility, and the highlighted footage agree at every transition. Use self-created or licensed sample media during development.

### Phase 2 — Hosts that interact with the footage (must have)

- [ ] Add timed host cues: enter, exit, placement, scale, speaking/listening, expression, and a small set of poses/gestures (point, surprise, neutral). Support one or two visible hosts and deliberate avoidance of the focal area of the clip.
- [ ] Add review cues for pause/freeze, resume, replay, zoom/crop, simple arrows/circles, and captions tied to the observation being made. Keep these optional so every video does not look identical.
- [ ] Generate subtitles from the voice timing; use readable line lengths and safe margins for both aspect ratios.
- [ ] Choose an original character and channel visual identity. Keep the cutout technique, but replace “South Park-style” positioning and prompts with a distinct reference sheet.

**Done when:** The pilot contains at least one intentional host entrance and one pause/replay or annotation that makes a specific point clearer. Both hosts are visually distinct, and text remains readable on phone screens.

### Phase 3 — Reliable authoring (must have before regular publishing)

- [ ] Validate episode data before rendering: unknown character IDs, missing media, negative/out-of-range source times, overlapping speech, cue spans outside the episode, and unsupported aspect ratios.
- [ ] Add a script or CLI that takes an episode JSON file and outputs a preview frame/contact sheet plus final MP4, with clear errors. Avoid hand-editing `Root.tsx` for each episode.
- [ ] Make asset preparation deterministic; repeated runs should not composite the town background onto itself. Provide a cross-platform setup path alongside or instead of the current PowerShell-only download command.
- [ ] Keep a per-episode record of source files, usage permissions, voice/music licenses, and final export versions. Review copyright/Content ID results after an unlisted upload before publishing.

**Done when:** A second episode can be created by adding media and an episode file, with no source-code changes to register it. Invalid data fails early with actionable messages.

### Phase 4 — Learn from published pilots (later)

- [ ] Make three pilots with different movie moments or review angles, not three copies of the same joke structure.
- [ ] Compare first 5-second retention, average view duration, drop-off around clip-to-host transitions, and comments mentioning the hosts or the insight. Use these signals to refine writing and pacing.
- [ ] Only then consider automated rough cuts, AI-assisted script drafts, improved phoneme lip sync, more poses, batch rendering, and optional background I2V. Keep human review of the final critique.

## Suggested episode data shape (illustrative, not a committed schema)

```json
{
  "title": "Why this reveal works",
  "format": "landscape",
  "segments": [
    {
      "type": "clip",
      "source": "assets/reviews/example/scene.mp4",
      "sourceInSec": 12.4,
      "sourceOutSec": 18.2,
      "sourceAudioGain": 0.3
    },
    {
      "type": "freeze",
      "source": "assets/reviews/example/scene.mp4",
      "sourceAtSec": 18.2,
      "durationSec": 4.5,
      "annotations": [{ "type": "circle", "x": 0.68, "y": 0.42 }]
    }
  ],
  "dialogue": [
    {
      "characterId": "hero",
      "text": "Watch where the camera puts our attention.",
      "audio": "assets/reviews/example/hero-01.wav",
      "startSec": 5.8
    }
  ],
  "hostCues": [
    { "characterId": "hero", "startSec": 5.5, "endSec": 12, "placement": "lower-left", "pose": "point" }
  ]
}
```

Actual schema should express output duration and source timing unambiguously, and validation should be implemented before relying on generated JSON.

## Footage and publishing guardrails

Use only the footage needed to support a specific observation; favor commentary, pauses, visual annotations, and original host segments over extended playback. There is no guaranteed safe clip duration. YouTube lists clips used for critical review as a possible example of monetizable reused content, but that policy is separate from copyright and Content ID claims. A claim or restriction can still occur. Track source and permissions for each excerpt, check applicable rights for the intended audience/territory, and be prepared to replace disputed footage or publish a host-led version without it.

Reference: [YouTube channel monetization policies](https://support.google.com/youtube/answer/1311392) and [Fair use on YouTube](https://support.google.com/youtube/answer/9783148). These are platform guidance, not a guarantee about any particular excerpt.

## Next action

Write the 60–90 second pilot script and record the two voices. Pick one specific scene whose visual details the hosts can analyze. Then implement Phase 1 against that pilot; avoid building a general-purpose generator before the first review actually works.
