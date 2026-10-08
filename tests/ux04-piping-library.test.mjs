import assert from'node:assert/strict';
import{BUILTIN_SYMBOLS,getSymbol,defaultSymbolPorts,libraryStats}from'../src/editor-core/library.js';
import{createPipeRun,updatePipeVisualStyle,PIPE_LINE_STYLES,validatePipeRun}from'../src/editor-core/piping.js';
import{createEngineeringGraph,registerPipeRun,validateEngineeringGraph,areNodesConnected,graphStats}from'../src/editor-core/engineering-graph.js';
import{isInlineSymbol,isTeeSymbol,isBranchJunctionSymbol,isCrossSymbol,isTerminalSymbol,isAttachedBranchSymbol,insertInlineComponentTransaction,insertTeeBranchTransaction,insertCrossBranchTransaction,insertTerminalComponentTransaction,insertAttachedBranchTransaction}from'../src/editor-core/inline-components.js';

let n=0;const t=(name,fn)=>{fn();n++;console.log('PASS',name)};
const ids=cat=>new Set(BUILTIN_SYMBOLS.filter(s=>s.category===cat).map(s=>s.id));

t('catalog expanded to at least 110 industrial symbols',()=>assert.ok(BUILTIN_SYMBOLS.length>=110));
t('connections catalog includes required isometric families',()=>{for(const id of['elbow-90-lr','elbow-90-sr','bend','miter','tee-reducing','reducer-concentric','reducer-eccentric','swage','half-coupling','nipple','nipolet','branch-welded','branch-reinforced','spectacle-blind','spacer'])assert.ok(ids('CONEXÕES').has(id),id)});
t('flange catalog includes orifice and long welding neck',()=>{assert.ok(ids('FLANGES').has('flange-orifice'));assert.ok(ids('FLANGES').has('flange-long-wn'))});
t('valve catalog includes detailed check families and actuators',()=>{for(const id of['valve-swing-check','valve-lift-check','valve-dual-plate-check','valve-mov','valve-aov','valve-hydraulic','valve-manual'])assert.ok(ids('VÁLVULAS').has(id),id)});

t('equal and reducing tees have 3 ports',()=>{for(const id of['tee','tee-reducing'])assert.equal(defaultSymbolPorts(getSymbol(id),72,46).length,3,id)});
t('lateral has 3 ports and branch semantics',()=>{const s=getSymbol('lateral');assert.equal(defaultSymbolPorts(s,72,46).length,3);assert.equal(isBranchJunctionSymbol(s),true)});
t('cross has 4 ports and dedicated classifier',()=>{const s=getSymbol('cross');assert.equal(defaultSymbolPorts(s,72,46).length,4);assert.equal(isCrossSymbol(s),true);assert.equal(isInlineSymbol(s),false)});
t('terminal cap plug blind have one port',()=>{for(const id of['cap','plug','flange-blind'])assert.equal(defaultSymbolPorts(getSymbol(id),72,46).length,1,id)});
t('olet families are attached not inline',()=>{for(const id of['weldolet','sockolet','threadolet','nipolet','half-coupling','branch-welded','branch-reinforced']){const s=getSymbol(id);assert.equal(s.placement.attached,true,id);assert.equal(isInlineSymbol(s),false,id)}});
t('reducers and swage are valid two-port inline components',()=>{for(const id of['reducer','reducer-concentric','reducer-eccentric','swage']){const s=getSymbol(id);assert.equal(defaultSymbolPorts(s,72,46).length,2,id);assert.equal(isInlineSymbol(s),true,id)}});
t('line blind and spacer are two-port inline',()=>{for(const id of['spectacle-blind','spacer'])assert.equal(isInlineSymbol(getSymbol(id)),true,id)});
t('all flanges except blind expose correct inline behavior',()=>{for(const id of['flange-wn','flange-long-wn','flange-so','flange-sw','flange-lj','flange-threaded','flange-orifice','flange-pair'])assert.equal(isInlineSymbol(getSymbol(id)),true,id);assert.equal(isInlineSymbol(getSymbol('flange-blind')),false)});
t('all valve variants expose 2 ports inline',()=>{for(const s of BUILTIN_SYMBOLS.filter(x=>x.category==='VÁLVULAS')){assert.equal(defaultSymbolPorts(s,72,46).length,2,s.id);assert.equal(isInlineSymbol(s),true,s.id)}});

t('eight pipe visual styles available',()=>assert.deepEqual(Object.keys(PIPE_LINE_STYLES),['PROCESS','EXISTING','FUTURE','REMOVED','BURIED','JACKETED','INSULATED','BATTERY_LIMIT']));
t('pipe visual style is independent from engineering data',()=>{let r=createPipeRun('P1',[{x:0,y:0},{x:100,y:0}],{lineNumber:'4-P-100',nominalSize:'4"',schedule:'40'});const eng=structuredClone(r.engineering);r=updatePipeVisualStyle(r,'FUTURE');assert.deepEqual(r.engineering,eng);assert.equal(r.visualStyle.id,'FUTURE');assert.equal(validatePipeRun(r).valid,true)});
t('invalid style falls back to process',()=>{let r=createPipeRun('P2',[{x:0,y:0},{x:100,y:0}]);r=updatePipeVisualStyle(r,'NOT-A-STYLE');assert.equal(r.visualStyle.id,'PROCESS')});

