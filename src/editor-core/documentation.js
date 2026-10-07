import{isLinearEntity,isPipeRun}from'./piping.js';
const clonePoint=p=>({x:Number(p.x),y:Number(p.y)});
const finite=(v,fallback=null)=>Number.isFinite(Number(v))?Number(v):fallback;
const dist=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y);
const midpoint=(a,b,t=.5)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const boundsFromPoints=(pts,pad=0)=>{const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);return{minX:Math.min(...xs)-pad,minY:Math.min(...ys)-pad,maxX:Math.max(...xs)+pad,maxY:Math.max(...ys)+pad}};
export const DIMENSION_TYPES=Object.freeze(['linear','aligned','horizontal','vertical','angular','between-points','offset','elevation']);
export const DOCUMENTATION_KINDS=Object.freeze(['dimension','elevation','industrial-coordinate','flow-arrow','north-arrow']);
export const freeAnchor=point=>({type:'free',point:clonePoint(point)});
export const entityAnchor=(entityId,locator={kind:'center'})=>({type:'entity',entityId,locator:{...locator}});
export function resolveAnchor(anchor,entities=[]){
 if(!anchor)return null;if(anchor.type==='free')return clonePoint(anchor.point);
 const e=entities.find(x=>x.id===anchor.entityId);if(!e)return null;const l=anchor.locator||{kind:'center'};
 if(isLinearEntity(e)){
  if(l.kind==='vertex'){const p=e.points[Math.max(0,Math.min(e.points.length-1,l.index||0))];return p?clonePoint(p):null}
  if(l.kind==='segment'){const i=Math.max(0,Math.min(e.points.length-2,l.index||0));return midpoint(e.points[i],e.points[i+1],Math.max(0,Math.min(1,finite(l.t,.5))))}
  if(l.kind==='start')return clonePoint(e.points[0]);if(l.kind==='end')return clonePoint(e.points.at(-1));
  const b=boundsFromPoints(e.points);return{x:(b.minX+b.maxX)/2,y:(b.minY+b.maxY)/2};
 }
 if(l.kind==='port'&&Array.isArray(e.ports)){const p=e.ports.find(x=>x.id===l.portId)||e.ports[l.index||0];if(p)return{x:e.x+(p.x??e.width/2),y:e.y+(p.y??e.height/2)}}
 return{x:e.x+(e.width||0)/2,y:e.y+(e.height||0)/2};
}
export function nearestEntityAnchor(entities,p,{preferPipe=true,tolerance=20}={}){
 let best=null;for(const e of entities){if(isLinearEntity(e)){for(let i=0;i<e.points.length-1;i++){const a=e.points[i],b=e.points[i+1],dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l2)),q=midpoint(a,b,t),d=dist(p,q);if((!best||d<best.distance)&&(preferPipe?!isPipeRun(e)||isPipeRun(e):true))best={distance:d,point:q,anchor:entityAnchor(e.id,{kind:'segment',index:i,t}),entity:e}}}else{const q={x:e.x+(e.width||0)/2,y:e.y+(e.height||0)/2},d=dist(p,q);if(!best||d<best.distance)best={distance:d,point:q,anchor:entityAnchor(e.id,{kind:'center'}),entity:e}}}
 return best&&best.distance<=tolerance?best:null;
}
export function createDimension(id,type,a,b,opts={}){
 if(!DIMENSION_TYPES.includes(type))throw new Error('Unsupported dimension type');if(!a||!b)throw new Error('Two anchors required');
 return{id,kind:'dimension',name:opts.name||'Cota',dimensionType:type,anchors:[a,b],engineeringValue:finite(opts.engineeringValue,null),unit:opts.unit||(type==='angular'?'°':'mm'),offset:finite(opts.offset,28),precision:Math.max(0,Math.min(6,finite(opts.precision,0))),prefix:opts.prefix||'',suffix:opts.suffix||'',style:{...opts.style},x:0,y:0,width:40,height:20,rotation:0};
}
export function updateDimension(d,patch={}){return{...d,...patch,engineeringValue:patch.engineeringValue===undefined?d.engineeringValue:finite(patch.engineeringValue,null)}}
export function resolveDimension(d,entities=[]){
 const a=resolveAnchor(d.anchors?.[0],entities),b=resolveAnchor(d.anchors?.[1],entities);if(!a||!b)return{...d,resolved:false};
 const dx=b.x-a.x,dy=b.y-a.y,graphicDistance=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/Math.PI;
 let measuredGraphic=graphicDistance;if(d.dimensionType==='horizontal')measuredGraphic=Math.abs(dx);if(d.dimensionType==='vertical'||d.dimensionType==='elevation')measuredGraphic=Math.abs(dy);if(d.dimensionType==='angular')measuredGraphic=Math.abs(angle);
 const engineeringDefined=Number.isFinite(d.engineeringValue),value=engineeringDefined?d.engineeringValue:null,label=engineeringDefined?`${d.prefix||''}${value.toFixed(d.precision??0)} ${d.unit||''}${d.suffix||''}`.trim():'DIMENSÃO NÃO DEFINIDA';
 const bb=boundsFromPoints([a,b],Math.abs(d.offset||28)+18);return{...d,resolved:true,a,b,graphicDistance,graphicMeasurement:measuredGraphic,angle,engineeringDefined,label,x:bb.minX,y:bb.minY,width:bb.maxX-bb.minX,height:bb.maxY-bb.minY};
}
export function createElevation(id,anchor,opts={}){return{id,kind:'elevation',name:'Elevação',anchor,elevation:finite(opts.elevation,null),unit:opts.unit||'mm',datum:opts.datum||'',reference:opts.reference||'',prefix:opts.prefix||'EL.',x:0,y:0,width:88,height:30,rotation:0}}
export function resolveElevation(e,entities=[]){const p=resolveAnchor(e.anchor,entities);if(!p)return{...e,resolved:false};const label=Number.isFinite(e.elevation)?`${e.prefix||'EL.'} ${e.elevation.toFixed(0)} ${e.unit}`:`${e.prefix||'EL.'} —`;return{...e,resolved:true,point:p,label,x:p.x+12,y:p.y-34,width:104,height:28}}
export function createIndustrialCoordinate(id,anchor,opts={}){return{id,kind:'industrial-coordinate',name:'Coordenada industrial',anchor,n:finite(opts.n,null),e:finite(opts.e,null),xCoord:finite(opts.x,null),yCoord:finite(opts.y,null),z:finite(opts.z,null),datum:opts.datum||'',reference:opts.reference||'',coordinateSystem:'INDUSTRIAL',x:0,y:0,width:145,height:62,rotation:0}}
export function resolveIndustrialCoordinate(c,entities=[]){const p=resolveAnchor(c.anchor,entities);if(!p)return{...c,resolved:false};return{...c,resolved:true,point:p,x:p.x+14,y:p.y+12,width:150,height:72}}
export function createFlowArrow(id,runId,segmentIndex,opts={}){return{id,kind:'flow-arrow',name:'Fluxo',runId,segmentIndex:Number(segmentIndex),t:Math.max(0,Math.min(1,finite(opts.t,.5))),direction:opts.direction===-1?-1:1,offset:finite(opts.offset,0),x:0,y:0,width:50,height:24,rotation:0}}
export function resolveFlowArrow(f,entities=[]){const run=entities.find(e=>e.id===f.runId&&isPipeRun(e));if(!run||f.segmentIndex<0||f.segmentIndex>=run.points.length-1)return{...f,resolved:false};const a=run.points[f.segmentIndex],b=run.points[f.segmentIndex+1],base=midpoint(a,b,f.t),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,point={x:base.x+nx*f.offset,y:base.y+ny*f.offset},angle=Math.atan2(dy,dx)*180/Math.PI+(f.direction===-1?180:0);return{...f,resolved:true,point,angle,x:point.x-25,y:point.y-12,width:50,height:24,rotation:angle}}
export function reverseFlowArrow(f){return{...f,direction:f.direction===-1?1:-1}}
export function createNorthArrow(id,opts={}){return{id,kind:'north-arrow',name:'Norte',sheetId:opts.sheetId||'SHEET-1',associatedToSheet:true,x:finite(opts.x,80),y:finite(opts.y,80),width:52,height:76,rotation:finite(opts.rotation,0),style:opts.style||'standard',label:opts.label||'N'}}
export function rotateNorthArrow(n,rotation){return{...n,rotation:finite(rotation,n.rotation)}}
export function resolveDocumentationEntity(e,entities=[]){if(e.kind==='dimension')return resolveDimension(e,entities);if(e.kind==='elevation')return resolveElevation(e,entities);if(e.kind==='industrial-coordinate')return resolveIndustrialCoordinate(e,entities);if(e.kind==='flow-arrow')return resolveFlowArrow(e,entities);return e}
export function validateDocumentationEntity(e,entities=[]){const issues=[];if(!DOCUMENTATION_KINDS.includes(e?.kind))issues.push({severity:'ERROR',code:'DOC_KIND'});const r=resolveDocumentationEntity(e,entities);if(r.resolved===false)issues.push({severity:'WARNING',code:'BROKEN_ASSOCIATION'});if(e.kind==='dimension'&&!Number.isFinite(e.engineeringValue))issues.push({severity:'INFO',code:'ENGINEERING_DIMENSION_UNDEFINED'});if(e.kind==='industrial-coordinate'&&('lat'in e||'lon'in e||'gps'in e))issues.push({severity:'ERROR',code:'GPS_MUST_BE_SEPARATE'});return{valid:!issues.some(i=>i.severity==='ERROR'),issues}}
