import assert from'node:assert/strict';
import{
 LIBRARY_SCHEMA_VERSION,LIBRARY_CATEGORIES,USAGE_CONTEXTS,PLACEMENT_MODES,NORMATIVE_STATUS,
 BUILTIN_SYMBOLS,validateLibrary,validateSymbolDefinition,buildLibraryValidationMatrix,
 defaultSymbolPorts,getSymbol,searchLibrary,libraryStats,createSymbolEntity,
 createCustomSymbol,exportCustomLibrary,importCustomLibrary
}from'../src/editor-core/library.js';
import{isInlineSymbol,isTeeSymbol}from'../src/editor-core/inline-components.js';

let n=0;const t=(name,fn)=>{fn();n++;console.log('PASS',name)};

t('schema version 2',()=>assert.equal(LIBRARY_SCHEMA_VERSION,2));
t('vocabularies are closed',()=>{assert.ok(USAGE_CONTEXTS.includes('ISOMETRIC'));assert.ok(PLACEMENT_MODES.includes('INLINE'));assert.ok(NORMATIVE_STATUS.includes('REFERENCE_GUIDED'))});
t('all 86 built-ins validate in schema v2',()=>{const r=validateLibrary();assert.equal(r.valid,true,JSON.stringify(r.issues));assert.equal(r.count,86);assert.equal(r.schemaVersion,2)});
t('every built-in carries required industrial metadata',()=>{for(const s of BUILTIN_SYMBOLS){assert.equal(s.schemaVersion,2,s.id);assert.ok(s.subcategory,s.id);assert.ok(s.description,s.id);assert.ok(s.usageContexts.length,s.id);assert.ok(Array.isArray(s.technicalReferences),s.id);assert.ok(s.provenance?.status,s.id);assert.ok(s.placement?.modes?.length,s.id);assert.equal(typeof s.snapPolicy?.grid,'boolean',s.id);assert.ok(Array.isArray(s.portDefinitions),s.id)}});
t('matrix covers entire catalog',()=>{const m=buildLibraryValidationMatrix();assert.equal(m.length,86);assert.equal(new Set(m.map(x=>x.id)).size,86);assert.ok(m.every(x=>Array.isArray(x.technicalReferences)))});
t('tee has 3 explicit semantic ports',()=>{const p=defaultSymbolPorts(getSymbol('tee'),72,46);assert.equal(p.length,3);assert.deepEqual(p.map(x=>x.role),['main-in','main-out','branch'])});
t('cross has 4 ports and is junction not generic inline',()=>{const s=getSymbol('cross');assert.equal(defaultSymbolPorts(s,72,46).length,4);assert.equal(s.placement.junction,true);assert.equal(isInlineSymbol(s),false)});
t('terminal fittings expose one port',()=>{for(const id of['cap','plug','flange-blind']){const s=getSymbol(id);assert.equal(defaultSymbolPorts(s,72,46).length,1,id);assert.equal(s.placement.terminal,true,id);assert.equal(isInlineSymbol(s),false,id)}});
t('olets are attached branch outlets not generic inline splitters',()=>{for(const id of['weldolet','sockolet','threadolet','olet-generic']){const s=getSymbol(id);assert.equal(s.placement.attached,true,id);assert.equal(defaultSymbolPorts(s,72,46).length,2,id);assert.equal(isInlineSymbol(s),false,id)}});
t('valve remains two-port inline',()=>{const s=getSymbol('valve-gate');assert.equal(defaultSymbolPorts(s,72,46).length,2);assert.equal(s.placement.inline,true);assert.equal(isInlineSymbol(s),true)});
t('tee keeps specialized transaction classification',()=>{assert.equal(isTeeSymbol(getSymbol('tee')),true);assert.equal(isInlineSymbol(getSymbol('tee')),false)});
t('instrument remains attached without invented process port',()=>{const s=getSymbol('inst-pi');assert.equal(s.placement.attached,true);assert.equal(defaultSymbolPorts(s,72,46).length,0)});
t('equipment nozzle has one equipment port',()=>{const p=defaultSymbolPorts(getSymbol('equip-nozzle'),72,46);assert.equal(p.length,1);assert.equal(p[0].role,'equipment')});
t('search indexes description context subcategory and references',()=>{assert.ok(searchLibrary(BUILTIN_SYMBOLS,{query:'API RP 574'}).some(s=>s.category==='INSPEÇÃO'));assert.ok(searchLibrary(BUILTIN_SYMBOLS,{query:'branch outlet'}).some(s=>s.id==='weldolet'))});
t('entity inherits library placement and snap policy',()=>{const e=createSymbolEntity('valve-gate',{x:100,y:100});assert.equal(e.libraryMeta.schemaVersion,2);assert.equal(e.placement.inline,true);assert.equal(e.snapPolicy.ports,true);assert.equal(e.ports.length,2)});
t('stats expose contexts and topology classes',()=>{const s=libraryStats();assert.equal(s.symbols,86);assert.ok(s.byContext.ISOMETRIC>0);assert.ok(s.inline>0);assert.ok(s.junction>=3);assert.ok(s.terminal>=3)});
t('validator rejects malformed inline metadata',()=>{const bad={...getSymbol('valve-gate'),portDefinitions:[{id:'P1',u:0,v:.5,role:'process'}]};const r=validateSymbolDefinition(bad);assert.equal(r.valid,false);assert.ok(r.issues.includes('inline-port-count'))});
t('custom library exports schema v2',()=>{const s=createCustomSymbol({id:'ux03-custom',name:'UX03 custom'});const raw=JSON.parse(exportCustomLibrary([s]));assert.equal(raw.schemaVersion,2);assert.equal(importCustomLibrary(JSON.stringify(raw))[0].schemaVersion,2)});
t('legacy custom library v1 migrates without data loss',()=>{const legacy={format:'h2f-symbol-library',schemaVersion:1,symbols:[{id:'legacy',name:'Legacy',category:'ANOTAÇÕES',scope:'USER',acronym:'LEG',primitives:[],connectionPoints:[],version:1}]};const s=importCustomLibrary(JSON.stringify(legacy))[0];assert.equal(s.id,'legacy');assert.equal(s.schemaVersion,2);assert.deepEqual(s.usageContexts,['ISOMETRIC']);assert.equal(s.normativeStatus,'PROJECT_DEFINED')});
t('all categories remain present',()=>{for(const c of LIBRARY_CATEGORIES)assert.ok(BUILTIN_SYMBOLS.some(s=>s.category===c),c)});

console.log(`UX-03 Library Schema: ${n}/${n} PASS`);
