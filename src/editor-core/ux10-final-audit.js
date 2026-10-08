import{createRevisionSnapshot,revisionPayload,sha256}from'./document-structure.js';
import{validateInspectionStore}from'./inspection.js';
import{validateEvidenceStore}from'./evidence-integrity.js';
import{validateIntegrityStore}from'./integrity.js';
import{validateEngineeringGraph}from'./engineering-graph.js';
import{validateUx06Markers}from'./ux06-markers.js';
import{ux08ValidateSheet,ux08Layout}from'./ux08-sheet-layout.js';
import{ux09BuildPlan}from'./ux09-print-plan.js';
export const UX10_RELEASE_SCHEMA='h2f-controlled-release/v2';
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
export const ux10ReleaseContext=(x={})=>({
 inspectionStore:x.inspectionStore||{points:[],measurements:[],welds:[],ndt:[]},
 evidenceStore:x.evidenceStore||{},
 integrityStore:x.integrityStore||{},
 underlays:x.underlays||[],
 traceState:x.traceState||{},
 customSymbols:x.customSymbols||[]
});
export function ux10ReleasePayload(document,entities=[],context={}){
 if(!document?.sheets?.length||!Array.isArray(entities))throw Error('Documento inválido para integridade UX-10');
 return JSON.stringify(canonical({schema:UX10_RELEASE_SCHEMA,documentRevisionPayload:revisionPayload(document,entities),auxiliary:ux10ReleaseContext(context)}));
}
export const ux10ReleaseHash=async(document,entities=[],context={})=>sha256(ux10ReleasePayload(document,entities,context));
export async function ux10CreateFormalSnapshot(document,entities=[],context={},meta={}){
 const base=await createRevisionSnapshot(document,entities,meta);
 return Object.freeze({...base,ux10ReleaseSchema:UX10_RELEASE_SCHEMA,ux10ReleaseSha256:await ux10ReleaseHash(document,entities,context)});
}
export const ux10EvidenceIsArchived=e=>e?.kind==='LINK'||(typeof e?.sourceRef==='string'&&e.sourceRef.startsWith('data:')&&/^[a-f0-9]{64}$/.test(String(e.sha256||'')));
export async function ux10VerifyFormalSnapshot(document,entities=[],context={}){
 const missing=(context.evidenceStore?.evidence||[]).filter(e=>!ux10EvidenceIsArchived(e));
 if(missing.length)return{allowed:false,reason:missing.length+' evidência(s) sem conteúdo arquivado e SHA-256; reinsira os arquivos antes da emissão'};
 const latest=document?.revisions?.at(-1);
 if(!['APROVADO','AS BUILT'].includes(document?.revisionState))return{allowed:false,reason:'Revisão deve estar APROVADO ou AS BUILT'};
 if(!latest?.immutable||!latest.sha256)return{allowed:false,reason:'Snapshot formal imutável necessário'};
 if(!latest.ux10ReleaseSha256||latest.ux10ReleaseSchema!==UX10_RELEASE_SCHEMA)return{allowed:false,reason:'Snapshot legado sem integridade END/evidências: crie nova revisão formal UX-10'};
 if(latest.state!==document.revisionState)return{allowed:false,reason:'O estado atual não corresponde ao snapshot'};
 const [base,extended]=await Promise.all([sha256(revisionPayload(document,entities)),ux10ReleaseHash(document,entities,context)]);
 if(base!==latest.sha256)return{allowed:false,reason:'Geometria ou documento mudou após aprovação'};
 if(extended!==latest.ux10ReleaseSha256)return{allowed:false,reason:'Dados de END, evidências ou anexos mudaram após aprovação'};
 return{allowed:true,digest:extended,baseDigest:base,state:latest.state,revision:latest.revision,snapshotId:latest.id};
}
export function ux10AuditIntegrated({document,entities=[],graph=null,inspectionStore={},evidenceStore=null,integrityStore=null,customSymbols=[],emissionLog=[]}={}){
 const findings=[],add=(severity,code,description)=>findings.push({severity,code,description});
 if(!document?.sheets?.length){add('BLOCKER','DOCUMENT_INVALID','Documento sem folhas');return{status:'BLOCKED',findings}}
 const ids=new Set(),sheetIds=new Set(document.sheets.map(s=>s.id));
 for(const e of entities){
  if(!e.id||ids.has(e.id))add('BLOCKER','ENTITY_DUPLICATE_ID',String(e.id));
  ids.add(e.id);
  if(e.category==='SÍMBOLOS DE FOLHA'&&!sheetIds.has(e.ux06?.sheetId||e.sheetId))add('BLOCKER','EDITORIAL_ORPHAN',String(e.id));
  if(e.mount&&graph&&!Object.values(graph.mounts||{}).some(m=>m.componentId===e.id&&m.segmentId===e.mount.segmentId))add('BLOCKER','MOUNT_ORPHAN',String(e.id));
 }
 for(const s of document.sheets){const x=ux08ValidateSheet(s);if(!x.valid)add('BLOCKER','SHEET_INVALID',s.name+': '+x.errors.join(','));const layout=ux08Layout(s);if(layout.tables.some(t=>t.visible!==false&&t.anchor==='BOTTOM_RIGHT'&&layout.titleBlock.visible))add('WARNING','TABLE_OVER_TITLE',s.name)}
 if(inspectionStore?.points&&inspectionStore?.measurements&&inspectionStore?.welds&&inspectionStore?.ndt){
  for(const item of validateInspectionStore(inspectionStore))add('BLOCKER','INSPECTION_'+item.code,item.id);
  if(graph){for(const item of validateUx06Markers(entities,graph,inspectionStore).issues)add('BLOCKER',item.code,item.id)}
 }
 if(evidenceStore?.evidence&&evidenceStore?.photoOverlays&&evidenceStore?.anomalies&&evidenceStore?.recommendations){for(const item of validateEvidenceStore(evidenceStore))add('BLOCKER','EVIDENCE_'+item.code,item.id)}
 if(evidenceStore?.evidence){for(const e of evidenceStore.evidence)if(!ux10EvidenceIsArchived(e))add('BLOCKER','EVIDENCE_UNARCHIVED',String(e.id))}
 if(integrityStore?.assessments&&integrityStore?.damageCatalogs){for(const item of validateIntegrityStore(integrityStore))add('BLOCKER','INTEGRITY_'+item.code,item.id)}
 if(graph){for(const item of validateEngineeringGraph(graph).issues.filter(i=>i.severity==='ERROR'))add('BLOCKER','GRAPH_'+item.code,item.entityId);
 for(const edge of Object.values(graph.edges||{}))if(!graph.runs?.[edge.runId])add('BLOCKER','EDGE_ORPHAN',edge.id);
  for(const mount of Object.values(graph.mounts||{}))if(!graph.edges?.[mount.segmentId])add('BLOCKER','MOUNT_SEGMENT_ORPHAN',mount.id)}
 const cids=new Set();for(const c of customSymbols){if(cids.has(c.id))add('BLOCKER','CUSTOM_ID_COLLISION',c.id);cids.add(c.id)}
 for(const log of emissionLog)if(log.state==='ASSINADO'||log.state==='IMPRESSO')add('WARNING','UNVERIFIED_DELIVERY_STATE',log.id);
 try{const plan=ux09BuildPlan({document,entities,inspection:inspectionStore});for(const w of plan.warnings)add('WARNING','PRINT_PREFLIGHT',w)}catch(e){add('BLOCKER','PRINT_PLAN_INVALID',e.message)}
 const blockers=findings.filter(f=>f.severity==='BLOCKER').length;
 return{status:blockers?'BLOCKED':findings.length?'REVIEW_REQUIRED':'PASS',blockers,warnings:findings.length-blockers,findings,entityCount:entities.length,sheetCount:document.sheets.length};
}
