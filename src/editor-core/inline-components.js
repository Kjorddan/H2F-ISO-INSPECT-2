import{createPipeRun,isPipeRun}from'./piping.js';
import{pointSegmentProjection}from'./polyline.js';
import{createSymbolEntityFrom,defaultSymbolPorts}from'./library.js';
import{registerPipeRun,unregisterPipeRun,registerComponent,connectPorts,attachComponentToPipeSegment}from'./engineering-graph.js';

const copy=o=>typeof structuredClone==='function'?structuredClone(o):JSON.parse(JSON.stringify(o));
const EPS=1e-6;
export const INLINE_CATEGORIES=Object.freeze(['VÁLVULAS','FLANGES','CONEXÕES']);
export const isTeeSymbol=s=>['tee','tee-reducing'].includes(s?.id);
export const isBranchJunctionSymbol=s=>['tee','tee-reducing','lateral'].includes(s?.id);
export const isCrossSymbol=s=>s?.id==='cross';
export const isInlineSymbol=s=>{
 if(!s||isBranchJunctionSymbol(s)||isCrossSymbol(s))return false;
 const ports=(s.connectionPoints?.length||defaultSymbolPorts(s,s.size?.width||72,s.size?.height||46).length);
 if(s.placement&&typeof s.placement.inline==='boolean')return s.placement.inline&&ports===2;
 return INLINE_CATEGORIES.includes(s.category)&&ports>=2;
};

function peerPort(graph,portId){const p=graph.ports[portId],cid=p?.connectedConnectionId,c=cid?graph.connections[cid]:null;if(!c)return null;return c.sourcePortId===portId?c.targetPortId:c.sourcePortId}
function segmentAngle(run,index){const a=run.points[index],b=run.points[index+1];return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI}
function withSegmentData(newRun,oldRun,oldIndexes,splitIndex){
 return{...newRun,segments:newRun.segments.map((s,i)=>{const oi=oldIndexes[i];if(oi==null||oi===splitIndex)return{...s,physicalLength:null,properties:{...s.properties,splitFromSegmentId:oldRun.segments[splitIndex]?.id||null}};const old=oldRun.segments[oi];return{...s,physicalLength:old?.physicalLength??null,properties:{...(old?.properties||{})}}})};
}
export function splitPipeRunForInline(run,segmentIndex,point,{leftRunId=`${run.id}-A`,rightRunId=`${run.id}-B`}={}){
 if(!isPipeRun(run))throw new TypeError('PipeRun required');if(segmentIndex<0||segmentIndex>=run.points.length-1)throw new RangeError('Invalid segment index');
 const hit=pointSegmentProjection(point,run.points[segmentIndex],run.points[segmentIndex+1]);if(hit.t<=EPS||hit.t>=1-EPS)throw new Error('Inline insertion must be inside the segment');
 const p={x:hit.point.x,y:hit.point.y},leftPts=[...run.points.slice(0,segmentIndex+1),p],rightPts=[p,...run.points.slice(segmentIndex+1)];
 let left=createPipeRun(leftRunId,leftPts,{...run.engineering,name:run.name,visualStyle:run.visualStyle});let right=createPipeRun(rightRunId,rightPts,{...run.engineering,name:run.name,visualStyle:run.visualStyle});
 left=withSegmentData(left,run,left.segments.map((_,i)=>i<segmentIndex?i:null),segmentIndex);
 right=withSegmentData(right,run,right.segments.map((_,i)=>i===0?null:segmentIndex+i),segmentIndex);
 return{left,right,point:p,projection:hit,sourceSegmentId:run.segments[segmentIndex].id,angle:segmentAngle(run,segmentIndex)};
}
function reconnectExternal(graph,peer,newPortId){if(!peer)return graph;try{return connectPorts(graph,peer,newPortId,{kind:'preserved-external'})}catch{return graph}}
function componentEntity(symbol,point,id,run,angle){
 const base=createSymbolEntityFrom(symbol,point,{id,rotation:angle});
 return{...base,componentType:symbol.id,engineering:{lineNumber:run.engineering.lineNumber,nominalSize:run.engineering.nominalSize,spec:run.engineering.spec,service:run.engineering.service,inline:true,sourceRunId:run.id}};
}
function transact(state,fn){const before={entities:state.entities,graph:state.graph};try{const result=fn(copy(state.entities),copy(state.graph));return{ok:true,...result}}catch(error){return{ok:false,entities:before.entities,graph:before.graph,error:error instanceof Error?error.message:String(error),rolledBack:true}}}

