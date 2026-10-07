export const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const createViewport=(overrides={})=>({zoom:1,panX:0,panY:0,minZoom:.25,maxZoom:4,...overrides});
export function worldToScreen(p,v){return{x:p.x*v.zoom+v.panX,y:p.y*v.zoom+v.panY}}
export function screenToWorld(p,v){return{x:(p.x-v.panX)/v.zoom,y:(p.y-v.panY)/v.zoom}}
export function zoomAt(v,nextZoom,screenPoint){
 const z=clamp(nextZoom,v.minZoom,v.maxZoom); const w=screenToWorld(screenPoint,v);
 return {...v,zoom:z,panX:screenPoint.x-w.x*z,panY:screenPoint.y-w.y*z};
}
export function panBy(v,dx,dy){return{...v,panX:v.panX+dx,panY:v.panY+dy}}
export function fitBounds(bounds,viewportSize,padding=48,limits={minZoom:.25,maxZoom:4}){
 const bw=Math.max(1,bounds.maxX-bounds.minX),bh=Math.max(1,bounds.maxY-bounds.minY);
 const zoom=clamp(Math.min((viewportSize.width-2*padding)/bw,(viewportSize.height-2*padding)/bh),limits.minZoom,limits.maxZoom);
 const panX=(viewportSize.width-bw*zoom)/2-bounds.minX*zoom;
 const panY=(viewportSize.height-bh*zoom)/2-bounds.minY*zoom;
 return {zoom,panX,panY,minZoom:limits.minZoom,maxZoom:limits.maxZoom};
}
