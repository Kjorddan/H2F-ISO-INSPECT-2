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
 const e={...createSymbolEntityFrom(symbol,point,{id,tag}),symbolDefinition:symbol,note:'',sheetId:symbol.category==='SÍMBOLOS DE FOLHA'?sheetId:null,ux06:{context:ux06SymbolContext(symbol),sheetId,recordState:'NOT_REGISTERED'}};
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

export function registerUx06RecordTransaction(s,{markerId,recordId=null,target=null}={}){
 try{
  const marker=s.entities.find(e=>e.id===markerId&&isUx06PhysicalMarker(e));if(!marker)throw Error('Physical marker required');
  if(marker.ux06?.recordId)throw Error('Marker already has linked record');
  const m=marker.mount,hit=target||(m?{kind:'pipe-segment',id:m.segmentId,entityId:m.runId}:null);
  if(!hit)throw Error('Physical target is mandatory');
  const symbol=marker.symbolDefinition||{},store=cp(s.inspectionStore),id=recordId||'UX06-REC-'+markerId;
  let kind,record;
  if(marker.category==='END'){
   if(!['weld','tml','pipe-segment'].includes(hit.kind)||!hit.id)throw Error('Supported NDT target required');
   if(hit.kind==='weld'&&!store.welds.some(x=>x.id===hit.id))throw Error('Missing weld');
   if(hit.kind==='tml'&&!store.points.some(x=>x.id===hit.id))throw Error('Missing TML/CML');
   if(hit.kind==='pipe-segment'&&!s.graph.edges?.[hit.id])throw Error('Missing PipeSegment');
   const method=ux06NdtMethod(symbol);if(!NDT_METHODS.includes(method))throw Error('Invalid method');
   if(store.ndt.some(x=>x.id===id))throw Error('Duplicate END ID');
   record=createNDT({id,method,target:{kind:hit.kind,id:hit.id},status:'PLANNED',notes:'Técnica H2F: '+symbol.name+'; requer procedimento e aceitação independentes.'});kind='NDT';
  }else{
   if(!hit.entityId||!s.entities.some(x=>x.id===hit.entityId))throw Error('Missing physical entity');
   const type=symbol.recordKind||(symbol.id==='insp-tml'?'TML':symbol.id==='insp-weld'?'WELD':'VISUAL');
   if(type==='TML'){
    kind=symbol.id==='insp-cml'?'CML':'TML';if(store.points.some(x=>x.id===id))throw Error('Duplicate CML/TML');
    record=createMonitoringPoint({id,type:kind,label:marker.tag||id,target:{entityId:hit.entityId,kind:hit.kind,segmentId:hit.id},marker:{x:marker.x+marker.width/2,y:marker.y+marker.height/2}});
   }else if(type==='WELD'){
    kind='WELD';if(store.welds.some(x=>x.id===id))throw Error('Duplicate weld');
    record=createWeld({id,number:marker.tag||id,type:symbol.variant||'',status:'PLANNED',target:{entityId:hit.entityId,kind:hit.kind,segmentId:hit.id}});
   }else throw Error('Anomaly or evidence requires distinct substantiated record');
  }
  const inspectionStore=kind==='NDT'?addNDT(store,record):kind==='WELD'?addWeld(store,record):addMonitoringPoint(store,record);
  const entities=s.entities.map(x=>x.id===markerId?{...x,ux06:{...x.ux06,recordId:id,recordKind:kind,recordState:'PLANNED'}}:x);
  return{ok:true,entities,graph:s.graph,inspectionStore,created:{recordId:id,recordType:kind,status:'PLANNED'}};
 }catch(e){return bad(s,e)}
}
export function validateUx06Markers(entities,graph,inspectionStore){
 const issues=[];
 for(const m of entities.filter(e=>isUx06Symbol(e)&&e.kind==='industrial-symbol')){
  if(m.category==='SÍMBOLOS DE FOLHA'&&!m.ux06?.sheetId)issues.push({code:'SHEET_SCOPE_REQUIRED',id:m.id});
  if(m.mount&&!Object.values(graph.mounts||{}).some(x=>x.componentId===m.id&&x.segmentId===m.mount.segmentId))issues.push({code:'MARKER_MOUNT_ORPHAN',id:m.id});
  if(m.ux06?.recordId&&![...inspectionStore.points,...inspectionStore.welds,...inspectionStore.ndt].some(x=>x.id===m.ux06.recordId))issues.push({code:'MARKER_RECORD_ORPHAN',id:m.id});
 }
 return{valid:issues.length===0,issues};
}
