import fs from 'node:fs'; import assert from 'node:assert/strict';
const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const checks=[
 ['fase27 core no pacote',pkg.scripts.test.includes('quality-hardening.test.mjs')],
 ['shell mantém autosave',main.includes('syncStatus') || main.includes('Salvo')],
 ['shell mantém PWA/offline',main.includes('offline') || main.includes('Offline')],
 ['shell mantém exportação',main.includes('export') || main.includes('Export')],
 ['shell mantém recuperação',main.includes('recovery') || main.includes('recuper')],
 ['editor permanece núcleo',main.includes('canvas') || main.includes('svg') || main.includes('workspace')]
];
for(const [n,v] of checks){assert.equal(v,true,n);console.log(`PASS ${n}`)}
console.log('SHELL_PHASE27_TESTS 6/6');
