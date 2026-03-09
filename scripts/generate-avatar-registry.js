/**
 * Script para generar el registro estático de avatares de personaje.
 *
 * Escanea assets/images/personajes/{clase}/{Raza}_{Male|Female}.(png|jpg|webp)
 * y genera src/constants/avatarRegistry.ts con los require() estáticos.
 *
 * Uso: node scripts/generate-avatar-registry.js
 */

const fs = require("fs");
const path = require("path");

const IMAGES_DIR = path.join(
  __dirname,
  "..",
  "assets",
  "images",
  "personajes",
);
const OUTPUT_FILE = path.join(
  __dirname,
  "..",
  "src",
  "constants",
  "avatarRegistry.ts",
);

// Mapeo de RaceId → nombre en el filesystem (capitalizado)
const RACE_FILENAME_MAP = {
  enano: "Enano",
  elfo: "Elfo",
  mediano: "Mediano",
  humano: "Humano",
  draconido: "Draconido",
  gnomo: "Gnomo",
  semielfo: "Semielfo",
  semiorco: "Semiorco",
  tiefling: "Tiefling",
  hada: "Hada",
  liebren: "Liebren",
};

const SEXO_FILENAME_MAP = {
  masculino: "Male",
  femenino: "Female",
};

function generate() {
  const classes = fs
    .readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const entries = [];

  for (const classDir of classes) {
    const classPath = path.join(IMAGES_DIR, classDir);
    const files = fs
      .readdirSync(classPath)
      .filter((f) => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".webp"));

    for (const file of files) {
      // Parse: {Race}_{Gender}.png
      const match = file.match(/^(.+)_(Male|Female)\.(png|jpg|webp)$/);
      if (!match) {
        console.warn(`  ⚠️  Archivo ignorado (nombre no válido): ${classDir}/${file}`);
        continue;
      }
      const [, raceFilename, genderFilename] = match;

      // Find raceId
      const raceEntry = Object.entries(RACE_FILENAME_MAP).find(
        ([, v]) => v === raceFilename,
      );
      if (!raceEntry) {
        console.warn(
          `  ⚠️  Raza desconocida: "${raceFilename}" en ${classDir}/${file}`,
        );
        continue;
      }
      const raceId = raceEntry[0];

      // Find sexo
      const sexoEntry = Object.entries(SEXO_FILENAME_MAP).find(
        ([, v]) => v === genderFilename,
      );
      if (!sexoEntry) continue;
      const sexo = sexoEntry[0];

      const key = `${classDir}_${raceId}_${sexo}`;
      const requirePath = `../../assets/images/personajes/${classDir}/${file}`;
      entries.push({ key, requirePath, classDir, raceId, sexo, file });
    }
  }

  console.log(`\n✅ Encontrados ${entries.length} avatares:\n`);
  for (const e of entries) {
    console.log(`   ${e.classDir}/${e.file} → ${e.key}`);
  }

  // Generate TypeScript file
  const lines = [
    "/**",
    " * Registro estático de avatares de personaje.",
    " * GENERADO AUTOMÁTICAMENTE — no editar manualmente.",
    " * Ejecutar: node scripts/generate-avatar-registry.js",
    " */",
    "",
    'import type { ImageSource } from "expo-image";',
    'import type { ClassId, RaceId, Sexo } from "@/types/character";',
    "",
    "// Clave: `${classId}_${raceId}_${sexo}`",
    "type AvatarKey = `${ClassId}_${RaceId}_${Sexo}`;",
    "",
    "export const AVATAR_REGISTRY: Partial<Record<AvatarKey, ImageSource>> = {",
  ];

  for (const e of entries) {
    lines.push(
      `  "${e.key}": require("${e.requirePath}"),`,
    );
  }

  lines.push("};", "");

  fs.writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf-8");
  console.log(`\n📄 Generado: ${OUTPUT_FILE}`);
}

generate();
