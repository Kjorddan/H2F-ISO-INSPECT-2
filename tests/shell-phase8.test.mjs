import assert from'node:assert/strict';import fs from'node:fs';
const src=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const selection=fs.readFileSync(new URL('../src/editor-core/selection.js',import.meta.url),'utf8');
const checks=[
 ['piping core import',src.includes("from'./editor-core/piping.js'")],
 ['semantic sample',src.includes("createPipeRun('PR-001'")&&src.includes('6\\"-P-04514-BC05')],
 ['pipe tool creates semantic run',src.includes("draft.kind==='pipe-run'")&&src.includes('createPipeRun(id,draft.points')],
 ['pipe renderer',src.includes('pipeRunEntity')&&src.includes('isLinearEntity(e)')],
 ['engineering panel',src.includes('Engenharia da tubulação')&&src.includes('Line Number')&&src.includes('Diâmetro nominal')],
 ['pipe segments visible',src.includes('PipeSegments')&&src.includes('pipeSegmentGraphicLength')],
 ['physical length explicitly independent',src.includes("físico {seg.physicalLength??'não definido'}")],
 ['semantic waypoint editing',src.includes('movePipeWaypoint')&&src.includes('removePipeWaypoint')&&src.includes('addPipeWaypointProjected')],
 ['semantic segment editing',src.includes('movePipeSegment')],
 ['selection handles pipe runs',selection.includes('isLinearEntity')&&selection.includes('transformPipeRun')],
 ['new pipe defaults',src.includes('Nova tubulação')&&src.includes('pipeDefaults')],
 ['engineering graph integrated',src.includes('createEngineeringGraph')&&src.includes('syncPipeRun')&&src.includes('graphStats')],
 ['topology readout',src.includes('Engineering Graph')&&src.includes('Topology edges')],
 ['phase styles',css.includes('.pipeRunEntity')&&css.includes('.engineeringPanel')&&css.includes('.topologyReadout')]
];
for(const[c,v]of checks){assert.ok(v,c);console.log('PASS',c)}console.log(`SHELL_PHASE8 ${checks.length}/14 PASS`);
