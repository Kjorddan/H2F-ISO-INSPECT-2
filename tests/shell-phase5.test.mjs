import assert from'node:assert/strict';import fs from'node:fs';
const src=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8'),css=fs.readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
for(const marker of['Grade cartesiana','Grade isométrica','ISO_PRESETS','GridLayer','Espaçamento','Densidade visual adaptativa','Ajustar página','screenToWorld'])assert(src.includes(marker),`marker ausente: ${marker}`);
assert(css.includes('.gridLayer'));assert(css.includes('vector-effect:non-scaling-stroke'));console.log('SHELL_PHASE5_PASS=10');
