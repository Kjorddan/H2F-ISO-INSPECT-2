import assert from 'node:assert/strict';
import{BUILTIN_SYMBOLS,libraryStats,validateLibrary,getSymbol,defaultSymbolPorts,createSymbolEntityFrom}from'../src/editor-core/library.js';
import{createPipeRun}from'../src/editor-core/piping.js';
import{createEngineeringGraph,registerPipeRun,validateEngineeringGraph,graphStats,graphMountStats,areNodesConnected,syncPipeRun,unregisterComponent}from'../src/editor-core/engineering-graph.js';
import{isInlineSymbol}from'../src/editor-core/inline-components.js';
import{collectEntitySnapCandidates,SNAP_TYPES}from'../src/editor-core/snap.js';
import{instrumentTagLayout}from'../src/editor-core/ux05-geometry.js';
import{isMountableSymbol,addUx05SymbolTransaction,connectPipeEndpointToEquipmentNozzleTransaction,equipmentNozzleCandidates,syncMountedSymbolPositions,configureEquipmentNozzlesTransaction,nextEquipmentNozzle}from'../src/editor-core/ux05-associations.js';

let passed=0;function t(name,fn){fn();passed++;console.log('PASS',name)}
const ids=c=>new Set(BUILTIN_SYMBOLS.filter(s=>s.category===c).map(s=>s.id));
const baseRun=createPipeRun('UX05-RUN',[{x:0,y:20},{x:100,y:20}],{lineNumber:'6-P-101'});
const initial=()=>({entities:[baseRun],graph:registerPipeRun(createEngineeringGraph(),baseRun)});
t('catálogo UX-05 amplia baseline UX-04 sem remoções',()=>{const s=libraryStats();assert.equal(s.symbols,173);assert.equal(s.byCategory['INSTRUMENTAÇÃO'],34);assert.equal(s.byCategory['SUPORTES'],29);assert.equal(s.byCategory['EQUIPAMENTOS'],30)});
t('matriz UX-03 permanece 100% válida',()=>assert.equal(validateLibrary().valid,true));
t('suportes mínimos diferentes registrados',()=>{for(const id of ['support-rest','support-shoe','support-sliding-shoe','support-guide','support-line-stop','support-anchor','support-trunnion','support-dummy-leg','support-stanchion','support-hanger','support-rod-hanger','support-clevis-hanger','support-u-bolt','support-clamp','support-saddle','support-trapeze','support-sway-brace','support-snubber','support-spring','support-variable-spring','support-constant-spring','support-structure','support-rack','support-sleeper','support-special'])assert.ok(ids('SUPORTES').has(id),id)});
t('suportes não possuem port de processo e não são inline',()=>{for(const s of BUILTIN_SYMBOLS.filter(x=>x.category==='SUPORTES')){assert.equal(s.portDefinitions.length,0,s.id);assert.equal(isInlineSymbol(s),false,s.id);assert.equal(s.placement.attached,true,s.id)}});
t('instrumentos P&ID-only não fingem representação isométrica',()=>{for(const id of ['inst-dcs','inst-plc','inst-panel-indicator','inst-switch','inst-analyzer','inst-pid-control-valve']){const s=getSymbol(id);assert.deepEqual(s.usageContexts,['P&ID'],id);assert.equal(s.placement.attached,false,id);assert.equal(s.portDefinitions.length,0,id)}});
t('instrumentação física separada de PID com attachment não condutor',()=>{for(const id of ['inst-pressure-gauge','inst-temperature-gauge','inst-thermowell','inst-instrument-tap']){const s=getSymbol(id);assert.deepEqual(s.usageContexts,['ISOMETRIC']);assert.equal(isMountableSymbol(s),true);assert.equal(s.portDefinitions.length,0)}});
t('elementos primários realmente inline têm duas portas',()=>{for(const id of ['inst-flow-element','inst-orifice-plate','inst-restriction-orifice']){const s=getSymbol(id);assert.equal(defaultSymbolPorts(s,72,46).length,2,id);assert.equal(isInlineSymbol(s),true,id)}});
t('suporte montado preserva PipeRun e não cria conectividade de processo',()=>{const tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('support-trunnion'),point:{x:40,y:20},id:'SUP-1',runId:'UX05-RUN',segmentIndex:0});assert.equal(tx.ok,true);assert.equal(graphMountStats(tx.graph).mounts,1);assert.equal(graphStats(tx.graph).connections,0);assert.equal(graphStats(tx.graph).pipeEdges,1);assert.equal(tx.graph.components['SUP-1'].portIds.length,0);assert.equal(areNodesConnected(tx.graph,'SUP-1-NODE','UX05-RUN-V001'),false);assert.equal(validateEngineeringGraph(tx.graph).valid,true)});
t('associação acompanha movimento geométrico por t estável',()=>{const tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('support-shoe'),point:{x:40,y:20},id:'SUP-MOVE',runId:'UX05-RUN',segmentIndex:0});const moved={...baseRun,points:[{x:0,y:80},{x:100,y:80}]};const positions=syncMountedSymbolPositions([moved,...tx.entities.filter(x=>x.kind==='industrial-symbol')]);const attached=positions.find(e=>e.id==='SUP-MOVE');assert.equal(attached.y+attached.height/2,80);const graph=syncPipeRun(tx.graph,moved);assert.equal(graphMountStats(graph).mounts,1);assert.equal(validateEngineeringGraph(graph).valid,true)});
t('vínculo de instrumento físico é mecânico, não ligação de fluido',()=>{const tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('inst-pressure-gauge'),point:{x:44,y:20},id:'PI-1',runId:'UX05-RUN',segmentIndex:0});assert.equal(tx.ok,true);assert.equal(tx.graph.mounts['MNT-PI-1'].kind,'INSTRUMENT_TAP');assert.equal(graphStats(tx.graph).connections,0);assert.equal(areNodesConnected(tx.graph,'PI-1-NODE','UX05-RUN-V001'),false)});
t('instrumento P&ID não pode ser anexado ao processo por engano',()=>{const tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('inst-dcs'),point:{x:50,y:20},id:'DCS-1',runId:'UX05-RUN',segmentIndex:0});assert.equal(tx.ok,false);assert.equal(tx.rolledBack,true)});
t('famílias mínimas de equipamentos presentes',()=>{for(const id of ['equip-vessel-vertical','equip-vessel-horizontal','equip-column','equip-tower','equip-drum','equip-separator','equip-reactor','equip-tank','equip-exchanger-horizontal','equip-exchanger-vertical','equip-air-cooler','equip-pump-centrifugal','equip-pump-reciprocating','equip-compressor','equip-blower','equip-filter','equip-strainer','equip-furnace','equip-heater','equip-boiler','equip-skid','equip-package','equip-mixer','equip-cyclone','equip-ejector'])assert.ok(ids('EQUIPAMENTOS').has(id),id)});
t('bocais são específicos e não dois genéricos universais',()=>{assert.equal(getSymbol('equip-vessel-vertical').portDefinitions.length,3);assert.equal(getSymbol('equip-vessel-horizontal').portDefinitions.length,4);assert.equal(getSymbol('equip-generic').portDefinitions.length,0);assert.equal(getSymbol('equip-pump-centrifugal').portDefinitions.length,2)});
t('equipamento registra bocais físicos no Engineering Graph',()=>{const tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('equip-vessel-vertical'),point:{x:160,y:20},id:'V-101'});assert.equal(tx.ok,true);assert.equal(tx.graph.components['V-101'].portIds.length,3);assert.equal(tx.graph.ports['V-101-PORT-N1'].role,'equipment-nozzle');assert.equal(validateEngineeringGraph(tx.graph).valid,true)});
t('conexão de bocal exige comando explícito e é transacional',()=>{const tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('equip-pump-centrifugal'),point:{x:136,y:20},id:'P-101'});assert.equal(graphStats(tx.graph).connections,0);const linked=connectPipeEndpointToEquipmentNozzleTransaction(tx,{runId:'UX05-RUN',side:'END',equipmentId:'P-101',nozzleId:'N1'});assert.equal(linked.ok,true);assert.equal(graphStats(linked.graph).connections,1);assert.equal(areNodesConnected(linked.graph,'P-101-NODE','UX05-RUN-V001'),true);assert.equal(validateEngineeringGraph(linked.graph).valid,true);const dup=connectPipeEndpointToEquipmentNozzleTransaction(linked,{runId:'UX05-RUN',side:'END',equipmentId:'P-101',nozzleId:'N1'});assert.equal(dup.ok,false);assert.equal(graphStats(dup.graph).connections,1)});
t('candidatos de nozzle respeitam geometria e não conectam por proximidade',()=>{const tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('equip-pump-centrifugal'),point:{x:136,y:20},id:'P-101'});const list=equipmentNozzleCandidates(tx.entities.at(-1),tx.entities,tx.graph,8);assert.equal(list[0]?.nozzleId,'N1');assert.equal(list[0]?.side,'END');assert.equal(graphStats(tx.graph).connections,0)});
t('remover componente desmonta o suporte sem órfãos',()=>{let tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('support-sleeper'),point:{x:40,y:20},id:'SUP-REMOVE',runId:'UX05-RUN',segmentIndex:0});const g=unregisterComponent(tx.graph,'SUP-REMOVE');assert.equal(graphMountStats(g).mounts,0);assert.equal(validateEngineeringGraph(g).valid,true)});
t('TAG grande é dividido e cabe no balão',()=>{for(const text of ['PT','PT-101','PIT-2026-A-PRIMARY']){const l=instrumentTagLayout(text,36);assert.ok(l.lines.length<=2);assert.ok(l.fontSize>=5&&l.fontSize<=10);assert.ok(l.lines.every(s=>s.length>0))}});
t('snap detecta nozzles físicos mesmo após rotação',()=>{
 const tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('equip-pump-centrifugal'),point:{x:136,y:20},id:'P-SNAP'});
 const list=collectEntitySnapCandidates(tx.entities).filter(p=>p.type===SNAP_TYPES.PORT&&p.entityId==='P-SNAP');
 assert.equal(list.length,2);assert.deepEqual(list.find(p=>p.nozzleId==='N1').point,{x:100,y:20});
 const rotated=tx.entities.map(e=>e.id==='P-SNAP'?{...e,rotation:90}:e);
 const list90=collectEntitySnapCandidates(rotated).filter(p=>p.type===SNAP_TYPES.PORT&&p.entityId==='P-SNAP');
 assert.ok(Math.abs(list90.find(p=>p.nozzleId==='N1').point.x-136)<1e-8);
 assert.ok(Math.abs(list90.find(p=>p.nozzleId==='N1').point.y+16)<1e-8);
});
t('usuário configura bocais e metadados mantendo grafo coerente',()=>{
 const tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('equip-vessel-vertical'),point:{x:160,y:20},id:'V-CONF'});
 const added=configureEquipmentNozzlesTransaction(tx,{equipmentId:'V-CONF',nozzles:[...tx.entities.at(-1).ports,nextEquipmentNozzle(tx.entities.at(-1))]});
 assert.equal(added.ok,true);assert.equal(added.graph.components['V-CONF'].portIds.length,4);
 assert.equal(added.entities.at(-1).symbolDefinition.nozzleTemplate,'UX05_USER_CONFIGURED');
 assert.equal(validateEngineeringGraph(added.graph).valid,true);
 const removed=configureEquipmentNozzlesTransaction(added,{equipmentId:'V-CONF',nozzles:added.entities.at(-1).ports.slice(0,3)});
 assert.equal(removed.ok,true);assert.equal(removed.graph.components['V-CONF'].portIds.length,3);
});
t('remoção de bocal conectado é recusada atomicamente',()=>{
 let tx=addUx05SymbolTransaction(initial(),{symbol:getSymbol('equip-pump-centrifugal'),point:{x:136,y:20},id:'P-CFG'});
 let linked=connectPipeEndpointToEquipmentNozzleTransaction(tx,{runId:'UX05-RUN',side:'END',equipmentId:'P-CFG',nozzleId:'N1'});
 const bad=configureEquipmentNozzlesTransaction(linked,{equipmentId:'P-CFG',nozzles:linked.entities.at(-1).ports.filter(p=>p.id!=='N1')});
 assert.equal(bad.ok,false);assert.equal(bad.rolledBack,true);
 assert.equal(graphStats(bad.graph).connections,1);assert.equal(validateEngineeringGraph(bad.graph).valid,true);
});
console.log(`UX-05 Instrument Support Equipment: ${passed}/${passed} PASS`);
