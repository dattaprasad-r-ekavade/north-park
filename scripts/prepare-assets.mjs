import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const downloads = path.join(root, "downloads");
const publicDir = path.join(root, "public");
const pngRoot = path.join(downloads, "extracted-characters", "PNG");

/**
 * Back-to-front placement of Kenney modular parts on a shared canvas, matching the pack's
 * instruction.png. Parts use `x` (left edge) or `cx` (horizontal center); single-sided
 * sprites (arms, hands, legs, shoes, brows) are mirrored with `flipX` for the other side.
 */
const KENNEY_LAYOUT = {
  canvas: { width: 340, height: 580 },
  mouthCenter: { cx: 170, cy: 154 },
  parts: [
    { layer: "legs", x: 62, y: 380, flipX: true },
    { layer: "legs", x: 167, y: 380 },
    { layer: "shoes", x: 44, y: 532 },
    { layer: "shoes", x: 202, y: 532, flipX: true },
    { layer: "arms", x: 6, y: 200 },
    { layer: "arms", x: 216, y: 200, flipX: true },
    { layer: "hands", x: 0, y: 268 },
    { layer: "hands", x: 279, y: 268, flipX: true },
    { layer: "neck", cx: 170, y: 175 },
    { layer: "shirt", cx: 170, y: 195 },
    { layer: "pants", cx: 170, y: 350 },
    { layer: "head", cx: 170, y: 20 },
    { layer: "eyes", cx: 145, y: 105 },
    { layer: "eyes", cx: 195, y: 105 },
    { layer: "eyebrows", cx: 143, y: 88 },
    { layer: "eyebrows", cx: 197, y: 88, flipX: true },
    { layer: "nose", cx: 170, y: 122 },
    { layer: "mouth" },
    { layer: "hair", cx: 170, y: 5 },
  ],
};

