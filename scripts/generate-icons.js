/**
 * generate-icons.js
 *
 * Generates SVG icon assets for the DyMEs app.
 * These SVGs can be converted to PNG using any SVG-to-PNG tool
 * (e.g., sharp, Inkscape CLI, or online converters).
 *
 * Generated files:
 *   - assets/icon.svg          (1024Ãƒâ€”1024 Ã¢â‚¬â€ app icon)
 *   - assets/adaptive-icon.svg (1024Ãƒâ€”1024 Ã¢â‚¬â€ Android adaptive icon foreground)
 *   - assets/splash-icon.svg   (512Ãƒâ€”512  Ã¢â‚¬â€ splash screen logo)
 *   - assets/favicon.svg       (48Ãƒâ€”48    Ã¢â‚¬â€ web favicon)
 *
 * Usage:
 *   node scripts/generate-icons.js
 *   # Then convert SVGs to PNGs:
 *   npx sharp-cli -i assets/icon.svg -o assets/icon.png -w 1024 -h 1024
 *   npx sharp-cli -i assets/adaptive-icon.svg -o assets/adaptive-icon.png -w 1024 -h 1024
 *   npx sharp-cli -i assets/splash-icon.svg -o assets/splash-icon.png -w 512 -h 512
 *   npx sharp-cli -i assets/favicon.svg -o assets/favicon.png -w 48 -h 48
 */

const fs = require("fs");
const path = require("path");

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ D20 Geometry Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function getD20Geometry(cx, cy, radius) {
  const r = radius;
  const r2 = r * 0.56;

  const outerPoints = [];
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    outerPoints.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }

  const innerPoints = [];
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2 + Math.PI / 5;
    innerPoints.push({
      x: cx + r2 * Math.cos(angle),
      y: cy + r2 * Math.sin(angle),
    });
  }

  const outerFaces = [];
  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    outerFaces.push({
      points: [outerPoints[i], outerPoints[next], innerPoints[i]],
      shade: i === 0 ? 0.9 : i === 1 ? 0.72 : i === 4 ? 0.78 : i === 2 ? 0.48 : 0.52,
    });
  }

  const innerFaces = [];
  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    innerFaces.push({
      points: [innerPoints[i], innerPoints[next], outerPoints[next]],
      shade: i === 0 ? 0.62 : i === 1 ? 0.42 : i === 4 ? 0.56 : i === 2 ? 0.32 : 0.38,
    });
  }

  return { outerPoints, innerPoints, outerFaces, innerFaces, centerFace: innerPoints };
}

