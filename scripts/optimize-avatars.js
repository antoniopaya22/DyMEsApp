/**
 * Script para optimizar las imágenes de avatares de personaje.
 *
 * Recorre assets/images/personajes/{clase}/*.png, redimensiona al lado
 * mayor ≤ 1024px, convierte a WebP con quality 80, y elimina el PNG original.
 *
 * Dependencia: sharp (ya instalado como devDependency)
 *
 * Uso: node scripts/optimize-avatars.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGES_DIR = path.join(
  __dirname,
  "..",
  "assets",
  "images",
  "personajes",
);

const MAX_SIZE = 1024;
const WEBP_QUALITY = 80;

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") return null;

  const outputPath = filePath.replace(/\.(png|jpe?g)$/i, ".webp");

  // Skip if already converted
  if (fs.existsSync(outputPath)) {
    return { skipped: true, file: path.basename(filePath) };
  }

  const originalSize = fs.statSync(filePath).size;

  await sharp(filePath)
    .resize(MAX_SIZE, MAX_SIZE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);

  const newSize = fs.statSync(outputPath).size;

  // Remove original after successful conversion
  fs.unlinkSync(filePath);

  return {
    skipped: false,
    file: path.basename(filePath),
    originalSize,
    newSize,
  };
}

async function optimize() {
  const classes = fs
    .readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let totalOriginal = 0;
  let totalNew = 0;
  let converted = 0;
  let skipped = 0;

  console.log("\n🔄 Optimizando avatares...\n");

  for (const classDir of classes) {
    const classPath = path.join(IMAGES_DIR, classDir);
    const files = fs
      .readdirSync(classPath)
      .filter(
        (f) =>
          f.endsWith(".png") ||
          f.endsWith(".jpg") ||
          f.endsWith(".jpeg"),
      );

    if (files.length === 0) {
      console.log(`   ${classDir}/ — sin imágenes para convertir`);
      continue;
    }

    for (const file of files) {
      const filePath = path.join(classPath, file);
      const result = await optimizeFile(filePath);

      if (!result) continue;

      if (result.skipped) {
        skipped++;
        continue;
      }

      const savedPct = (
        ((result.originalSize - result.newSize) / result.originalSize) *
        100
      ).toFixed(1);
      const origKB = (result.originalSize / 1024).toFixed(0);
      const newKB = (result.newSize / 1024).toFixed(0);

      console.log(
        `   ${classDir}/${result.file} → .webp  ${origKB}KB → ${newKB}KB  (-${savedPct}%)`,
      );

      totalOriginal += result.originalSize;
      totalNew += result.newSize;
      converted++;
    }
  }

  const totalOrigMB = (totalOriginal / (1024 * 1024)).toFixed(1);
  const totalNewMB = (totalNew / (1024 * 1024)).toFixed(1);
  const totalSavedPct =
    totalOriginal > 0
      ? (((totalOriginal - totalNew) / totalOriginal) * 100).toFixed(1)
      : "0";

  console.log(`\n✅ Optimización completada:`);
  console.log(`   Convertidos: ${converted} archivos`);
  if (skipped > 0) console.log(`   Omitidos (ya convertidos): ${skipped}`);
  console.log(`   Tamaño original: ${totalOrigMB} MB`);
  console.log(`   Tamaño nuevo:    ${totalNewMB} MB`);
  console.log(`   Ahorro total:    ${totalSavedPct}%\n`);
}

optimize().catch((err) => {
  console.error("❌ Error durante la optimización:", err);
  process.exit(1);
});
