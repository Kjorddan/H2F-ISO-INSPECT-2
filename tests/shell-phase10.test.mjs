import assert from'node:assert/strict';import fs from'node:fs';
const src=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8'),css=fs.readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const checks=[
 ['import library core',src.includes("from'./editor-core/library.js'")],
 ['painel Biblioteca industrial',src.includes('Biblioteca industrial')],
 ['busca nome/categoria/sigla/TAG',src.includes('Nome, categoria, sigla ou TAG')],
 ['favoritos',src.includes('toggleFavorite')&&src.includes('FAVORITOS')],
 ['recentes',src.includes('pushRecent')&&src.includes('Recentes')],
 ['drag/drop',src.includes('onDragStart')&&src.includes('onDrop={dropSymbol}')],
 ['inserção por clique',src.includes('symbolPlacement')&&src.includes('insertLibrarySymbol')],
 ['duplo clique insere centro',src.includes('onDoubleClick')&&src.includes('PAPER.width/2')],
 ['renderização industrial',src.includes('industrialSymbol')&&src.includes('SymbolGlyph')],
 ['TAG editável',src.includes('Símbolo industrial')&&src.includes('TAG<input')],
 ['categorias do core',src.includes('LIBRARY_CATEGORIES.map')],
 ['editor customizado',src.includes('Editor de símbolo')&&src.includes('SYMBOL_PRIMITIVES.map')],
 ['escopos customizados',src.includes('LIBRARY_SCOPES.map')],
 ['import/export custom',src.includes('importCustomLibrary')&&src.includes('exportCustomLibrary')],
 ['versionamento custom',src.includes('versionCustomSymbol')],
 ['connection points custom',src.includes('addCustomConnectionPoint')],
 ['CSS biblioteca',css.includes('FASE 10 — biblioteca industrial')&&css.includes('.symbolGrid')]
];for(const[c,ok]of checks){assert.ok(ok,c);console.log('PASS',c)}console.log(`Shell Fase 10: ${checks.length}/${checks.length} PASS`);