const run=createPipeRun('MAIN',[{x:0,y:0},{x:100,y:0},{x:200,y:0}],{lineNumber:'6-P-100',visualStyle:'BURIED'});
let graph=createEngineeringGraph();graph=registerPipeRun(graph,run);

t('reducing tee transaction creates explicit 3-way topology and preserves style',()=>{
 const tx=insertTeeBranchTransaction({entities:[run],graph},{runId:'MAIN',segmentIndex:0,point:{x:50,y:0},symbol:getSymbol('tee-reducing'),componentId:'TR-1',leftRunId:'L1',rightRunId:'R1',branchRunId:'B1',branchEnd:{x:50,y:-100},branchEngineering:{nominalSize:'3"'}});
 assert.equal(tx.ok,true);assert.equal(Object.keys(tx.graph.connections).length,3);assert.equal(tx.graph.components['TR-1'].portIds.length,3);
 const br=tx.entities.find(x=>x.id==='B1');assert.equal(br.engineering.nominalSize,'3"');assert.equal(br.visualStyle.id,'BURIED');assert.equal(validateEngineeringGraph(tx.graph).valid,true);
});
t('lateral transaction creates three explicit connections',()=>{
 const tx=insertTeeBranchTransaction({entities:[run],graph},{runId:'MAIN',segmentIndex:1,point:{x:150,y:0},symbol:getSymbol('lateral'),componentId:'LAT-1',leftRunId:'L2',rightRunId:'R2',branchRunId:'B2',branchEnd:{x:220,y:-70}});
 assert.equal(tx.ok,true);assert.equal(Object.keys(tx.graph.connections).length,3);assert.equal(tx.graph.components['LAT-1'].portIds.length,3);assert.equal(validateEngineeringGraph(tx.graph).valid,true);
});
t('cross transaction creates four explicit connections and two branches',()=>{
 const tx=insertCrossBranchTransaction({entities:[run],graph},{runId:'MAIN',segmentIndex:1,point:{x:150,y:0},symbol:getSymbol('cross'),componentId:'X-1',leftRunId:'XL',rightRunId:'XR',branchRunIdA:'XA',branchRunIdB:'XB',branchEndA:{x:150,y:-100},branchEndB:{x:150,y:100}});
 assert.equal(tx.ok,true);assert.equal(Object.keys(tx.graph.connections).length,4);assert.equal(tx.graph.components['X-1'].portIds.length,4);assert.ok(tx.entities.some(e=>e.id==='XA'));assert.ok(tx.entities.some(e=>e.id==='XB'));assert.equal(validateEngineeringGraph(tx.graph).valid,true);
 assert.ok(areNodesConnected(tx.graph,'XL-V001','XA-V002'));assert.ok(areNodesConnected(tx.graph,'XR-V002','XB-V002'));
});
t('ordinary flange remains inline transaction compatible',()=>{
 const tx=insertInlineComponentTransaction({entities:[run],graph},{runId:'MAIN',segmentIndex:0,point:{x:40,y:0},symbol:getSymbol('flange-orifice'),componentId:'FO-1',leftRunId:'FL',rightRunId:'FR'});
 assert.equal(tx.ok,true);assert.equal(tx.graph.components['FO-1'].portIds.length,2);assert.equal(Object.keys(tx.graph.connections).length,2);
});
t('blind flange terminal transaction connects only to pipe endpoint',()=>{
 const s=getSymbol('flange-blind');assert.equal(isTerminalSymbol(s),true);
 const tx=insertTerminalComponentTransaction({entities:[run],graph},{runId:'MAIN',side:'END',symbol:s,componentId:'FB-END'});
 assert.equal(tx.ok,true);assert.equal(tx.graph.components['FB-END'].portIds.length,1);assert.equal(Object.keys(tx.graph.connections).length,1);assert.ok(areNodesConnected(tx.graph,'MAIN-V001','FB-END-NODE'));assert.equal(validateEngineeringGraph(tx.graph).valid,true);
});
t('weldolet attachment preserves host run and creates branch topology',()=>{
 const s=getSymbol('weldolet');assert.equal(isAttachedBranchSymbol(s),true);
 const tx=insertAttachedBranchTransaction({entities:[run],graph},{runId:'MAIN',segmentIndex:0,point:{x:50,y:4},symbol:s,componentId:'WOL-1',branchRunId:'WOL-BR',branchEnd:{x:50,y:-100},branchEngineering:{nominalSize:'2"'}});
 assert.equal(tx.ok,true);assert.equal(tx.entities.filter(e=>e.id==='MAIN').length,1);assert.equal(graphStats(tx.graph).attachments,1);assert.equal(Object.keys(tx.graph.connections).length,1);assert.ok(areNodesConnected(tx.graph,'MAIN-V001','WOL-BR-V002'));assert.equal(validateEngineeringGraph(tx.graph).valid,true);
});
t('blind flange is rejected by generic inline transaction',()=>{
 const tx=insertInlineComponentTransaction({entities:[run],graph},{runId:'MAIN',segmentIndex:0,point:{x:40,y:0},symbol:getSymbol('flange-blind'),componentId:'FB-1'});
 assert.equal(tx.ok,false);assert.equal(tx.rolledBack,true);
});
t('library stats reflect expanded catalog',()=>{const s=libraryStats();assert.ok(s.symbols>=110);assert.ok(s.inline>=30);assert.ok(s.junction>=4)});

console.log(`UX-04 Piping Library: ${n}/${n} PASS`);
