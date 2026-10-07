const clone=v=>structuredClone(v);
const uid=(p='ID')=>`${p}-${globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
export const TML_TYPES=Object.freeze(['TML','CML']);
export const NDT_METHODS=Object.freeze(['UT','PAUT','TOFD','RT','MT','PT','ET','IRIS','RFA','MFL','OTHER']);
export const NDT_TARGETS=Object.freeze(['weld','pipe-segment','component','tml','region']);
export const createInspectionStore=()=>({points:[],measurements:[],welds:[],ndt:[]});
const assert=(x,m)=>{if(!x)throw new Error(m)};
export function createMonitoringPoint({id=uid('TML'),type='TML',target,marker={x:0,y:0},label='',createdAt=new Date().toISOString()}={}){
 assert(TML_TYPES.includes(type),'invalid TML/CML type'); assert(target?.entityId,'physical target required');
 return {id,type,label:label||id,target:clone(target),marker:{x:Number(marker.x)||0,y:Number(marker.y)||0},createdAt};
}
export function addMonitoringPoint(store,point){assert(!store.points.some(x=>x.id===point.id),'duplicate point');return {...clone(store),points:[...clone(store.points),clone(point)]}}
export function moveMonitoringMarker(store,id,marker){const s=clone(store),p=s.points.find(x=>x.id===id);assert(p,'point not found');p.marker={x:Number(marker.x)||0,y:Number(marker.y)||0};return s}
export function addMeasurement(store,{id=uid('MEAS'),pointId,thickness,date,equipment='',inspector='',observation='',method='UT'}={}){
 assert(store.points.some(x=>x.id===pointId),'TML/CML not found');assert(Number.isFinite(Number(thickness))&&Number(thickness)>0,'thickness must be > 0');assert(date,'date required');
 const m=Object.freeze({id,pointId,thickness:Number(thickness),date,equipment,inspector,observation,method,recordedAt:new Date().toISOString()});return {...clone(store),measurements:[...store.measurements,clone(m)]};
}
export const measurementHistory=(store,pointId)=>store.measurements.filter(x=>x.pointId===pointId).map(clone).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
export function createWeld({id=uid('WELD'),number,type='',process='',material='',status='PLANNED',joint='',target}={}){assert(number,'weld number required');assert(target?.entityId,'weld physical target required');return {id,number,type,process,material,status,joint,target:clone(target),ndtIds:[]}}
export function addWeld(store,weld){assert(!store.welds.some(x=>x.id===weld.id),'duplicate weld');return {...clone(store),welds:[...clone(store.welds),clone(weld)]}}
export function createNDT({id=uid('NDT'),method,target,status='PLANNED',date=null,inspector='',equipment='',procedure='',result='',acceptance=null,notes=''}={}){
 assert(NDT_METHODS.includes(method),'invalid NDT method');assert(NDT_TARGETS.includes(target?.kind),'invalid NDT target');assert(target?.id,'NDT target id required');return {id,method,target:clone(target),status,date,inspector,equipment,procedure,result,acceptance,notes};
}
export function addNDT(store,record){const s=clone(store);s.ndt.push(clone(record));if(record.target.kind==='weld'){const w=s.welds.find(x=>x.id===record.target.id);assert(w,'weld target not found');w.ndtIds=[...new Set([...(w.ndtIds||[]),record.id])]}if(record.target.kind==='tml')assert(s.points.some(x=>x.id===record.target.id),'TML target not found');return s}
export function inspectionStats(store){return {tml:store.points.filter(x=>x.type==='TML').length,cml:store.points.filter(x=>x.type==='CML').length,measurements:store.measurements.length,welds:store.welds.length,ndt:store.ndt.length}}
export function validateInspectionStore(store){const issues=[];for(const m of store.measurements)if(!store.points.some(p=>p.id===m.pointId))issues.push({code:'ORPHAN_MEASUREMENT',id:m.id});for(const n of store.ndt){if(n.target.kind==='weld'&&!store.welds.some(w=>w.id===n.target.id))issues.push({code:'ORPHAN_NDT_WELD',id:n.id});if(n.target.kind==='tml'&&!store.points.some(p=>p.id===n.target.id))issues.push({code:'ORPHAN_NDT_TML',id:n.id})}return issues}
