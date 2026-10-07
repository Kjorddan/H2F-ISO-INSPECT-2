const EPS=1e-9;
const clonePoint=p=>({x:Number(p.x),y:Number(p.y)});
export function createPolyline(id,points=[],props={}){
  if(!id)throw new Error('Polyline id is required');
  if(points.length<2)throw new Error('Polyline requires at least 2 points');
  return {id,kind:'polyline',name:props.name||id,points:points.map(clonePoint),closed:Boolean(props.closed),...props};
}
export function polylineBounds(line){
  if(!line?.points?.length)return null;
  const xs=line.points.map(p=>p.x),ys=line.points.map(p=>p.y);
  return {minX:Math.min(...xs),minY:Math.min(...ys),maxX:Math.max(...xs),maxY:Math.max(...ys)};
}
export function polylineLength(line){
  let total=0;for(let i=0;i<line.points.length-1;i++)total+=Math.hypot(line.points[i+1].x-line.points[i].x,line.points[i+1].y-line.points[i].y);
  if(line.closed&&line.points.length>2)total+=Math.hypot(line.points[0].x-line.points.at(-1).x,line.points[0].y-line.points.at(-1).y);
  return total;
}
export function pointSegmentProjection(p,a,b){
  const vx=b.x-a.x,vy=b.y-a.y,l2=vx*vx+vy*vy;
  if(l2<EPS)return {point:clonePoint(a),t:0,distance:Math.hypot(p.x-a.x,p.y-a.y)};
  const t=Math.max(0,Math.min(1,((p.x-a.x)*vx+(p.y-a.y)*vy)/l2));
  const q={x:a.x+t*vx,y:a.y+t*vy};
  return {point:q,t,distance:Math.hypot(p.x-q.x,p.y-q.y)};
}
export function nearestSegment(line,p){
  let best=null;
  for(let i=0;i<line.points.length-1;i++){
    const hit=pointSegmentProjection(p,line.points[i],line.points[i+1]);
    if(!best||hit.distance<best.distance)best={...hit,index:i};
  }
  if(line.closed&&line.points.length>2){const i=line.points.length-1,hit=pointSegmentProjection(p,line.points[i],line.points[0]);if(!best||hit.distance<best.distance)best={...hit,index:i,closing:true}}
  return best;
}
export function hitTestPolyline(line,p,tolerance=6){const h=nearestSegment(line,p);return h&&h.distance<=tolerance?h:null}
export function addWaypoint(line,segmentIndex,point){
  if(segmentIndex<0||segmentIndex>=line.points.length-1)throw new RangeError('Invalid segment index');
  const points=line.points.map(clonePoint);points.splice(segmentIndex+1,0,clonePoint(point));return {...line,points};
}
export function addWaypointProjected(line,segmentIndex,p){
  if(segmentIndex<0||segmentIndex>=line.points.length-1)throw new RangeError('Invalid segment index');
  return addWaypoint(line,segmentIndex,pointSegmentProjection(p,line.points[segmentIndex],line.points[segmentIndex+1]).point);
}
export function moveWaypoint(line,index,point){
  if(index<0||index>=line.points.length)throw new RangeError('Invalid waypoint index');
  const points=line.points.map(clonePoint);points[index]=clonePoint(point);return {...line,points};
}
export function removeWaypoint(line,index){
  if(line.points.length<=2)return line;
  if(index<0||index>=line.points.length)throw new RangeError('Invalid waypoint index');
  const points=line.points.map(clonePoint);points.splice(index,1);return {...line,points};
}
export function movePolyline(line,dx,dy){return {...line,points:line.points.map(p=>({x:p.x+dx,y:p.y+dy}))}}
export function moveSegment(line,segmentIndex,dx,dy){
  if(segmentIndex<0||segmentIndex>=line.points.length-1)throw new RangeError('Invalid segment index');
  const points=line.points.map(clonePoint);
  points[segmentIndex]={x:points[segmentIndex].x+dx,y:points[segmentIndex].y+dy};
  points[segmentIndex+1]={x:points[segmentIndex+1].x+dx,y:points[segmentIndex+1].y+dy};
  return {...line,points};
}
export function translatePolylineTo(line,delta){return movePolyline(line,delta.x,delta.y)}
export function polylineToPath(line){if(!line?.points?.length)return'';return line.points.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ')+(line.closed?' Z':'')}