function ptsStr(points) {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Rune characters Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const RUNES = "Ã¡Å¡Â Ã¡Å¡Â¢Ã¡Å¡Â¦Ã¡Å¡Â¨Ã¡Å¡Â±Ã¡Å¡Â²Ã¡Å¡Â·Ã¡Å¡Â¹Ã¡Å¡ÂºÃ¡Å¡Â¾Ã¡â€ºÂÃ¡â€ºÆ’";

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ SVG Generators Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function generateAppIcon(size) {
  const cx = size / 2;
  const cy = size / 2;
  const dieRadius = size * 0.28;
  const runicR = size * 0.38;
  const geo = getD20Geometry(cx, cy, dieRadius);
  const fontSize = size * 0.15;
  const bgPad = size * 0.08;

  // Rune positions
  const runePositions = Array.from(RUNES).map((char, i) => {
    const angle = (Math.PI * 2 * i) / RUNES.length - Math.PI / 2;
    return {
      x: cx + (runicR - size * 0.01) * Math.cos(angle),
      y: cy + (runicR - size * 0.01) * Math.sin(angle),
      char,
    };
  });

  // Tick marks
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 8;
    const r1 = runicR;
    const r2 = runicR + (i % 2 === 0 ? size * 0.02 : size * 0.012);
    return {
      x1: cx + r1 * Math.cos(angle),
      y1: cy + r1 * Math.sin(angle),
      x2: cx + r2 * Math.cos(angle),
      y2: cy + r2 * Math.sin(angle),
      major: i % 2 === 0,
    };
  });

  // Cardinal diamonds
  const diamonds = [0, 2, 4, 6].map((i) => {
    const angle = (Math.PI * 2 * i) / 8;
    const dr = runicR + size * 0.035;
    const dx = cx + dr * Math.cos(angle);
    const dy = cy + dr * Math.sin(angle);
    const s = size * 0.012;
    return `${dx},${dy - s * 1.5} ${dx + s},${dy} ${dx},${dy + s * 1.5} ${dx - s},${dy}`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <!-- Background gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#0B1221" />
      <stop offset="60%" stop-color="#111122" />
      <stop offset="100%" stop-color="#060A14" />
    </radialGradient>

    <!-- Icon background shape gradient -->
    <radialGradient id="bgShapeGrad" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#101B2E" />
      <stop offset="100%" stop-color="#060A14" />
    </radialGradient>

    <!-- Die face gradients -->
    <linearGradient id="faceHL" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#33EBFF" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#7f0000"/>
    </linearGradient>
    <linearGradient id="faceMain" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D4E8"/>
      <stop offset="50%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#8e0000"/>
    </linearGradient>
    <linearGradient id="faceSH" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#b71c1c" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#5d0000"/>
    </linearGradient>
    <radialGradient id="centerGrad" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="#33EBFF" stop-opacity="0.35"/>
      <stop offset="45%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#7f0000" stop-opacity="0.95"/>
    </radialGradient>
    <linearGradient id="edgeShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
    </linearGradient>

    <!-- Glow gradients -->
    <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00BCD4" stop-opacity="0.25"/>
      <stop offset="65%" stop-color="#00BCD4" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#00BCD4" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="runeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#00E5FF" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#bgGrad)"/>

  <!-- Subtle border -->
  <rect x="${bgPad * 0.3}" y="${bgPad * 0.3}" width="${size - bgPad * 0.6}" height="${size - bgPad * 0.6}" rx="${size * 0.17}" fill="none" stroke="#00E5FF" stroke-width="${size * 0.002}" stroke-opacity="0.15"/>

  <!-- Outer die glow -->
  <circle cx="${cx}" cy="${cy}" r="${runicR + size * 0.06}" fill="url(#outerGlow)"/>

  <!-- Runic ring glow -->
  <circle cx="${cx}" cy="${cy}" r="${runicR + size * 0.015}" fill="url(#runeGlow)"/>

  <!-- Runic ring circles -->
  <circle cx="${cx}" cy="${cy}" r="${runicR}" fill="none" stroke="#00E5FF" stroke-width="${size * 0.004}" stroke-opacity="0.45"/>
  <circle cx="${cx}" cy="${cy}" r="${runicR - size * 0.028}" fill="none" stroke="#00E5FF" stroke-width="${size * 0.002}" stroke-opacity="0.25"/>

  <!-- Rune characters -->
  ${runePositions
    .map(
      (r) =>
        `<text x="${r.x.toFixed(1)}" y="${(r.y + size * 0.015).toFixed(1)}" text-anchor="middle" font-size="${size * 0.035}" font-family="serif" fill="#00E5FF" fill-opacity="0.55">${r.char}</text>`
    )
    .join("\n  ")}

  <!-- Tick marks -->
  ${ticks
    .map(
      (t) =>
        `<line x1="${t.x1.toFixed(1)}" y1="${t.y1.toFixed(1)}" x2="${t.x2.toFixed(1)}" y2="${t.y2.toFixed(1)}" stroke="#00E5FF" stroke-width="${t.major ? size * 0.006 : size * 0.003}" stroke-opacity="${t.major ? 0.6 : 0.35}"/>`
    )
    .join("\n  ")}

  <!-- Cardinal diamonds -->
  ${diamonds.map((d) => `<polygon points="${d}" fill="#00E5FF" fill-opacity="0.5"/>`).join("\n  ")}

  <!-- Die border glow -->
  <circle cx="${cx}" cy="${cy}" r="${dieRadius + size * 0.015}" fill="none" stroke="#00BCD4" stroke-width="${size * 0.005}" stroke-opacity="0.3"/>

  <!-- Outer triangular faces -->
  ${geo.outerFaces
    .map((face) => {
      const fillId = face.shade > 0.7 ? "faceHL" : face.shade > 0.5 ? "faceMain" : "faceSH";
      return `<polygon points="${ptsStr(face.points)}" fill="url(#${fillId})" stroke="#5d0000" stroke-width="${size * 0.004}" stroke-opacity="0.6" opacity="${(0.88 + face.shade * 0.12).toFixed(2)}"/>`;
    })
    .join("\n  ")}

  <!-- Inner triangular faces -->
  ${geo.innerFaces
    .map((face) => {
      const fillId = face.shade > 0.5 ? "faceMain" : "faceSH";
      return `<polygon points="${ptsStr(face.points)}" fill="url(#${fillId})" stroke="#5d0000" stroke-width="${size * 0.004}" stroke-opacity="0.45" opacity="${(0.82 + face.shade * 0.18).toFixed(2)}"/>`;
    })
    .join("\n  ")}

  <!-- Center pentagon face -->
  <polygon points="${ptsStr(geo.centerFace)}" fill="url(#centerGrad)" stroke="#33EBFF" stroke-width="${size * 0.005}" stroke-opacity="0.25"/>

  <!-- Specular highlights -->
  <polygon points="${ptsStr(geo.outerFaces[0].points)}" fill="url(#edgeShine)" opacity="0.45"/>
  <polygon points="${ptsStr(geo.outerFaces[4].points)}" fill="url(#edgeShine)" opacity="0.3"/>

  <!-- Edge lines -->
  ${geo.outerPoints
    .map((point, i) => {
      const inner = geo.innerPoints[i];
      const opacity = i === 0 || i === 4 ? 0.4 : 0.15;
      return `<line x1="${point.x.toFixed(1)}" y1="${point.y.toFixed(1)}" x2="${inner.x.toFixed(1)}" y2="${inner.y.toFixed(1)}" stroke="#33EBFF" stroke-width="${size * 0.003}" stroke-opacity="${opacity}"/>`;
    })
    .join("\n  ")}

  <!-- "20" text shadow -->
  <text x="${cx + size * 0.003}" y="${cy + fontSize * 0.35 + size * 0.005}" text-anchor="middle" font-size="${fontSize}" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#000000" fill-opacity="0.45">20</text>

  <!-- "20" text -->
  <text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle" font-size="${fontSize}" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#ffffff" fill-opacity="0.95">20</text>

  <!-- Top vertex sparkle -->
  <circle cx="${geo.outerPoints[0].x.toFixed(1)}" cy="${geo.outerPoints[0].y.toFixed(1)}" r="${size * 0.008}" fill="#ffffff" fill-opacity="0.5"/>

  <!-- "DyMEs" label at bottom -->
  <text x="${cx}" y="${cy + runicR + size * 0.085}" text-anchor="middle" font-size="${size * 0.055}" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#00E5FF" fill-opacity="0.9" letter-spacing="${size * 0.008}">DyMEs</text>
  <text x="${cx}" y="${cy + runicR + size * 0.12}" text-anchor="middle" font-size="${size * 0.028}" font-weight="700" font-family="Arial, Helvetica, sans-serif" fill="#00E5FF" fill-opacity="0.5" letter-spacing="${size * 0.012}">5Âª EDICIÃ“N</text>

  <!-- Sparkle accents -->
  <polygon points="${cx + dieRadius + size * 0.04},${cy - dieRadius + size * 0.01} ${cx + dieRadius + size * 0.05},${cy - dieRadius - size * 0.015} ${cx + dieRadius + size * 0.06},${cy - dieRadius + size * 0.01} ${cx + dieRadius + size * 0.05},${cy - dieRadius + size * 0.035}" fill="#00E5FF" fill-opacity="0.7"/>
  <circle cx="${cx - dieRadius - size * 0.025}" cy="${cy + dieRadius - size * 0.04}" r="${size * 0.007}" fill="#00E5FF" fill-opacity="0.5"/>
</svg>`;
}

function generateSplashIcon(size) {
  const cx = size / 2;
  const cy = size * 0.42;
  const dieRadius = size * 0.22;
  const runicR = size * 0.3;
  const geo = getD20Geometry(cx, cy, dieRadius);
  const fontSize = size * 0.12;

  // Rune positions for splash
  const runePositions = Array.from(RUNES).map((char, i) => {
    const angle = (Math.PI * 2 * i) / RUNES.length - Math.PI / 2;
    return {
      x: cx + (runicR - size * 0.008) * Math.cos(angle),
      y: cy + (runicR - size * 0.008) * Math.sin(angle),
      char,
    };
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="splashBg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#0B1221"/>
      <stop offset="100%" stop-color="#060A14"/>
    </radialGradient>
    <linearGradient id="sFaceHL" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#33EBFF" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#7f0000"/>
    </linearGradient>
    <linearGradient id="sFaceMain" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D4E8"/>
      <stop offset="50%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#8e0000"/>
    </linearGradient>
    <linearGradient id="sFaceSH" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#b71c1c" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#5d0000"/>
    </linearGradient>
    <radialGradient id="sCenterGrad" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="#33EBFF" stop-opacity="0.35"/>
      <stop offset="45%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#7f0000" stop-opacity="0.95"/>
    </radialGradient>
    <linearGradient id="sEdgeShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
    </linearGradient>
    <radialGradient id="sOuterGlow" cx="50%" cy="42%" r="40%">
      <stop offset="0%" stop-color="#00BCD4" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#00BCD4" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sRuneGlow" cx="50%" cy="42%" r="35%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#00E5FF" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Transparent background (splash bg color is set in app.json) -->
  <rect width="${size}" height="${size}" fill="transparent"/>

  <!-- Outer glow -->
  <circle cx="${cx}" cy="${cy}" r="${runicR + size * 0.05}" fill="url(#sOuterGlow)"/>

  <!-- Runic ring -->
  <circle cx="${cx}" cy="${cy}" r="${runicR + size * 0.01}" fill="url(#sRuneGlow)"/>
  <circle cx="${cx}" cy="${cy}" r="${runicR}" fill="none" stroke="#00E5FF" stroke-width="${size * 0.003}" stroke-opacity="0.4"/>
  <circle cx="${cx}" cy="${cy}" r="${runicR - size * 0.022}" fill="none" stroke="#00E5FF" stroke-width="${size * 0.002}" stroke-opacity="0.2"/>

  <!-- Rune characters -->
  ${runePositions
    .map(
      (r) =>
        `<text x="${r.x.toFixed(1)}" y="${(r.y + size * 0.012).toFixed(1)}" text-anchor="middle" font-size="${size * 0.028}" font-family="serif" fill="#00E5FF" fill-opacity="0.5">${r.char}</text>`
    )
    .join("\n  ")}

  <!-- Die border glow -->
  <circle cx="${cx}" cy="${cy}" r="${dieRadius + size * 0.012}" fill="none" stroke="#00BCD4" stroke-width="${size * 0.004}" stroke-opacity="0.3"/>

  <!-- Outer faces -->
  ${geo.outerFaces
    .map((face) => {
      const fillId = face.shade > 0.7 ? "sFaceHL" : face.shade > 0.5 ? "sFaceMain" : "sFaceSH";
      return `<polygon points="${ptsStr(face.points)}" fill="url(#${fillId})" stroke="#5d0000" stroke-width="${size * 0.003}" stroke-opacity="0.6" opacity="${(0.88 + face.shade * 0.12).toFixed(2)}"/>`;
    })
    .join("\n  ")}

  <!-- Inner faces -->
  ${geo.innerFaces
    .map((face) => {
      const fillId = face.shade > 0.5 ? "sFaceMain" : "sFaceSH";
      return `<polygon points="${ptsStr(face.points)}" fill="url(#${fillId})" stroke="#5d0000" stroke-width="${size * 0.003}" stroke-opacity="0.45" opacity="${(0.82 + face.shade * 0.18).toFixed(2)}"/>`;
    })
    .join("\n  ")}

  <!-- Center pentagon -->
  <polygon points="${ptsStr(geo.centerFace)}" fill="url(#sCenterGrad)" stroke="#33EBFF" stroke-width="${size * 0.004}" stroke-opacity="0.25"/>

  <!-- Specular highlights -->
  <polygon points="${ptsStr(geo.outerFaces[0].points)}" fill="url(#sEdgeShine)" opacity="0.45"/>
  <polygon points="${ptsStr(geo.outerFaces[4].points)}" fill="url(#sEdgeShine)" opacity="0.3"/>

  <!-- Edge lines -->
  ${geo.outerPoints
    .map((point, i) => {
      const inner = geo.innerPoints[i];
      const opacity = i === 0 || i === 4 ? 0.4 : 0.15;
      return `<line x1="${point.x.toFixed(1)}" y1="${point.y.toFixed(1)}" x2="${inner.x.toFixed(1)}" y2="${inner.y.toFixed(1)}" stroke="#33EBFF" stroke-width="${size * 0.002}" stroke-opacity="${opacity}"/>`;
    })
    .join("\n  ")}

  <!-- "20" text -->
  <text x="${cx + size * 0.002}" y="${cy + fontSize * 0.35 + size * 0.004}" text-anchor="middle" font-size="${fontSize}" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#000000" fill-opacity="0.4">20</text>
  <text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle" font-size="${fontSize}" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#ffffff" fill-opacity="0.95">20</text>

  <!-- Top vertex sparkle -->
  <circle cx="${geo.outerPoints[0].x.toFixed(1)}" cy="${geo.outerPoints[0].y.toFixed(1)}" r="${size * 0.006}" fill="#ffffff" fill-opacity="0.5"/>

  <!-- Brand text below -->
  <text x="${cx}" y="${cy + runicR + size * 0.1}" text-anchor="middle" font-size="${size * 0.065}" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#00E5FF" fill-opacity="0.9" letter-spacing="${size * 0.01}">D&amp;D ESPAÃƒâ€˜OL</text>

  <!-- Subtitle -->
  <text x="${cx}" y="${cy + runicR + size * 0.145}" text-anchor="middle" font-size="${size * 0.03}" font-weight="700" font-family="Arial, Helvetica, sans-serif" fill="#00E5FF" fill-opacity="0.45" letter-spacing="${size * 0.015}">5Ã‚Âª EDICIÃƒâ€œN</text>

  <!-- Decorative lines around text -->
  <line x1="${cx - size * 0.22}" y1="${cy + runicR + size * 0.065}" x2="${cx - size * 0.05}" y2="${cy + runicR + size * 0.065}" stroke="#00E5FF" stroke-width="${size * 0.002}" stroke-opacity="0.25"/>
  <line x1="${cx + size * 0.05}" y1="${cy + runicR + size * 0.065}" x2="${cx + size * 0.22}" y2="${cy + runicR + size * 0.065}" stroke="#00E5FF" stroke-width="${size * 0.002}" stroke-opacity="0.25"/>

  <!-- Small diamonds flanking subtitle -->
  <polygon points="${cx - size * 0.12},${cy + runicR + size * 0.138} ${cx - size * 0.115},${cy + runicR + size * 0.133} ${cx - size * 0.11},${cy + runicR + size * 0.138} ${cx - size * 0.115},${cy + runicR + size * 0.143}" fill="#00E5FF" fill-opacity="0.4"/>
  <polygon points="${cx + size * 0.12},${cy + runicR + size * 0.138} ${cx + size * 0.115},${cy + runicR + size * 0.133} ${cx + size * 0.11},${cy + runicR + size * 0.138} ${cx + size * 0.115},${cy + runicR + size * 0.143}" fill="#00E5FF" fill-opacity="0.4"/>

  <!-- Sparkle accents -->
  <polygon points="${cx + dieRadius + size * 0.03},${cy - dieRadius + size * 0.01} ${cx + dieRadius + size * 0.04},${cy - dieRadius - size * 0.012} ${cx + dieRadius + size * 0.05},${cy - dieRadius + size * 0.01} ${cx + dieRadius + size * 0.04},${cy - dieRadius + size * 0.032}" fill="#00E5FF" fill-opacity="0.65"/>
</svg>`;
}

function generateFavicon(size) {
  const cx = size / 2;
  const cy = size / 2;
  const dieRadius = size * 0.38;
  const geo = getD20Geometry(cx, cy, dieRadius);
  const fontSize = size * 0.32;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="fFaceHL" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#33EBFF"/>
      <stop offset="55%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#7f0000"/>
    </linearGradient>
    <linearGradient id="fFaceMain" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D4E8"/>
      <stop offset="50%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#8e0000"/>
    </linearGradient>
    <linearGradient id="fFaceSH" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#b71c1c"/>
      <stop offset="100%" stop-color="#5d0000"/>
    </linearGradient>
    <radialGradient id="fCenterGrad" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="#33EBFF" stop-opacity="0.35"/>
      <stop offset="45%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#7f0000"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#060A14"/>

  <!-- Border -->
  <rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="${size * 0.14}" fill="none" stroke="#00E5FF" stroke-width="0.5" stroke-opacity="0.3"/>

  <!-- Outer faces -->
  ${geo.outerFaces
    .map((face) => {
      const fillId = face.shade > 0.7 ? "fFaceHL" : face.shade > 0.5 ? "fFaceMain" : "fFaceSH";
      return `<polygon points="${ptsStr(face.points)}" fill="url(#${fillId})" stroke="#5d0000" stroke-width="0.5" opacity="${(0.88 + face.shade * 0.12).toFixed(2)}"/>`;
    })
    .join("\n  ")}

  <!-- Inner faces -->
  ${geo.innerFaces
    .map((face) => {
      const fillId = face.shade > 0.5 ? "fFaceMain" : "fFaceSH";
      return `<polygon points="${ptsStr(face.points)}" fill="url(#${fillId})" stroke="#5d0000" stroke-width="0.5" opacity="${(0.82 + face.shade * 0.18).toFixed(2)}"/>`;
    })
    .join("\n  ")}

  <!-- Center face -->
  <polygon points="${ptsStr(geo.centerFace)}" fill="url(#fCenterGrad)" stroke="#33EBFF" stroke-width="0.5" stroke-opacity="0.25"/>

  <!-- "20" text -->
  <text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle" font-size="${fontSize}" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#ffffff" fill-opacity="0.95">20</text>
</svg>`;
}

function generateAdaptiveIcon(size) {
  // Android adaptive icons need the foreground centered in the safe zone
  // (the inner 66% of the icon area). We keep the D20 centered.
  const cx = size / 2;
  const cy = size / 2;
  const dieRadius = size * 0.2;
  const runicR = size * 0.28;
  const geo = getD20Geometry(cx, cy, dieRadius);
  const fontSize = size * 0.11;

  const runePositions = Array.from(RUNES).map((char, i) => {
    const angle = (Math.PI * 2 * i) / RUNES.length - Math.PI / 2;
    return {
      x: cx + (runicR - size * 0.008) * Math.cos(angle),
      y: cy + (runicR - size * 0.008) * Math.sin(angle),
      char,
    };
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="aFaceHL" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#33EBFF" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#7f0000"/>
    </linearGradient>
    <linearGradient id="aFaceMain" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D4E8"/>
      <stop offset="50%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#8e0000"/>
    </linearGradient>
    <linearGradient id="aFaceSH" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#b71c1c" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#5d0000"/>
    </linearGradient>
    <radialGradient id="aCenterGrad" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="#33EBFF" stop-opacity="0.35"/>
      <stop offset="45%" stop-color="#00BCD4"/>
      <stop offset="100%" stop-color="#7f0000" stop-opacity="0.95"/>
    </radialGradient>
    <linearGradient id="aEdgeShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
    </linearGradient>
    <radialGradient id="aOuterGlow" cx="50%" cy="50%" r="40%">
      <stop offset="0%" stop-color="#00BCD4" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#00BCD4" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aRuneGlow" cx="50%" cy="50%" r="35%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#00E5FF" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Transparent background (adaptive icon bg is set separately) -->
  <rect width="${size}" height="${size}" fill="transparent"/>

  <!-- Glow -->
  <circle cx="${cx}" cy="${cy}" r="${runicR + size * 0.05}" fill="url(#aOuterGlow)"/>
  <circle cx="${cx}" cy="${cy}" r="${runicR + size * 0.01}" fill="url(#aRuneGlow)"/>

  <!-- Runic ring -->
  <circle cx="${cx}" cy="${cy}" r="${runicR}" fill="none" stroke="#00E5FF" stroke-width="${size * 0.003}" stroke-opacity="0.4"/>
  <circle cx="${cx}" cy="${cy}" r="${runicR - size * 0.02}" fill="none" stroke="#00E5FF" stroke-width="${size * 0.0015}" stroke-opacity="0.2"/>

  <!-- Rune chars -->
  ${runePositions
    .map(
      (r) =>
        `<text x="${r.x.toFixed(1)}" y="${(r.y + size * 0.012).toFixed(1)}" text-anchor="middle" font-size="${size * 0.025}" font-family="serif" fill="#00E5FF" fill-opacity="0.5">${r.char}</text>`
    )
    .join("\n  ")}

  <!-- Die border glow -->
  <circle cx="${cx}" cy="${cy}" r="${dieRadius + size * 0.012}" fill="none" stroke="#00BCD4" stroke-width="${size * 0.004}" stroke-opacity="0.3"/>

  <!-- Outer faces -->
  ${geo.outerFaces
    .map((face) => {
      const fillId = face.shade > 0.7 ? "aFaceHL" : face.shade > 0.5 ? "aFaceMain" : "aFaceSH";
      return `<polygon points="${ptsStr(face.points)}" fill="url(#${fillId})" stroke="#5d0000" stroke-width="${size * 0.003}" stroke-opacity="0.6" opacity="${(0.88 + face.shade * 0.12).toFixed(2)}"/>`;
    })
    .join("\n  ")}

  <!-- Inner faces -->
  ${geo.innerFaces
    .map((face) => {
      const fillId = face.shade > 0.5 ? "aFaceMain" : "aFaceSH";
      return `<polygon points="${ptsStr(face.points)}" fill="url(#${fillId})" stroke="#5d0000" stroke-width="${size * 0.003}" stroke-opacity="0.45" opacity="${(0.82 + face.shade * 0.18).toFixed(2)}"/>`;
    })
    .join("\n  ")}

  <!-- Center face -->
  <polygon points="${ptsStr(geo.centerFace)}" fill="url(#aCenterGrad)" stroke="#33EBFF" stroke-width="${size * 0.004}" stroke-opacity="0.25"/>

  <!-- Highlights -->
  <polygon points="${ptsStr(geo.outerFaces[0].points)}" fill="url(#aEdgeShine)" opacity="0.45"/>
  <polygon points="${ptsStr(geo.outerFaces[4].points)}" fill="url(#aEdgeShine)" opacity="0.3"/>

  <!-- Edge lines -->
  ${geo.outerPoints
    .map((point, i) => {
      const inner = geo.innerPoints[i];
      const opacity = i === 0 || i === 4 ? 0.4 : 0.15;
      return `<line x1="${point.x.toFixed(1)}" y1="${point.y.toFixed(1)}" x2="${inner.x.toFixed(1)}" y2="${inner.y.toFixed(1)}" stroke="#33EBFF" stroke-width="${size * 0.002}" stroke-opacity="${opacity}"/>`;
    })
    .join("\n  ")}

  <!-- "20" text -->
  <text x="${cx + size * 0.002}" y="${cy + fontSize * 0.35 + size * 0.004}" text-anchor="middle" font-size="${fontSize}" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#000000" fill-opacity="0.4">20</text>
  <text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle" font-size="${fontSize}" font-weight="900" font-family="Arial, Helvetica, sans-serif" fill="#ffffff" fill-opacity="0.95">20</text>

  <!-- Top sparkle -->
  <circle cx="${geo.outerPoints[0].x.toFixed(1)}" cy="${geo.outerPoints[0].y.toFixed(1)}" r="${size * 0.006}" fill="#ffffff" fill-opacity="0.5"/>

  <!-- Sparkle accents -->
  <polygon points="${cx + dieRadius + size * 0.03},${cy - dieRadius + size * 0.008} ${cx + dieRadius + size * 0.038},${cy - dieRadius - size * 0.01} ${cx + dieRadius + size * 0.046},${cy - dieRadius + size * 0.008} ${cx + dieRadius + size * 0.038},${cy - dieRadius + size * 0.026}" fill="#00E5FF" fill-opacity="0.65"/>
</svg>`;
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Main Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const assetsDir = path.join(__dirname, "..", "assets");

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const files = [
  { name: "icon.svg", content: generateAppIcon(1024) },
  { name: "adaptive-icon.svg", content: generateAdaptiveIcon(1024) },
  { name: "splash-icon.svg", content: generateSplashIcon(512) },
  { name: "favicon.svg", content: generateFavicon(48) },
];

console.log("Ã°ÂŸÂŽÂ² Generating DyMEs icon assets...\n");

for (const file of files) {
  const filePath = path.join(assetsDir, file.name);
  fs.writeFileSync(filePath, file.content, "utf8");
  console.log(`  Ã¢Å“â€¦ ${file.name} (${(file.content.length / 1024).toFixed(1)} KB)`);
}

console.log("\nÃ°Å¸Å½â€° Done! SVG icons generated in assets/");
console.log("\nÃ°Å¸â€œâ€¹ To convert to PNG, you can use one of these methods:");
console.log("  1. Online: https://svgtopng.com/");
console.log("  2. Inkscape CLI:");
console.log('     inkscape assets/icon.svg -o assets/icon.png -w 1024 -h 1024');
console.log("  3. Install sharp-cli:");
console.log('     npm install -g sharp-cli');
console.log('     sharp -i assets/icon.svg -o assets/icon.png resize 1024 1024');
console.log("");
