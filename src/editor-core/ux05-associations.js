import{registerComponent,connectPorts,mountComponentToPipeSegment}from'./engineering-graph.js';
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
