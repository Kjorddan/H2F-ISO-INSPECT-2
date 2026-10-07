import{createPolyline,polylineLength,pointSegmentProjection}from'./polyline.js';
const clonePoint=p=>({x:Number(p.x),y:Number(p.y)});
const clean=v=>String(v??'').trim();
export const PIPE_DEFAULTS=Object.freeze({lineNumber:'',nominalSize:'',schedule:'',spec:'',service:'',material:'',insulation:''});
const normalizeEngineering=p=>({
 lineNumber:clean(p.lineNumber),nominalSize:clean(p.nominalSize),schedule:clean(p.schedule),spec:clean(p.spec),service:clean(p.service),material:clean(p.material),insulation:clean(p.insulation)
});
const vertexId=(runId,n)=>`${runId}-V${String(n).padStart(3,'0')}`;
const segmentId=(runId,n)=>`${runId}-S${String(n).padStart(3,'0')}`;
function normalizeSegments(run,segments=run.segments){
 return segments.map((s,i)=>({...s,index:i,runId:run.id,startVertexId:run.vertexIds[i],endVertexId:run.vertexIds[i+1]}));
}
export function createPipeRun(id,points=[],props={}){
 const base=createPolyline(id,points,{name:props.name||props.lineNumber||id});
 const vertexIds=points.map((_,i)=>vertexId(id,i+1));
 const segments=points.slice(0,-1).map((_,i)=>({id:segmentId(id,i+1),runId:id,index:i,startVertexId:vertexIds[i],endVertexId:vertexIds[i+1],physicalLength:null,properties:{}}));
 return{...base,kind:'pipe-run',name:props.name||props.lineNumber||id,engineering:{...PIPE_DEFAULTS,...normalizeEngineering(props)},vertexIds,segments,meta:{nextVertexSeq:points.length+1,nextSegmentSeq:segments.length+1}};
}
export const isPipeRun=e=>e?.kind==='pipe-run';
export const isLinearEntity=e=>e?.kind==='polyline'||isPipeRun(e);
export const pipeRunGraphicLength=run=>polylineLength(run);
export function pipeSegmentGraphicLength(run,index){
 if(!isPipeRun(run)||index<0||index>=run.points.length-1)return 0;
 const a=run.points[index],b=run.points[index+1];return Math.hypot(b.x-a.x,b.y-a.y);
}
export function updatePipeEngineering(run,patch={}){
 if(!isPipeRun(run))throw new TypeError('PipeRun required');
 const engineering={...run.engineering,...normalizeEngineering({...run.engineering,...patch})};
 const name=engineering.lineNumber||run.name||run.id;return{...run,name,engineering};
}
export function updatePipeSegment(run,segmentIdValue,patch={}){
 if(!isPipeRun(run))throw new TypeError('PipeRun required');
 return{...run,segments:run.segments.map(s=>s.id===segmentIdValue?{...s,...patch,properties:{...s.properties,...(patch.properties||{})}}:s)};
}
export function movePipeWaypoint(run,index,point){
 if(index<0||index>=run.points.length)throw new RangeError('Invalid waypoint index');
 const points=run.points.map(clonePoint);points[index]=clonePoint(point);return{...run,points};
}
export function addPipeWaypointProjected(run,segmentIndex,p){
 if(segmentIndex<0||segmentIndex>=run.points.length-1)throw new RangeError('Invalid segment index');
 const projected=pointSegmentProjection(p,run.points[segmentIndex],run.points[segmentIndex+1]).point;
 const points=run.points.map(clonePoint);points.splice(segmentIndex+1,0,projected);
 const newVertexId=vertexId(run.id,run.meta.nextVertexSeq),vertexIds=[...run.vertexIds];vertexIds.splice(segmentIndex+1,0,newVertexId);
 const old=run.segments[segmentIndex],newSeg={id:segmentId(run.id,run.meta.nextSegmentSeq),runId:run.id,index:segmentIndex+1,startVertexId:newVertexId,endVertexId:old.endVertexId,physicalLength:null,properties:{...old.properties}};
 let segments=run.segments.map(s=>({...s}));segments[segmentIndex]={...old,endVertexId:newVertexId,physicalLength:null};segments.splice(segmentIndex+1,0,newSeg);
 const next={...run,points,vertexIds,segments,meta:{...run.meta,nextVertexSeq:run.meta.nextVertexSeq+1,nextSegmentSeq:run.meta.nextSegmentSeq+1}};
 return{...next,segments:normalizeSegments(next,segments)};
}
export function removePipeWaypoint(run,index){
 if(run.points.length<=2)return run;if(index<0||index>=run.points.length)throw new RangeError('Invalid waypoint index');
 const points=run.points.map(clonePoint),vertexIds=[...run.vertexIds],segments=run.segments.map(s=>({...s}));points.splice(index,1);vertexIds.splice(index,1);
 if(index===0)segments.splice(0,1);else if(index===run.points.length-1)segments.splice(segments.length-1,1);else{segments[index-1]={...segments[index-1],endVertexId:run.vertexIds[index+1],physicalLength:null};segments.splice(index,1)}
 const next={...run,points,vertexIds};return{...next,segments:normalizeSegments(next,segments)};
}
export function movePipeRun(run,dx,dy){return{...run,points:run.points.map(p=>({x:p.x+dx,y:p.y+dy}))}}
export function movePipeSegment(run,segmentIndex,dx,dy){
 if(segmentIndex<0||segmentIndex>=run.points.length-1)throw new RangeError('Invalid segment index');
 const points=run.points.map(clonePoint);for(const i of[segmentIndex,segmentIndex+1])points[i]={x:points[i].x+dx,y:points[i].y+dy};return{...run,points};
}
export function transformPipeRun(run,pointTransform){return{...run,points:run.points.map(pointTransform)}}
export function validatePipeRun(run){
 const issues=[];
 if(!isPipeRun(run))issues.push('kind');
 if(!run?.id)issues.push('id');
 if(!Array.isArray(run?.points)||run.points.length<2)issues.push('points');
 if(!Array.isArray(run?.vertexIds)||run.vertexIds.length!==run.points.length)issues.push('vertex-count');
 if(!Array.isArray(run?.segments)||run.segments.length!==Math.max(0,run.points.length-1))issues.push('segment-count');
 if(new Set(run?.vertexIds||[]).size!==(run?.vertexIds||[]).length)issues.push('duplicate-vertex-id');
 if(new Set((run?.segments||[]).map(s=>s.id)).size!==(run?.segments||[]).length)issues.push('duplicate-segment-id');
 (run?.segments||[]).forEach((s,i)=>{if(s.runId!==run.id||s.index!==i||s.startVertexId!==run.vertexIds[i]||s.endVertexId!==run.vertexIds[i+1])issues.push(`segment-ref-${i}`)});
 return{valid:issues.length===0,issues};
}
export function pipeRunSummary(run){return{id:run.id,lineNumber:run.engineering.lineNumber,nominalSize:run.engineering.nominalSize,spec:run.engineering.spec,service:run.engineering.service,waypoints:run.points.length,segments:run.segments.length,graphicLength:pipeRunGraphicLength(run)}}
