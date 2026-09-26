import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const downloads = path.join(root, "downloads");
const publicDir = path.join(root, "public");
const pngRoot = path.join(downloads, "extracted-characters", "PNG");

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

/** Kenney modular parts that share the same canvas anchor. */
const CHARACTER_PRESETS = {
  hero: {
    pants: resolve("Pants", "Blue 1", "pantsBlue11.png"),
    shirt: resolve("Shirts", "Blue", "blueShirt1.png"),
    shoes: resolve("Shoes", "Blue", "blueShoe1.png"),
    arm: resolve("Shirts", "Blue", "blueArm_short.png"),
    head: resolve("Skin", "Tint 1", "tint1_head.png"),
    eyes: resolve("Face", "Eyes", "eyeBrown_large.png"),
    eyebrows: resolve("Face", "Eyebrows", "brown1Brow1.png"),
    nose: resolve("Face", "Nose", "Tint 1", "tint1Nose1.png"),
    hair: resolve("Hair", "Black", "blackMan1.png"),
    mouths: {
      closed: resolve("Face", "Mouth", "mouth_straight.png"),
      open: resolve("Face", "Mouth", "mouth_oh.png"),
      wide: resolve("Face", "Mouth", "mouth_glad.png"),
    },
  },
  friend: {
    pants: resolve("Pants", "Red", "pantsRed1.png"),
    shirt: resolve("Shirts", "Red", "redShirt1.png"),
    shoes: resolve("Shoes", "Brown 1", "brownShoe1.png"),
    arm: resolve("Shirts", "Red", "redArm_short.png"),
    head: resolve("Skin", "Tint 2", "tint2_head.png"),
    eyes: resolve("Face", "Eyes", "eyeBlue_large.png"),
    eyebrows: resolve("Face", "Eyebrows", "blackBrow1.png"),
    nose: resolve("Face", "Nose", "Tint 2", "tint2Nose1.png"),
    hair: resolve("Hair", "Blonde", "blondeWoman1.png"),
    mouths: {
      closed: resolve("Face", "Mouth", "mouth_straight.png"),
      open: resolve("Face", "Mouth", "mouth_oh.png"),
      wide: resolve("Face", "Mouth", "mouth_happy.png"),
    },
  },
};

const buildCharacter = async (charId, preset) => {
  const charDir = path.join(publicDir, "assets/characters", charId);
  ensureDir(charDir);

  const sharp = (await import("sharp")).default;

  // Composite lower-body clothing into one aligned body layer
  const bodyLayers = [preset.pants, preset.shirt, preset.shoes];
  const meta = await sharp(preset.pants).metadata();
  const width = meta.width ?? 128;
  const height = meta.height ?? 256;

  let body = sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  });

  for (const layerPath of bodyLayers) {
    body = body.composite([{ input: layerPath, top: 0, left: 0 }]);
  }

  await body.png().toFile(path.join(charDir, "body.png"));

  copyFile(preset.head, path.join(charDir, "head.png"));
  copyFile(preset.eyes, path.join(charDir, "eyes.png"));
  copyFile(preset.eyebrows, path.join(charDir, "eyebrows.png"));
  copyFile(preset.nose, path.join(charDir, "nose.png"));
  copyFile(preset.hair, path.join(charDir, "hair.png"));
  copyFile(preset.arm, path.join(charDir, "arm-left.png"));
  copyFile(preset.arm, path.join(charDir, "arm-right.png"));
  copyFile(preset.mouths.closed, path.join(charDir, "mouth-closed.png"));
  copyFile(preset.mouths.open, path.join(charDir, "mouth-open.png"));
  copyFile(preset.mouths.wide, path.join(charDir, "mouth-wide.png"));
};

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

  // Validate friend red pants path — folder names vary
  if (!fs.existsSync(CHARACTER_PRESETS.friend.pants)) {
    CHARACTER_PRESETS.friend.pants = resolve("Pants", "Red", "pantsRed11.png");
  }
  if (!fs.existsSync(CHARACTER_PRESETS.friend.pants)) {
    CHARACTER_PRESETS.friend.pants = resolve("Pants", "Red", "pantsRed1_long.png");
  }
  if (!fs.existsSync(CHARACTER_PRESETS.friend.shirt)) {
    CHARACTER_PRESETS.friend.shirt = resolve("Shirts", "Red", "redShirt1.png");
  }
  if (!fs.existsSync(CHARACTER_PRESETS.friend.arm)) {
    CHARACTER_PRESETS.friend.arm = resolve("Shirts", "Red", "redArm_short.png");
  }
  if (!fs.existsSync(CHARACTER_PRESETS.friend.hair)) {
    CHARACTER_PRESETS.friend.hair = resolve("Hair", "Blonde", "blondeMan1.png");
  }

  await buildCharacter("hero", CHARACTER_PRESETS.hero);
  await buildCharacter("friend", CHARACTER_PRESETS.friend);

  // Backgrounds (generated flat plates)
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

- Kenney Modular Character Pack (CC0) - correctly layered skin, clothing, face parts
- Mouth flaps from Kenney Face/Mouth sprites (straight / oh / glad)
- Generated flat-color backgrounds
`,
  );

  console.log("Asset preparation complete.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