export function insertInlineComponentTransaction(state,{runId,segmentIndex,point,symbol,componentId,leftRunId,rightRunId}={}){
 return transact(state,(entities,graph)=>{
  if(!isInlineSymbol(symbol))throw new Error('Symbol is not eligible for inline insertion');const run=entities.find(e=>e.id===runId);if(!run)throw new Error('PipeRun not found');
  const oldStartPeer=peerPort(graph,`${run.id}-PORT-START`),oldEndPeer=peerPort(graph,`${run.id}-PORT-END`);
  const split=splitPipeRunForInline(run,segmentIndex,point,{leftRunId,rightRunId});const cid=componentId||`CMP-${symbol.id}`;const component=componentEntity(symbol,split.point,cid,run,split.angle);
  entities=entities.filter(e=>e.id!==run.id);entities.push(split.left,component,split.right);
  graph=unregisterPipeRun(graph,run.id);graph=registerPipeRun(graph,split.left);graph=registerPipeRun(graph,split.right);graph=registerComponent(graph,component);
  graph=connectPorts(graph,`${split.left.id}-PORT-END`,`${cid}-PORT-P1`,{kind:'inline'});graph=connectPorts(graph,`${cid}-PORT-P2`,`${split.right.id}-PORT-START`,{kind:'inline'});
  graph=reconnectExternal(graph,oldStartPeer,`${split.left.id}-PORT-START`);graph=reconnectExternal(graph,oldEndPeer,`${split.right.id}-PORT-END`);
  return{entities,graph,created:{componentId:cid,leftRunId:split.left.id,rightRunId:split.right.id},transaction:{type:'INSERT_INLINE_COMPONENT',atomic:true,sourceRunId:run.id,sourceSegmentId:split.sourceSegmentId}};
 });
}

export function insertTeeBranchTransaction(state,{runId,segmentIndex,point,symbol,componentId,leftRunId,rightRunId,branchRunId,branchEnd,branchEngineering={}}={}){
 return transact(state,(entities,graph)=>{
  if(!isBranchJunctionSymbol(symbol))throw new Error('Three-port branch junction symbol required');const run=entities.find(e=>e.id===runId);if(!run)throw new Error('PipeRun not found');
  const oldStartPeer=peerPort(graph,`${run.id}-PORT-START`),oldEndPeer=peerPort(graph,`${run.id}-PORT-END`);
  const split=splitPipeRunForInline(run,segmentIndex,point,{leftRunId,rightRunId});const cid=componentId||'TEE-001';const component=componentEntity(symbol,split.point,cid,run,split.angle);
  if(component.ports.length!==3)throw new Error('Three-port branch junction requires exactly three ports');
  const end=branchEnd||{x:split.point.x,y:split.point.y-100};if(Math.hypot(end.x-split.point.x,end.y-split.point.y)<EPS)throw new Error('Branch requires non-zero length');
  const bid=branchRunId||`${run.id}-BR`;const branch=createPipeRun(bid,[split.point,end],{...run.engineering,...branchEngineering,name:run.name,visualStyle:run.visualStyle});
  entities=entities.filter(e=>e.id!==run.id);entities.push(split.left,component,split.right,branch);
  graph=unregisterPipeRun(graph,run.id);for(const r of[split.left,split.right,branch])graph=registerPipeRun(graph,r);graph=registerComponent(graph,component);
  graph=connectPorts(graph,`${split.left.id}-PORT-END`,`${cid}-PORT-P1`,{kind:'tee-main'});graph=connectPorts(graph,`${cid}-PORT-P2`,`${split.right.id}-PORT-START`,{kind:'tee-main'});graph=connectPorts(graph,`${cid}-PORT-P3`,`${branch.id}-PORT-START`,{kind:'tee-branch'});
  graph=reconnectExternal(graph,oldStartPeer,`${split.left.id}-PORT-START`);graph=reconnectExternal(graph,oldEndPeer,`${split.right.id}-PORT-END`);
  return{entities,graph,created:{componentId:cid,leftRunId:split.left.id,rightRunId:split.right.id,branchRunId:branch.id},transaction:{type:'INSERT_TEE_BRANCH',atomic:true,sourceRunId:run.id,sourceSegmentId:split.sourceSegmentId}};
 });
}

