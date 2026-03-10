const fs = require('fs');
const path = require('path');

const manualDir = path.join(__dirname, '..', 'docs', 'manual');

function extractSpellData(filePath, level) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Extract name (first # heading)
  const nameLine = lines.find(l => l.startsWith('# '));
  const nombre = nameLine ? nameLine.replace('# ', '').trim() : '';
  
  // Extract school and type (bold line like "**Evocación — Nivel 1**" or "**Evocación — Truco (nivel 0)**")
  const schoolLine = lines.find(l => /^\*\*[A-ZÁÉÍÓÚ]/.test(l) && (l.includes('Nivel') || l.includes('Truco') || l.includes('nivel')));
  let escuela = '';
  if (schoolLine) {
    const m = schoolLine.match(/^\*\*([^—]+)/);
    if (m) escuela = m[1].replace(/\*\*/g, '').trim();
  }
  
  // Extract metadata
  let tiempo = '', alcance = '', componentes = '', duracion = '';
  for (const line of lines) {
    if (line.includes('Tiempo de lanzamiento:')) {
      tiempo = line.replace(/.*Tiempo de lanzamiento:\*?\*?\s*/, '').trim();
    }
    if (line.includes('Alcance:')) {
      alcance = line.replace(/.*Alcance:\*?\*?\s*/, '').trim();
    }
    if (line.includes('Componentes:')) {
      componentes = line.replace(/.*Componentes:\*?\*?\s*/, '').trim();
    }
    if (line.includes('Duración:')) {
      duracion = line.replace(/.*Duración:\*?\*?\s*/, '').trim();
    }
  }
  
  // Extract description (everything after the last --- separator that comes after metadata)
  let lastSepIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      lastSepIdx = i;
    }
  }
  let descLines = [];
  if (lastSepIdx >= 0 && lastSepIdx < lines.length - 1) {
    descLines = lines.slice(lastSepIdx + 1).filter(l => l.trim() !== '');
  }
  const descripcion = descLines.join(' ').replace(/\s+/g, ' ').replace(/\*\*_?|_?\*\*/g, '').trim();
  
  // Generate id from filename
  const id = path.basename(filePath, '.md');
  
  return { id, nombre, nivel: level, escuela, tiempo, alcance, componentes, duracion, descripcion };
}

// Extract cantrips
const trucosDir = path.join(manualDir, 'trucos');
const cantrips = [];
if (fs.existsSync(trucosDir)) {
  for (const file of fs.readdirSync(trucosDir).sort()) {
    if (file.endsWith('.md')) {
      cantrips.push(extractSpellData(path.join(trucosDir, file), 0));
    }
  }
}

// Extract spells levels 1-9
const spells = [];
for (let level = 1; level <= 9; level++) {
  const levelDir = path.join(manualDir, 'conjuros', `nivel_${level}`);
  if (fs.existsSync(levelDir)) {
    for (const file of fs.readdirSync(levelDir).sort()) {
      if (file.endsWith('.md')) {
        spells.push(extractSpellData(path.join(levelDir, file), level));
      }
    }
  }
}

const output = JSON.stringify({ cantrips, spells }, null, 2);
fs.writeFileSync(path.join(__dirname, 'spells-data.json'), output, 'utf-8');
console.log(`Extracted ${cantrips.length} cantrips and ${spells.length} spells`);
