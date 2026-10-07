const DEG=Math.PI/180;
export const GRID_MODES=Object.freeze({OFF:'off',CARTESIAN:'cartesian',ISOMETRIC:'isometric'});
export const ISO_PRESETS=Object.freeze([15,22.5,30,45,60]);
export const createGridConfig=(overrides={})=>({mode:GRID_MODES.ISOMETRIC,spacing:20,angle:30,showMajor:true,majorEvery:5,adaptive:true,...overrides});
export const normalizeGridConfig=(config={})=>{
 const c=createGridConfig(config); const spacing=Math.max(1,Number(c.spacing)||20); const angle=Math.min(89,Math.max(1,Number(c.angle)||30));
 return {...c,spacing,angle,majorEvery:Math.max(2,Math.round(Number(c.majorEvery)||5))};
};
export function visibleWorldBounds(viewport,size,padPx=80){
 const z=viewport.zoom||1;return{minX:(-viewport.panX-padPx)/z,minY:(-viewport.panY-padPx)/z,maxX:(size.width-viewport.panX+padPx)/z,maxY:(size.height-viewport.panY+padPx)/z};
}
export function displaySpacing(config,zoom,minScreenPx=12){
 const c=normalizeGridConfig(config); if(!c.adaptive)return c.spacing;
 let s=c.spacing; while(s*zoom<minScreenPx)s*=2; return s;
}
function clipInfiniteLine(bounds,thetaDeg,c){
 const t=thetaDeg*DEG,d={x:Math.cos(t),y:Math.sin(t)},n={x:-Math.sin(t),y:Math.cos(t)},p0={x:n.x*c,y:n.y*c};
 const pts=[],eps=1e-8;
 const add=(x,y)=>{if(x>=bounds.minX-eps&&x<=bounds.maxX+eps&&y>=bounds.minY-eps&&y<=bounds.maxY+eps&&!pts.some(p=>Math.hypot(p.x-x,p.y-y)<1e-5))pts.push({x,y});};
 if(Math.abs(d.x)>eps){let u=(bounds.minX-p0.x)/d.x;add(bounds.minX,p0.y+u*d.y);u=(bounds.maxX-p0.x)/d.x;add(bounds.maxX,p0.y+u*d.y);}
 if(Math.abs(d.y)>eps){let u=(bounds.minY-p0.y)/d.y;add(p0.x+u*d.x,bounds.minY);u=(bounds.maxY-p0.y)/d.y;add(p0.x+u*d.x,bounds.maxY);}
 return pts.length>=2?[pts[0],pts[1]]:null;
}
function projectionRange(bounds,thetaDeg){
 const t=thetaDeg*DEG,n={x:-Math.sin(t),y:Math.cos(t)};
 const vals=[{x:bounds.minX,y:bounds.minY},{x:bounds.maxX,y:bounds.minY},{x:bounds.maxX,y:bounds.maxY},{x:bounds.minX,y:bounds.maxY}].map(p=>n.x*p.x+n.y*p.y);
 return{min:Math.min(...vals),max:Math.max(...vals)};
}
function family(bounds,theta,spacing,majorEvery,familyId){
 const range=projectionRange(bounds,theta),k0=Math.floor(range.min/spacing)-1,k1=Math.ceil(range.max/spacing)+1,out=[];
 for(let k=k0;k<=k1;k++){const seg=clipInfiniteLine(bounds,theta,k*spacing);if(seg)out.push({id:`${familyId}-${k}`,family:familyId,k,major:k%majorEvery===0,a:seg[0],b:seg[1]});}
 return out;
}
export function computeGridLines(bounds,config,zoom=1){
 const c=normalizeGridConfig(config); if(c.mode===GRID_MODES.OFF)return[]; const spacing=displaySpacing(c,zoom);
 if(c.mode===GRID_MODES.CARTESIAN)return[...family(bounds,0,spacing,c.majorEvery,'h'),...family(bounds,90,spacing,c.majorEvery,'v')];
 return[...family(bounds,0,spacing,c.majorEvery,'h'),...family(bounds,c.angle,spacing,c.majorEvery,'p'),...family(bounds,-c.angle,spacing,c.majorEvery,'n')];
}
export function nearestGridIntersection(point,config){
 const c=normalizeGridConfig(config); if(c.mode===GRID_MODES.OFF)return{...point};
 if(c.mode===GRID_MODES.CARTESIAN)return{x:Math.round(point.x/c.spacing)*c.spacing,y:Math.round(point.y/c.spacing)*c.spacing};
 // Interseção das famílias +angle e -angle; usada apenas como primitiva geométrica para fases posteriores de snap.
 const a=c.angle*DEG,s=Math.sin(a),co=Math.cos(a); if(Math.abs(s)<1e-8||Math.abs(co)<1e-8)return{...point};
 const u=(-s*point.x+co*point.y)/c.spacing,v=(s*point.x+co*point.y)/c.spacing; const ru=Math.round(u),rv=Math.round(v);
 return{x:(rv-ru)*c.spacing/(2*s),y:(ru+rv)*c.spacing/(2*co)};
}
