---
name: south-park-remotion
description: Build South Park-style paper cutout videos with Remotion, style-locked stills, and optional cheap I2V for backgrounds. Use when creating cutout animation, mouth flap sync, episode JSON, layered PNG characters, or north-park video renders.
---

# South Park Remotion Pipeline

Paper-cutout animation closest to real South Park: layered PNGs, low FPS, mouth flaps in Remotion — not full-scene I2V.

## When to use

- User wants South Park / cutout / paper animation videos
- Script-to-video with LLM-generated dialogue
- Mouth flap sync, layered characters, low FPS export
- Working in the `north-park` Remotion project

## Pipeline

```
LLM script → episode JSON → style-locked stills → layered PNGs → Remotion → MP4
                                                      ↓
                                            optional I2V (backgrounds only)
```

## Commands

```bash
npm run dev              # Preview in Remotion Studio
npm run render           # Render TestEpisode to out/test-episode.mp4
npm run download-assets  # Fetch CC0 test assets
```

## Episode JSON format

Edit `src/data/testEpisode.json` or generate via LLM:

- `fps`: 12 (classic cutout feel)
- `scenes[]`: background path, duration, characters, dialogue
- `dialogue[]`: `characterId`, `text`, `startFrame`, `endFrame`

Frame numbers are **per-scene local** for dialogue; scenes are sequenced in `TestEpisode.tsx`.

## Character layers

Each character needs PNGs in `public/assets/characters/<id>/`:

| File | Purpose |
|------|---------|
| `body.png` | Torso |
| `head.png` | Head |
| `arm-left.png` / `arm-right.png` | Arms |
| `mouth-closed.png` | Rest mouth |
| `mouth-open.png` | Flap A |
| `mouth-wide.png` | Flap B |

## Mouth flap rules

- Implemented in `src/lib/mouthFlap.ts`
- Alternates open/wide/closed while dialogue line is active
- **Never** use I2V for mouths — swap PNG layers only
- Optional upgrade: phoneme labels in JSON → shape mapping

## Style-locked stills (LLM + image gen)

1. Write a fixed style prefix (flat color, thick black outline, paper cutout, no gradients).
2. Generate reference sheet once; reuse as img2img anchor.
3. Same seed/prompt for all characters in an episode.
4. Split into layers manually or with rembg.

## I2V (optional, backgrounds only)

Use Runway/Luma/Kling on `public/assets/backgrounds/*.png` for subtle motion. Composite under Remotion character layers. Keep FPS at 12 on final export.

## Adding a new episode

1. Copy `testEpisode.json` → `myEpisode.json`
2. Register new composition in `src/Root.tsx`
3. Add assets under `public/assets/`
4. `npx remotion render MyEpisode out/my-episode.mp4`

## Quality checklist

- [ ] FPS ≤ 12–15
- [ ] Characters are separate PNG layers
- [ ] Mouth flaps alternate during speech
- [ ] Backgrounds flat / simple
- [ ] No I2V on character faces
- [ ] Drop shadow on layers (`PaperCharacter.tsx`)
