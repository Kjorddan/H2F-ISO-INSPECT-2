import{registerComponent,connectPorts,mountComponentToPipeSegment,updateComponentPorts}from'./engineering-graph.js';
import{createSymbolEntityFrom}from'./library.js';
import{isPipeRun}from'./piping.js';
import{pointSegmentProjection}from'./polyline.js';

const clone=x=>typeof structuredClone==='function'?structuredClone(x):JSON.parse(JSON.stringify(x));
export const isMountableSymbol=s=>s?.category==='SUPORTES'||(s?.category==='INSTRUMENTAÇÃO'&&s.usageContexts?.includes('ISOMETRIC')&&s.placement?.attached===true);
export const isPhysicalEquipment=s=>s?.category==='EQUIPAMENTOS';
export function addUx05SymbolTransaction(state,{symbol,point,id,runId,segmentIndex,tag='' }){
 try{
  if(!symbol?.id||!id||!Number.isFinite(point?.x)||!Number.isFinite(point?.y))throw new Error('Invalid symbol placement');
  if(state.entities.some(e=>e.id===id)||state.graph.components?.[id])throw new Error('Duplicate entity');
  const entity={...createSymbolEntityFrom(symbol,point,{id,tag}),symbolDefinition:symbol};
  let graph=clone(state.graph);
  const mustRegister=isMountableSymbol(symbol)||isPhysicalEquipment(symbol);
  if(mustRegister)graph=registerComponent(graph,{id,symbolId:symbol.id,componentType:symbol.subcategory,ports:entity.ports,engineering:{tag:entity.tag}});
  if(runId!=null){
   if(!isMountableSymbol(symbol))throw new Error('Only physical instruments and supports can be mounted');
   const run=state.entities.find(e=>e.id===runId&&isPipeRun(e));if(!run)throw new Error('Unknown host PipeRun');
   const segment=run.segments?.[segmentIndex];if(!segment||!graph.edges[segment.id])throw new Error('Unknown host PipeSegment');
   const projection=pointSegmentProjection(point,run.points[segmentIndex],run.points[segmentIndex+1]);
   entity.mount={runId,segmentId:segment.id,t:projection.t,kind:symbol.category==='SUPORTES'?'PIPE_SUPPORT':'INSTRUMENT_TAP'};
   graph=mountComponentToPipeSegment(graph,id,segment.id,{kind:entity.mount.kind,projection:projection.t});
  }
  return{ok:true,graph,entities:[...state.entities,entity],created:{componentId:id}};
 }catch(error){return{ok:false,rolledBack:true,error:String(error?.message||error),graph:state.graph,entities:state.entities}}
}
export function connectPipeEndpointToEquipmentNozzleTransaction(state,{runId,side,equipmentId,nozzleId}){
 try{
  const run=state.entities.find(e=>e.id===runId&&isPipeRun(e)),equipment=state.entities.find(e=>e.id===equipmentId&&e.category==='EQUIPAMENTOS');
  if(!run||!equipment)throw new Error('Pipe and physical equipment required');
  if(!['START','END'].includes(side))throw new Error('Endpoint must be START or END');
  const port=equipment.ports?.find(p=>p.id===nozzleId&&p.role==='equipment-nozzle');if(!port)throw new Error('Unknown physical nozzle');
  const pipePort=`${runId}-PORT-${side}`,nozzlePort=`${equipmentId}-PORT-${nozzleId}`;
  const g=state.graph;if(g.ports?.[pipePort]?.connectedConnectionId||g.ports?.[nozzlePort]?.connectedConnectionId)throw new Error('Port already connected');
  const graph=connectPorts(g,pipePort,nozzlePort,{kind:'equipment-nozzle-explicit',properties:{nozzleId}});
  return{ok:true,graph,entities:state.entities,created:{runId,side,equipmentId,nozzleId}};
 }catch(error){return{ok:false,rolledBack:true,error:String(error?.message||error),graph:state.graph,entities:state.entities}}
}
export function equipmentNozzleCandidates(equipment,runs,graph,maxDistance=24){
 if(equipment?.category!=='EQUIPAMENTOS')return[];
 const cx=equipment.x+equipment.width/2,cy=equipment.y+equipment.height/2,a=(equipment.rotation||0)*Math.PI/180;
 const rotate=(x,y)=>({x:cx+(x-cx)*Math.cos(a)-(y-cy)*Math.sin(a),y:cy+(x-cx)*Math.sin(a)+(y-cy)*Math.cos(a)});
 const candidates=[];
 for(const port of equipment.ports||[]){
  if(port.role!=='equipment-nozzle'||graph.ports?.[`${equipment.id}-PORT-${port.id}`]?.connectedConnectionId)continue;
  const at=rotate(equipment.x+port.x,equipment.y+port.y);
  for(const run of runs.filter(isPipeRun))for(const side of['START','END']){
   const p=side==='START'?run.points[0]:run.points.at(-1),distance=Math.hypot(p.x-at.x,p.y-at.y);
   if(distance<=maxDistance&&!graph.ports?.[`${run.id}-PORT-${side}`]?.connectedConnectionId)candidates.push({runId:run.id,side,equipmentId:equipment.id,nozzleId:port.id,distance});
  }
 }
 return candidates.sort((a,b)=>a.distance-b.distance);
}

