import{nearestGridIntersection,GRID_MODES}from'./grid.js';
import{isLinearEntity,isPipeRun}from'./piping.js';

export const SNAP_TYPES=Object.freeze({PORT:'port',ENDPOINT:'endpoint',VERTEX:'vertex',INTERSECTION:'intersection',MIDPOINT:'midpoint',ALIGNMENT:'alignment',GRID:'grid'});
export const SNAP_PRIORITY=Object.freeze({port:700,endpoint:600,vertex:500,intersection:400,midpoint:300,alignment:200,grid:100});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clone=p=>({x:Number(p.x),y:Number(p.y)});
const candidate=(type,point,extra={})=>({type,point:clone(point),priority:SNAP_PRIORITY[type]||0,...extra});

function segmentIntersection(a,b,c,d){
 const r={x:b.x-a.x,y:b.y-a.y},s={x:d.x-c.x,y:d.y-c.y};
 const cross=(u,v)=>u.x*v.y-u.y*v.x,den=cross(r,s);if(Math.abs(den)<1e-9)return null;
 const ca={x:c.x-a.x,y:c.y-a.y},t=cross(ca,s)/den,u=cross(ca,r)/den;
 if(t<-1e-9||t>1+1e-9||u<-1e-9||u>1+1e-9)return null;
 return{x:a.x+t*r.x,y:a.y+t*r.y};
}

export function collectEntitySnapCandidates(entities,{excludeEntityId=null,includeIntersections=true}={}){
 const out=[],segments=[];
 for(const e of entities||[]){
  if(e.id===excludeEntityId)continue;
  if(isLinearEntity(e)){
   e.points.forEach((p,i)=>{
    const end=i===0||i===e.points.length-1;
    if(isPipeRun(e)&&end)out.push(candidate(SNAP_TYPES.PORT,p,{entityId:e.id,portId:`${e.id}-PORT-${i===0?'START':'END'}`,vertexIndex:i}));
    out.push(candidate(end?SNAP_TYPES.ENDPOINT:SNAP_TYPES.VERTEX,p,{entityId:e.id,vertexIndex:i}));
   });
   for(let i=0;i<e.points.length-1;i++){
    const a=e.points[i],b=e.points[i+1],m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    out.push(candidate(SNAP_TYPES.MIDPOINT,m,{entityId:e.id,segmentIndex:i}));
    segments.push({a,b,entityId:e.id,segmentIndex:i});
   }
  }else if(Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.width)&&Number.isFinite(e.height)){
   if(e.category==='EQUIPAMENTOS'&&Array.isArray(e.ports)){
    const cx=e.x+e.width/2,cy=e.y+e.height/2,angle=(e.rotation||0)*Math.PI/180;
    for(const port of e.ports.filter(p=>p.role==='equipment-nozzle'&&Number.isFinite(p.x)&&Number.isFinite(p.y))){
     const px=e.x+port.x,py=e.y+port.y;
     const p={x:cx+(px-cx)*Math.cos(angle)-(py-cy)*Math.sin(angle),y:cy+(px-cx)*Math.sin(angle)+(py-cy)*Math.cos(angle)};
     out.push(candidate(SNAP_TYPES.PORT,p,{entityId:e.id,portId:`${e.id}-PORT-${port.id}`,nozzleId:port.id,role:'equipment-nozzle'}));
    }
   }
   const anchors=[
    {x:e.x,y:e.y},{x:e.x+e.width,y:e.y},{x:e.x+e.width,y:e.y+e.height},{x:e.x,y:e.y+e.height},
    {x:e.x+e.width/2,y:e.y+e.height/2}
   ];
   anchors.forEach((p,i)=>out.push(candidate(i===4?SNAP_TYPES.MIDPOINT:SNAP_TYPES.VERTEX,p,{entityId:e.id,anchorIndex:i})));
  }
 }
 if(includeIntersections){
  for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){
   if(segments[i].entityId===segments[j].entityId)continue;
   const p=segmentIntersection(segments[i].a,segments[i].b,segments[j].a,segments[j].b);
   if(p)out.push(candidate(SNAP_TYPES.INTERSECTION,p,{entities:[segments[i].entityId,segments[j].entityId]}));
  }
 }
 return out;
}

export function collectAlignmentAnchors(entities,{excludeEntityId=null}={}){
 const out=[];
 for(const e of entities||[]){
  if(e.id===excludeEntityId)continue;
  if(isLinearEntity(e)){for(const p of e.points)out.push({x:p.x,y:p.y,entityId:e.id});}
  else if(Number.isFinite(e.x)&&Number.isFinite(e.y)){out.push({x:e.x,y:e.y,entityId:e.id},{x:e.x+e.width/2,y:e.y+e.height/2,entityId:e.id},{x:e.x+e.width,y:e.y+e.height,entityId:e.id});}
 }
 return out;
}

export function resolveSnap(point,{entities=[],gridConfig=null,zoom=1,tolerancePx=10,excludeEntityId=null,enabled=true,bypass=false,types=null}={}){
 if(!enabled||bypass)return{snapped:false,point:clone(point),candidate:null,guides:[]};
 const tol=tolerancePx/Math.max(.0001,zoom),allowed=types?new Set(types):null;
 let candidates=collectEntitySnapCandidates(entities,{excludeEntityId});
 if(gridConfig&&gridConfig.mode!==GRID_MODES.OFF){const gp=nearestGridIntersection(point,gridConfig);candidates.push(candidate(SNAP_TYPES.GRID,gp));}
 const anchors=collectAlignmentAnchors(entities,{excludeEntityId});
 let bestX=null,bestY=null;
 for(const a of anchors){const dx=Math.abs(a.x-point.x),dy=Math.abs(a.y-point.y);if(dx<=tol&&(!bestX||dx<bestX.d))bestX={d:dx,a};if(dy<=tol&&(!bestY||dy<bestY.d))bestY={d:dy,a};}
 if(bestX)candidates.push(candidate(SNAP_TYPES.ALIGNMENT,{x:bestX.a.x,y:point.y},{axis:'x',anchor:bestX.a}));
 if(bestY)candidates.push(candidate(SNAP_TYPES.ALIGNMENT,{x:point.x,y:bestY.a.y},{axis:'y',anchor:bestY.a}));
 candidates=candidates.filter(c=>(!allowed||allowed.has(c.type))&&dist(point,c.point)<=tol);
 candidates.sort((a,b)=>b.priority-a.priority||dist(point,a.point)-dist(point,b.point));
 const best=candidates[0];if(!best)return{snapped:false,point:clone(point),candidate:null,guides:[]};
 let snapped=clone(best.point),guides=[];
 // Combine X/Y smart alignment only when alignment is the winning class.
 if(best.type===SNAP_TYPES.ALIGNMENT){
  if(bestX&&bestY){snapped={x:bestX.a.x,y:bestY.a.y};guides=[{axis:'x',value:snapped.x,anchor:bestX.a},{axis:'y',value:snapped.y,anchor:bestY.a}];}
  else guides=[{axis:best.axis,value:best.axis==='x'?best.point.x:best.point.y,anchor:best.anchor}];
 }else if(best.type!==SNAP_TYPES.GRID){guides=[{axis:'point',point:clone(best.point),type:best.type}];}
 return{snapped:true,point:snapped,candidate:{...best,distance:dist(point,best.point)},guides};
}

export function snapLabel(result){if(!result?.snapped)return'';const labels={port:'Porta',endpoint:'Endpoint',vertex:'Vértice',intersection:'Interseção',midpoint:'Ponto médio',alignment:'Alinhamento',grid:'Grade'};return labels[result.candidate.type]||result.candidate.type;}
