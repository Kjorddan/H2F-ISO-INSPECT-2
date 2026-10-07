import{polylineBounds,movePolyline}from'./polyline.js';
import{isLinearEntity,isPipeRun,movePipeRun,transformPipeRun}from'./piping.js';
const RAD=Math.PI/180;
export const HANDLE_IDS=Object.freeze(['nw','n','ne','e','se','s','sw','w','rotate']);
export const createSelection=(ids=[])=>({ids:[...new Set(ids)]});
export const isSelected=(selection,id)=>selection.ids.includes(id);
export function selectOnly(selection,id){return createSelection(id?[id]:[])}
export function toggleSelection(selection,id){return isSelected(selection,id)?createSelection(selection.ids.filter(x=>x!==id)):createSelection([...selection.ids,id])}
export function addSelection(selection,id){return isSelected(selection,id)?selection:createSelection([...selection.ids,id])}
export const clearSelection=()=>createSelection();
const center=e=>({x:e.x+e.width/2,y:e.y+e.height/2});
const rotatePoint=(p,c,a)=>{const t=a*RAD,co=Math.cos(t),s=Math.sin(t),dx=p.x-c.x,dy=p.y-c.y;return{x:c.x+dx*co-dy*s,y:c.y+dx*s+dy*co}};
export function entityCorners(e){if(isLinearEntity(e)){const b=polylineBounds(e);return[{x:b.minX,y:b.minY},{x:b.maxX,y:b.minY},{x:b.maxX,y:b.maxY},{x:b.minX,y:b.maxY}]}const c=center(e),pts=[{x:e.x,y:e.y},{x:e.x+e.width,y:e.y},{x:e.x+e.width,y:e.y+e.height},{x:e.x,y:e.y+e.height}];return(e.rotation||0)?pts.map(p=>rotatePoint(p,c,e.rotation)):pts}
export function entityBounds(e){if(isLinearEntity(e))return polylineBounds(e);const pts=entityCorners(e),xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);return{minX:Math.min(...xs),minY:Math.min(...ys),maxX:Math.max(...xs),maxY:Math.max(...ys)}}
export function selectionBounds(entities,ids){const chosen=entities.filter(e=>ids.includes(e.id));if(!chosen.length)return null;const bs=chosen.map(entityBounds).filter(Boolean);return{minX:Math.min(...bs.map(b=>b.minX)),minY:Math.min(...bs.map(b=>b.minY)),maxX:Math.max(...bs.map(b=>b.maxX)),maxY:Math.max(...bs.map(b=>b.maxY))}}
export function hitTestEntity(e,p,tolerance=0){if(isLinearEntity(e))return false;const c=center(e),q=(e.rotation||0)?rotatePoint(p,c,-e.rotation):p;return q.x>=e.x-tolerance&&q.x<=e.x+e.width+tolerance&&q.y>=e.y-tolerance&&q.y<=e.y+e.height+tolerance}
export function hitTestEntities(entities,p,tolerance=0){for(let i=entities.length-1;i>=0;i--)if(hitTestEntity(entities[i],p,tolerance))return entities[i];return null}
const intersects=(a,b)=>!(a.maxX<b.minX||a.minX>b.maxX||a.maxY<b.minY||a.minY>b.maxY);
const contains=(a,b)=>b.minX>=a.minX&&b.maxX<=a.maxX&&b.minY>=a.minY&&b.maxY<=a.maxY;
export function normalizeRect(a,b){return{minX:Math.min(a.x,b.x),minY:Math.min(a.y,b.y),maxX:Math.max(a.x,b.x),maxY:Math.max(a.y,b.y)}}
export function selectByRect(entities,rect,mode='contain'){return entities.filter(e=>mode==='intersect'?intersects(rect,entityBounds(e)):contains(rect,entityBounds(e))).map(e=>e.id)}
export function moveSelection(entities,ids,dx,dy){return entities.map(e=>ids.includes(e.id)?(isPipeRun(e)?movePipeRun(e,dx,dy):e.kind==='polyline'?movePolyline(e,dx,dy):{...e,x:e.x+dx,y:e.y+dy}):e)}
export function handlePositions(bounds,handleSizeWorld=10,rotateOffsetWorld=28){if(!bounds)return{};const cx=(bounds.minX+bounds.maxX)/2,cy=(bounds.minY+bounds.maxY)/2;return{nw:{x:bounds.minX,y:bounds.minY},n:{x:cx,y:bounds.minY},ne:{x:bounds.maxX,y:bounds.minY},e:{x:bounds.maxX,y:cy},se:{x:bounds.maxX,y:bounds.maxY},s:{x:cx,y:bounds.maxY},sw:{x:bounds.minX,y:bounds.maxY},w:{x:bounds.minX,y:cy},rotate:{x:cx,y:bounds.minY-rotateOffsetWorld},size:handleSizeWorld}}
function resizedBounds(b,h,p,minSize=12){let n={...b};if(h.includes('w'))n.minX=Math.min(p.x,n.maxX-minSize);if(h.includes('e'))n.maxX=Math.max(p.x,n.minX+minSize);if(h.includes('n'))n.minY=Math.min(p.y,n.maxY-minSize);if(h.includes('s'))n.maxY=Math.max(p.y,n.minY+minSize);return n}
export function resizeSelection(entities,ids,handle,pointer,startBounds,minSize=12){if(!startBounds||handle==='rotate')return entities;const nb=resizedBounds(startBounds,handle,pointer,minSize),ow=Math.max(1e-9,startBounds.maxX-startBounds.minX),oh=Math.max(1e-9,startBounds.maxY-startBounds.minY),nw=nb.maxX-nb.minX,nh=nb.maxY-nb.minY;return entities.map(e=>{if(!ids.includes(e.id))return e;if(isLinearEntity(e)){const tx=p=>({x:nb.minX+(p.x-startBounds.minX)/ow*nw,y:nb.minY+(p.y-startBounds.minY)/oh*nh});return isPipeRun(e)?transformPipeRun(e,tx):{...e,points:e.points.map(tx)}};const c=center(e),rx=(c.x-startBounds.minX)/ow,ry=(c.y-startBounds.minY)/oh,nc={x:nb.minX+rx*nw,y:nb.minY+ry*nh},w=Math.max(2,e.width*nw/ow),h=Math.max(2,e.height*nh/oh);return{...e,width:w,height:h,x:nc.x-w/2,y:nc.y-h/2}})}
export function angleDeg(centerPoint,p){return Math.atan2(p.y-centerPoint.y,p.x-centerPoint.x)/RAD}
export function rotateSelection(entities,ids,startBounds,startPointer,currentPointer){if(!startBounds)return entities;const c={x:(startBounds.minX+startBounds.maxX)/2,y:(startBounds.minY+startBounds.maxY)/2},delta=angleDeg(c,currentPointer)-angleDeg(c,startPointer);return entities.map(e=>{if(!ids.includes(e.id))return e;if(isLinearEntity(e)){const tx=p=>rotatePoint(p,c,delta);return isPipeRun(e)?transformPipeRun(e,tx):{...e,points:e.points.map(tx)}};const ec=center(e),nc=rotatePoint(ec,c,delta);return{...e,x:nc.x-e.width/2,y:nc.y-e.height/2,rotation:(e.rotation||0)+delta}})}