export function syncMountedSymbolPositions(entities){
 const runs=new Map(entities.filter(isPipeRun).map(r=>[r.id,r]));
 return entities.map(e=>{
  if(!e.mount?.runId||!e.mount?.segmentId)return e;
  const run=runs.get(e.mount.runId),idx=run?.segments?.findIndex(s=>s.id===e.mount.segmentId);
  if(idx==null||idx<0)return e;
  const p=run.points[idx],q=run.points[idx+1],t=Math.max(0,Math.min(1,e.mount.t??.5));
  const x=p.x+(q.x-p.x)*t-e.width/2,y=p.y+(q.y-p.y)*t-e.height/2;
  return Math.abs(e.x-x)<1e-8&&Math.abs(e.y-y)<1e-8?e:{...e,x,y};
 });
}

export function configureEquipmentNozzlesTransaction(state,{equipmentId,nozzles}){
 try{
  const entity=state.entities.find(e=>e.id===equipmentId&&e.category==='EQUIPAMENTOS');
  if(!entity||!Array.isArray(nozzles))throw new Error('Valid equipment nozzle configuration required');
  const ids=new Set();
  for(const p of nozzles){
   if(!p?.id||ids.has(p.id)||!/^[A-Za-z0-9_-]{1,18}$/.test(p.id)||p.role!=='equipment-nozzle'||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>entity.width||p.y<0||p.y>entity.height)throw new Error('Invalid nozzle ID/position');
   ids.add(p.id);
  }
  const graph=updateComponentPorts(state.graph,equipmentId,nozzles);
  const defs=nozzles.map(p=>({id:p.id,u:p.x/entity.width,v:p.y/entity.height,role:'equipment-nozzle',direction:p.direction||'bidirectional'}));
  const current=entity.symbolDefinition||{};
  const updated={...entity,ports:nozzles.map(p=>({...p})),symbolDefinition:{...current,portDefinitions:defs,nozzleTemplate:'UX05_USER_CONFIGURED'}};
  return{ok:true,entities:state.entities.map(e=>e.id===equipmentId?updated:e),graph,created:{componentId:equipmentId,nozzleCount:nozzles.length}};
 }catch(error){return{ok:false,rolledBack:true,error:String(error?.message||error),entities:state.entities,graph:state.graph}}
}
export function nextEquipmentNozzle(entity){
 const used=new Set((entity?.ports||[]).map(p=>p.id)),number=Array.from({length:999},(_,i)=>i+1).find(n=>!used.has(`N${n}`));
 if(!number)throw new Error('Maximum configured nozzles reached');
 return{id:`N${number}`,x:entity.width,y:entity.height/2,role:'equipment-nozzle',direction:'bidirectional'};
}