const LAYER_FILES = {
  shoes: "shoes.png",
  legs: "legs.png",
  pants: "pants.png",
  neck: "neck.png",
  shirt: "shirt.png",
  arms: "arms.png",
  hands: "hands.png",
  head: "head.png",
  eyes: "eyes.png",
  eyebrows: "eyebrows.png",
  nose: "nose.png",
  hair: "hair.png",
  mouthClosed: "mouth-closed.png",
  mouthOpen: "mouth-open.png",
  mouthWide: "mouth-wide.png",
};

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const copyFile = (src, dest) => {
  if (!src || !fs.existsSync(src)) {
    throw new Error(`Missing asset: ${src}`);
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
};

const extractZip = (zipPath, outDir) => {
  ensureDir(outDir);
  if (process.platform === "win32") {
    try {
      execSync(`tar -xf "${zipPath}" -C "${outDir}"`, { stdio: "inherit" });
    } catch {
      execSync(
        `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${outDir.replace(/'/g, "''")}' -Force"`,
        { stdio: "inherit" },
      );
    }
  } else {
    execSync(`unzip -o "${zipPath}" -d "${outDir}"`, { stdio: "inherit" });
  }
};

const resolve = (...parts) => path.join(pngRoot, ...parts);

const CHARACTER_PRESETS = {
  hero: {
    shoes: resolve("Shoes", "Blue", "blueShoe1.png"),
    legs: resolve("Pants", "Blue 1", "pantsBlue1_long.png"),
    pants: resolve("Pants", "Blue 1", "pantsBlue11.png"),
    neck: resolve("Skin", "Tint 1", "tint1_neck.png"),
    shirt: resolve("Shirts", "Blue", "blueShirt1.png"),
    arms: resolve("Shirts", "Blue", "blueArm_short.png"),
    hands: resolve("Skin", "Tint 1", "tint1_hand.png"),
    head: resolve("Skin", "Tint 1", "tint1_head.png"),
    eyes: resolve("Face", "Eyes", "eyeBrown_large.png"),
    eyebrows: resolve("Face", "Eyebrows", "brown1Brow2.png"),
    nose: resolve("Face", "Nose", "Tint 1", "tint1Nose1.png"),
    hair: resolve("Hair", "Black", "blackMan1.png"),
    mouthClosed: resolve("Face", "Mouth", "mouth_straight.png"),
    mouthOpen: resolve("Face", "Mouth", "mouth_oh.png"),
    mouthWide: resolve("Face", "Mouth", "mouth_glad.png"),
  },
  friend: {
    shoes: resolve("Shoes", "Brown 1", "brownShoe1.png"),
    legs: resolve("Pants", "Red", "pantsRed_long.png"),
    pants: resolve("Pants", "Red", "pantsRed1.png"),
    neck: resolve("Skin", "Tint 2", "tint2_neck.png"),
    shirt: resolve("Shirts", "Red", "redShirt1.png"),
    arms: resolve("Shirts", "Red", "redArm_short.png"),
    hands: resolve("Skin", "Tint 2", "tint2_hand.png"),
    head: resolve("Skin", "Tint 2", "tint2_head.png"),
    eyes: resolve("Face", "Eyes", "eyeBlue_large.png"),
    eyebrows: resolve("Face", "Eyebrows", "blackBrow2.png"),
    nose: resolve("Face", "Nose", "Tint 2", "tint2Nose1.png"),
    hair: resolve("Hair", "Blonde", "blondeWoman1.png"),
    mouthClosed: resolve("Face", "Mouth", "mouth_straight.png"),
    mouthOpen: resolve("Face", "Mouth", "mouth_oh.png"),
    mouthWide: resolve("Face", "Mouth", "mouth_happy.png"),
  },
};

const buildCharacter = async (charId, preset) => {
  const charDir = path.join(publicDir, "assets/characters", charId);
  fs.rmSync(charDir, { recursive: true, force: true });
  ensureDir(charDir);
  const sharp = (await import("sharp")).default;

  const sizes = {};
  const layers = {};
  for (const [layer, src] of Object.entries(preset)) {
    copyFile(src, path.join(charDir, LAYER_FILES[layer]));
    const { width, height } = await sharp(src).metadata();
    sizes[layer] = { width, height };
    layers[layer] = `assets/characters/${charId}/${LAYER_FILES[layer]}`;
  }

  const parts = KENNEY_LAYOUT.parts.map((anchor) => {
    if (anchor.layer === "mouth") {
      return { layer: "mouth", ...mouthBox(sizes.mouthClosed) };
    }
    const { width, height } = sizes[anchor.layer];
    const x = anchor.cx !== undefined ? Math.round(anchor.cx - width / 2) : anchor.x;
    return {
      layer: anchor.layer,
      x,
      y: anchor.y,
      width,
      height,
      ...(anchor.flipX ? { flipX: true } : {}),
    };
  });

  const layout = {
    canvas: KENNEY_LAYOUT.canvas,
    parts,
    mouths: {
      closed: mouthBox(sizes.mouthClosed),
      open: mouthBox(sizes.mouthOpen),
      wide: mouthBox(sizes.mouthWide),
    },
  };

  fs.writeFileSync(path.join(charDir, "layout.json"), `${JSON.stringify(layout, null, 2)}\n`);
  return { layers, layout };
};

const mouthBox = ({ width, height }) => ({
  x: Math.round(KENNEY_LAYOUT.mouthCenter.cx - width / 2),
  y: Math.round(KENNEY_LAYOUT.mouthCenter.cy - height / 2),
  width,
  height,
});

const main = async () => {
  ensureDir(publicDir);

  const charZip = path.join(downloads, "Kenney_characterPack_1.zip");
  const charExtract = path.join(downloads, "extracted-characters");

  if (fs.existsSync(charZip)) {
    extractZip(charZip, charExtract);
  }

  if (!fs.existsSync(pngRoot)) {
    throw new Error("Kenney PNG folder missing. Run npm run download-assets first.");
  }

  const built = {};
  for (const [charId, preset] of Object.entries(CHARACTER_PRESETS)) {
    built[charId] = await buildCharacter(charId, preset);
  }

  const bgDir = path.join(publicDir, "assets/backgrounds");
  ensureDir(bgDir);
  const sharp = (await import("sharp")).default;

  const townPath = path.join(bgDir, "town-sky.png");
  if (!fs.existsSync(townPath)) {
    await sharp({
      create: { width: 1280, height: 720, channels: 3, background: { r: 135, g: 206, b: 235 } },
    })
      .png()
      .toFile(townPath);
  }

  const townTemp = path.join(bgDir, "town-sky-composite.png");
  const townOverlay = `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="520" width="1280" height="200" fill="#4caf50"/>
    <rect x="0" y="515" width="1280" height="12" fill="#2e7d32"/>
    <rect x="80" y="380" width="160" height="140" fill="#8d6e63" stroke="#3e2723" stroke-width="4"/>
    <polygon points="80,380 160,300 240,380" fill="#c62828" stroke="#3e2723" stroke-width="4"/>
    <rect x="980" y="400" width="140" height="120" fill="#78909c" stroke="#263238" stroke-width="4"/>
  </svg>`;
  await sharp(townPath)
    .composite([{ input: Buffer.from(townOverlay), top: 0, left: 0 }])
    .png()
    .toFile(townTemp);
  fs.renameSync(townTemp, townPath);

  const classPath = path.join(bgDir, "classroom.png");
  if (!fs.existsSync(classPath)) {
    await sharp({
      create: { width: 1280, height: 720, channels: 3, background: { r: 196, g: 168, b: 118 } },
    })
      .png()
      .toFile(classPath);
  }

  fs.writeFileSync(
    path.join(publicDir, "assets", "ASSETS.md"),
    `# Test Assets

- Kenney Modular Character Pack (CC0) with per-part layout anchors
- Mouth flaps from Kenney Face/Mouth sprites
- Generated flat-color backgrounds
`,
  );

  // Episode JSON embeds layers + layout so Remotion needs no runtime fetches
  const episodePath = path.join(root, "src/data/testEpisode.json");
  if (fs.existsSync(episodePath)) {
    const episode = JSON.parse(fs.readFileSync(episodePath, "utf8"));
    for (const [charId, character] of Object.entries(episode.characters ?? {})) {
      if (built[charId]) {
        character.layers = built[charId].layers;
        character.layout = built[charId].layout;
      }
    }
    fs.writeFileSync(episodePath, `${JSON.stringify(episode, null, 2)}\n`);
  }

  console.log("Asset preparation complete.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
