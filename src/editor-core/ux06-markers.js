import{createSymbolEntityFrom}from'./library.js';
import{isPipeRun}from'./piping.js';
import{pointSegmentProjection}from'./polyline.js';
import{registerComponent,mountComponentToPipeSegment}from'./engineering-graph.js';
import{createMonitoringPoint,addMonitoringPoint,createWeld,addWeld,createNDT,addNDT,NDT_METHODS}from'./inspection.js';
const cp=x=>structuredClone(x);
export const UX06_CATEGORIES=Object.freeze(['INSPEÇÃO','END','ANOTAÇÕES','SÍMBOLOS DE FOLHA']);
export const isUx06Symbol=x=>UX06_CATEGORIES.includes(x?.category);
export const isUx06PhysicalMarker=x=>['INSPEÇÃO','END'].includes(x?.category);
export const ux06SymbolContext=x=>x?.category==='END'?'NDT':x?.category==='INSPEÇÃO'?'INSPECTION':x?.category==='ANOTAÇÕES'?'ANNOTATION':'SHEET';
const bad=(s,e)=>({ok:false,rolledBack:true,error:String(e.message||e),entities:s.entities,graph:s.graph,inspectionStore:s.inspectionStore});
export function insertUx06MarkerTransaction(s,{symbol,id,point,runId=null,segmentIndex=null,sheetId=null,tag=''}={}){
 try{
 if(!isUx06Symbol(symbol)||!id||s.entities.some(e=>e.id===id))throw Error('Invalid or duplicate marker');
 if(!Number.isFinite(point?.x)||!Number.isFinite(point?.y))throw Error('Invalid position');
 if(runId!=null&&!isUx06PhysicalMarker(symbol))throw Error('Only physical markers mount to segments');
 if(symbol.category==='SÍMBOLOS DE FOLHA'&&!sheetId)throw Error('Sheet ID required');
 const e={...createSymbolEntityFrom(symbol,point,{id,tag}),symbolDefinition:symbol,note:'',ux06:{context:ux06SymbolContext(symbol),sheetId,recordState:'NOT_REGISTERED'}};
 let g=s.graph;
 if(runId!=null){
  const run=s.entities.find(r=>r.id===runId&&isPipeRun(r)),seg=run?.segments?.[segmentIndex];
  if(!seg||!g.edges?.[seg.id])throw Error('Physical segment required');
  const hit=pointSegmentProjection(point,run.points[segmentIndex],run.points[segmentIndex+1]);
  if(hit.distance>1e-5)throw Error('Marker must project on host segment');
  g=registerComponent(g,{id,symbolId:symbol.id,componentType:'UX06-MARKER',ports:[]});
  g=mountComponentToPipeSegment(g,id,seg.id,{kind:'UX06_NONPROCESS_MARKER',t:hit.t});
  e.mount={runId,segmentId:seg.id,t:hit.t,kind:'UX06_NONPROCESS_MARKER'};
 }
 return{ok:true,entities:[...s.entities,e],graph:g,inspectionStore:s.inspectionStore,created:{markerId:id}};
 }catch(err){return bad(s,err)}
}
const LEGACY={'ndt-ut':'UT','ndt-pt':'PT','ndt-mt':'MT','ndt-rt':'RT','ndt-etr':'ET','ndt-iris':'IRIS','ndt-mfl':'MFL'};
export const ux06NdtMethod=s=>s?.ndtMethod||LEGACY[s?.id]||'OTHER';
export const ux06MarkerStatus=x=>x?.ux06?.recordId?'REGISTRO PLANEJADO':'SOMENTE MARCADOR — NÃO É RESULTADO';
