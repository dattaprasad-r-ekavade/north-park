# North Park

South Park-style paper cutout video pipeline powered by **Remotion**, **style-locked stills**, and optional cheap **I2V** for backgrounds.

## Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Script / shots | LLM | Dialogue, timing, mouth labels |
| Stills | Style-locked image gen | Backgrounds + character poses |
| Animation | Remotion @ 12 FPS | Layered PNG cutouts + mouth flaps |
| BG motion (optional) | Cheap I2V APIs | Subtle background movement only |

## Quick start

```bash
npm install
npm run download-assets
npm run dev          # Remotion Studio preview
npm run render       # Export test-episode.mp4
```

## Project layout

```
public/assets/          Downloaded + prepared CC0 test assets
src/components/         PaperCharacter, CutoutScene
src/compositions/       TestEpisode
src/data/               Episode JSON (LLM-editable shot list)
src/lib/                Mouth flap sync logic
scripts/                Asset download + preparation
.cursor/skills/         Agent workflow skill
```

## Mouth flaps

Characters swap between `mouth-closed`, `mouth-open`, and `mouth-wide` PNG layers while their dialogue line is active. Classic cutout alternation — no I2V on faces.

Edit timing in `src/data/testEpisode.json`:

```json
{
  "characterId": "hero",
  "text": "Hello!",
  "startFrame": 12,
  "endFrame": 60
}
```

## Style-locked stills workflow

1. Create a **style reference sheet** (flat colors, thick outlines, paper texture).
2. Use a fixed prompt prefix for every generation.
3. Split outputs into layers: body, head, arms, mouth variants.
4. Drop layers into `public/assets/characters/<id>/`.

## Optional I2V (backgrounds only)

Run I2V on background plates, save to `public/assets/backgrounds/`, keep characters in Remotion layers on top. Never I2V character mouths.

## Test assets (CC0)

- [Kenney Modular Character Pack](https://opengameart.org/content/modular-character-pack)
- [Kenney Background Elements](https://kenney.nl/assets/background-elements-redux)
- [OpenGameArt 2D Puppet Character](https://opengameart.org/content/2d-puppet-character)

Mouth flap PNGs are generated flat cutouts for consistent testing.

## License

Code: MIT. Downloaded assets: CC0 (see `public/assets/ASSETS.md`).