export function insertCrossBranchTransaction(state,{runId,segmentIndex,point,symbol,componentId,leftRunId,rightRunId,branchRunIdA,branchRunIdB,branchEndA,branchEndB,branchEngineeringA={},branchEngineeringB={}}={}){
 return transact(state,(entities,graph)=>{
  if(!isCrossSymbol(symbol))throw new Error('Cross symbol required');
  const run=entities.find(e=>e.id===runId);if(!run)throw new Error('PipeRun not found');
  const oldStartPeer=peerPort(graph,`${run.id}-PORT-START`),oldEndPeer=peerPort(graph,`${run.id}-PORT-END`);
  const split=splitPipeRunForInline(run,segmentIndex,point,{leftRunId,rightRunId}),cid=componentId||'CROSS-001',component=componentEntity(symbol,split.point,cid,run,split.angle);
  if(component.ports.length!==4)throw new Error('Cross requires exactly four ports');
  const endA=branchEndA||{x:split.point.x,y:split.point.y-100},endB=branchEndB||{x:split.point.x,y:split.point.y+100};
  if(Math.hypot(endA.x-split.point.x,endA.y-split.point.y)<EPS||Math.hypot(endB.x-split.point.x,endB.y-split.point.y)<EPS)throw new Error('Cross branches require non-zero length');
  const bidA=branchRunIdA||`${run.id}-BR-A`,bidB=branchRunIdB||`${run.id}-BR-B`;
  const branchA=createPipeRun(bidA,[split.point,endA],{...run.engineering,...branchEngineeringA,name:run.name,visualStyle:run.visualStyle});
  const branchB=createPipeRun(bidB,[split.point,endB],{...run.engineering,...branchEngineeringB,name:run.name,visualStyle:run.visualStyle});
  entities=entities.filter(e=>e.id!==run.id);entities.push(split.left,component,split.right,branchA,branchB);
  graph=unregisterPipeRun(graph,run.id);for(const r of[split.left,split.right,branchA,branchB])graph=registerPipeRun(graph,r);graph=registerComponent(graph,component);
  graph=connectPorts(graph,`${split.left.id}-PORT-END`,`${cid}-PORT-P1`,{kind:'cross-main'});
  graph=connectPorts(graph,`${cid}-PORT-P2`,`${split.right.id}-PORT-START`,{kind:'cross-main'});
  graph=connectPorts(graph,`${cid}-PORT-P3`,`${branchA.id}-PORT-START`,{kind:'cross-branch'});
  graph=connectPorts(graph,`${cid}-PORT-P4`,`${branchB.id}-PORT-START`,{kind:'cross-branch'});
  graph=reconnectExternal(graph,oldStartPeer,`${split.left.id}-PORT-START`);graph=reconnectExternal(graph,oldEndPeer,`${split.right.id}-PORT-END`);
  return{entities,graph,created:{componentId:cid,leftRunId:split.left.id,rightRunId:split.right.id,branchRunIdA:branchA.id,branchRunIdB:branchB.id},transaction:{type:'INSERT_CROSS_BRANCH',atomic:true,sourceRunId:run.id,sourceSegmentId:split.sourceSegmentId}};
 });
}


