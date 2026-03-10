const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'spells-data.json'), 'utf-8'));

let ts = `// Spell data extracted from the SRD 5.1 manual
// Auto-generated – Do not edit manually

export interface Spell {
  id: string;
  nombre: string;
  nivel: number;
  escuela: string;
  tiempo: string;
  alcance: string;
  componentes: string;
  duracion: string;
  descripcion: string;
}

`;

for (let level = 1; level <= 9; level++) {
  const spells = data.spells.filter(s => s.nivel === level);
  ts += `export const SPELLS_LEVEL_${level}: Spell[] = [\n`;
  for (const s of spells) {
    const desc = s.descripcion.replace(/'/g, "\\'").replace(/\n/g, ' ');
    ts += `  { id: '${s.id}', nombre: '${s.nombre.replace(/'/g, "\\'")}', nivel: ${s.nivel}, escuela: '${s.escuela.replace(/'/g, "\\'")}', tiempo: '${s.tiempo.replace(/'/g, "\\'")}', alcance: '${s.alcance.replace(/'/g, "\\'")}', componentes: '${s.componentes.replace(/'/g, "\\'")}', duracion: '${s.duracion.replace(/'/g, "\\'")}', descripcion: '${desc}' },\n`;
  }
  ts += `];\n\n`;
}

ts += `export const ALL_SPELLS: Spell[] = [\n`;
for (let level = 1; level <= 9; level++) {
  ts += `  ...SPELLS_LEVEL_${level},\n`;
}
ts += `];\n`;

const outDir = path.join(__dirname, '..', '..', 'DyMEsWeb', 'src', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'spells.ts'), ts, 'utf-8');
console.log('Generated spells.ts');
