import{sha256}from'./document-structure.js';
export const SCHEMA_VERSION='2.0.0';
export const IMPORT_FORMATS=['H2FISO','JSON','SVG','PDF','PNG','JPG','DXF'];
export const EXPORT_FORMATS=['PDF','SVG','PNG','JSON','CSV','H2FISO'];
const clone=x=>JSON.parse(JSON.stringify(x));
export async function createNativePackage(document,{assets=[],thumbnails=[],metadata={}}={}){
  const payload=clone(document||{}); const manifest={format:'h2fiso',schemaVersion:SCHEMA_VERSION,documentId:payload.id||null,assets:assets.map(x=>x.name||x.id),thumbnails:thumbnails.map(x=>x.name||x.id)};
  manifest.documentSha256=await sha256(JSON.stringify(payload));
  return {manifest,'document.json':payload,assets:clone(assets),thumbnails:clone(thumbnails),metadata:clone(metadata)};
}
export function validateNativePackage(pkg){
  if(!pkg?.manifest||pkg.manifest.format!=='h2fiso') throw Error('Pacote .h2fiso inválido');
  if(!pkg.manifest.schemaVersion) throw Error('schemaVersion obrigatório');
  if(!pkg['document.json']) throw Error('document.json obrigatório'); return true;
}
export async function validateNativePackageIntegrity(pkg){
 validateNativePackage(pkg);
 const expected=pkg.manifest?.documentSha256;
 if(!/^[a-f0-9]{64}$/.test(String(expected||'')))throw Error('Arquivo .h2fiso sem hash documental SHA-256 válido');
 const actual=await sha256(JSON.stringify(pkg['document.json']));
 if(actual!==expected)throw Error('Integridade .h2fiso comprometida: documento difere do manifesto');
 return true;
}
export function migrateDocument(doc,fromVersion,toVersion=SCHEMA_VERSION){
  if(!fromVersion) throw Error('versão de origem obrigatória');
  const out=clone(doc); out.schemaVersion=toVersion; out.migration={from:fromVersion,to:toVersion}; return out;
}
export function importPlan(format){
  const f=String(format).toUpperCase(); if(!IMPORT_FORMATS.includes(f)) throw Error('formato de importação não suportado');
  return {format:f,mode:['H2FISO','JSON'].includes(f)?'NATIVE_OR_STRUCTURED':['SVG','DXF'].includes(f)?'VECTOR_INTEROP':'UNDERLAY_OR_ANALYSIS',editableDirectly:['H2FISO','JSON'].includes(f)};
}
export function exportPlan(format,{vectorPreferred=true}={}){
  const f=String(format).toUpperCase(); if(!EXPORT_FORMATS.includes(f)) throw Error('formato de exportação não suportado');
  return {format:f,vectorPreferred:f==='PDF'?vectorPreferred:['SVG'].includes(f),preserve:f==='PDF'?['lines','texts','symbols','titleBlock']:[]};
}
export function createPrintSettings({paper='A4',orientation='LANDSCAPE',marginsMm=10,fit='FIT_PAGE',area='CURRENT_SHEET',sheetIds=[]}={}){
  if(!['PORTRAIT','LANDSCAPE'].includes(orientation)) throw Error('orientação inválida');
  if(!['FIT_PAGE','ACTUAL_SIZE','CUSTOM'].includes(fit)) throw Error('fit inválido');
  if(!['CURRENT_SHEET','ALL_SHEETS','SELECTION','CUSTOM_AREA'].includes(area)) throw Error('área inválida');
  return {paper,orientation,marginsMm,fit,area,sheetIds:[...sheetIds],preview:true};
}
export function createReportModel({document,inspection={},integrity={},evidence={}}={}){
  return {kind:'h2f-report',documentId:document?.id||null,title:document?.title||'Relatório H2F ISO INSPECT',sections:{document:{sheets:document?.sheets?.length||0},inspection:{tml:inspection.tmls?.length||0,cml:inspection.cmls?.length||0,welds:inspection.welds?.length||0,ndt:inspection.ndt?.length||0},integrity:{circuits:integrity.circuits?.length||0,damageAssessments:integrity.assessments?.length||0},evidence:{items:evidence.evidences?.length||0,anomalies:evidence.anomalies?.length||0,recommendations:evidence.recommendations?.length||0}}};
}
export function reportToCsv(report){
  const rows=[['section','metric','value']]; for(const [s,vals] of Object.entries(report.sections||{})) for(const [k,v] of Object.entries(vals)) rows.push([s,k,v]);
  return rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(',')).join('\n');
}
export function svgExportModel({width=1000,height=700,entities=[]}={}){return {mime:'image/svg+xml',width,height,entities:clone(entities),vector:true}}