export const isTerminalSymbol=s=>!!s?.placement?.terminal;
export const isAttachedBranchSymbol=s=>!!s?.placement?.attached&&['CONEXÕES'].includes(s.category)&&Array.isArray(s.portDefinitions)&&s.portDefinitions.length===2;

export function insertTerminalComponentTransaction(state,{runId,side='END',symbol,componentId,point}={}){
 return transact(state,(entities,graph)=>{
  if(!isTerminalSymbol(symbol))throw new Error('Terminal symbol required');
  const run=entities.find(e=>e.id===runId);if(!run)throw new Error('PipeRun not found');
  const endpoint=side==='START'?run.points[0]:run.points.at(-1),cid=componentId||`TERM-${symbol.id}`;
  const p=point||endpoint,angle=side==='START'?segmentAngle(run,0)+180:segmentAngle(run,run.points.length-2);
  const component=componentEntity(symbol,p,cid,run,angle);
  if(component.ports.length!==1)throw new Error('Terminal component requires one port');
  entities.push(component);graph=registerComponent(graph,component);
  graph=connectPorts(graph,`${run.id}-PORT-${side}`,`${cid}-PORT-P1`,{kind:'terminal'});
  return{entities,graph,created:{componentId:cid,runId:run.id,side},transaction:{type:'INSERT_TERMINAL_COMPONENT',atomic:true,sourceRunId:run.id,side}};
 });
}

export function insertAttachedBranchTransaction(state,{runId,segmentIndex,point,symbol,componentId,branchRunId,branchEnd,branchEngineering={}}={}){
 return transact(state,(entities,graph)=>{
  if(!isAttachedBranchSymbol(symbol))throw new Error('Attached branch symbol required');
  const run=entities.find(e=>e.id===runId);if(!run)throw new Error('PipeRun not found');
  if(segmentIndex<0||segmentIndex>=run.points.length-1)throw new RangeError('Invalid segment index');
  const hit=pointSegmentProjection(point,run.points[segmentIndex],run.points[segmentIndex+1]),p={x:hit.point.x,y:hit.point.y};
  if(hit.t<=EPS||hit.t>=1-EPS)throw new Error('Attached branch insertion must be inside the segment');
  const cid=componentId||`ATT-${symbol.id}`,angle=segmentAngle(run,segmentIndex),component=componentEntity(symbol,p,cid,run,angle);
  if(component.ports.length!==2)throw new Error('Attached branch component requires host and branch ports');
  component.engineering={...component.engineering,inline:false,attached:true,sourceSegmentId:run.segments[segmentIndex].id};
  const end=branchEnd||{x:p.x,y:p.y-100};if(Math.hypot(end.x-p.x,end.y-p.y)<EPS)throw new Error('Branch requires non-zero length');
  const bid=branchRunId||`${run.id}-BR-ATT`,branch=createPipeRun(bid,[p,end],{...run.engineering,...branchEngineering,name:run.name,visualStyle:run.visualStyle});
  entities.push(component,branch);graph=registerComponent(graph,component);graph=registerPipeRun(graph,branch);
  graph=attachComponentToPipeSegment(graph,`${cid}-PORT-P1`,run.segments[segmentIndex].id,{kind:'branch-outlet-host',properties:{t:hit.t}});
  graph=connectPorts(graph,`${cid}-PORT-P2`,`${branch.id}-PORT-START`,{kind:'branch-outlet'});
  return{entities,graph,created:{componentId:cid,branchRunId:branch.id,hostRunId:run.id,hostSegmentId:run.segments[segmentIndex].id},transaction:{type:'INSERT_ATTACHED_BRANCH',atomic:true,sourceRunId:run.id,sourceSegmentId:run.segments[segmentIndex].id}};
 });
}
