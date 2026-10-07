import{pointSegmentProjection}from'./polyline.js';
const EPS=1e-8;
const cross=(a,b)=>a.x*b.y-a.y*b.x;
export function segmentIntersection(a,b,c,d){
 const r={x:b.x-a.x,y:b.y-a.y},s={x:d.x-c.x,y:d.y-c.y},den=cross(r,s),ca={x:c.x-a.x,y:c.y-a.y};
 if(Math.abs(den)<EPS)return null;const t=cross(ca,s)/den,u=cross(ca,r)/den;if(t<-EPS||t>1+EPS||u<-EPS||u>1+EPS)return null;return{point:{x:a.x+t*r.x,y:a.y+t*r.y},t,u};
}
export function detectPipeCrossings(runs){
 const out=[];for(let i=0;i<runs.length;i++)for(let j=i+1;j<runs.length;j++)for(let a=0;a<runs[i].points.length-1;a++)for(let b=0;b<runs[j].points.length-1;b++){const hit=segmentIntersection(runs[i].points[a],runs[i].points[a+1],runs[j].points[b],runs[j].points[b+1]);if(hit)out.push({kind:'CROSSING',runA:runs[i].id,segmentA:runs[i].segments[a]?.id,runB:runs[j].id,segmentB:runs[j].segments[b]?.id,point:hit.point,createsConnection:false})}return out;
}
export function nearestPipeSegment(runs,p){let best=null;for(const run of runs)for(let i=0;i<run.points.length-1;i++){const h=pointSegmentProjection(p,run.points[i],run.points[i+1]);if(!best||h.distance<best.distance)best={runId:run.id,segmentId:run.segments[i]?.id,index:i,...h}}return best}
export function topologyDiagnostics(graph,runs=[]){
 const issues=[];const runIds=new Set(runs.map(r=>r.id));
 for(const id of Object.keys(graph.runs))if(!runIds.has(id))issues.push({severity:'WARNING',code:'GRAPH_RUN_WITHOUT_SCENE',entityId:id});
 for(const run of runs)if(!graph.runs[run.id])issues.push({severity:'WARNING',code:'SCENE_RUN_WITHOUT_GRAPH',entityId:run.id});
 for(const x of detectPipeCrossings(runs))issues.push({severity:'INFO',code:'GRAPHIC_CROSSING_NOT_CONNECTED',entityId:`${x.runA}:${x.runB}`,data:x});
 return issues;
}
