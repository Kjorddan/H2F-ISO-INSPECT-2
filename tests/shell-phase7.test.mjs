import assert from'node:assert/strict';import fs from'node:fs';
const src=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const checks=[
 ['polyline core import',src.includes("from'./editor-core/polyline.js'")],
 ['line tool',src.includes("'Linha'")],
 ['polyline renderer',src.includes('polylineEntity')&&src.includes('polylineToPath')],
 ['waypoint editing',src.includes("type:'waypoint'")&&src.includes('moveWaypoint')],
 ['segment editing',src.includes("type:'segment'")&&src.includes('moveSegment')],
 ['add waypoint',src.includes('addWaypointProjected')&&src.includes('onDoubleClick')],
 ['remove waypoint',src.includes('removeWaypoint')&&src.includes('e.altKey')],
 ['line drawing',src.includes('finishDraft')&&src.includes('draftPolyline')],
 ['selection integration',src.includes('selectionBounds(entities,selection.ids)')],
 ['styles',css.includes('.polylineEditing .waypoint')&&css.includes('.segmentHit')]
];
for(const[c,v]of checks){assert.ok(v,c);console.log('PASS',c)}console.log(`SHELL_PHASE7 ${checks.length}/10 PASS`);
