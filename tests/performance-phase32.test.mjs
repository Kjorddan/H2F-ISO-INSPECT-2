import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {moveSelection,hitTestEntities,selectByRect} from '../src/editor-core/selection.js';

const COUNTS=[1000,5000,10000,20000];
const percentile=(arr,p)=>{const a=[...arr].sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.max(0,Math.ceil(p*a.length)-1))]||0};
const makeEntities=n=>Array.from({length:n},(_,i)=>({
  id:`E-${i}`,kind:'equipment',x:(i%200)*12,y:Math.floor(i/200)*12,width:10,height:10,rotation:0
}));
const results=[];
for(const count of COUNTS){
  const entities=makeEntities(count);
  const target=entities[Math.floor(count/2)];
  for(let i=0;i<20;i++) moveSelection(entities,[target.id],i,1);
  const drag=[];
  for(let i=0;i<120;i++){
    const t=performance.now();moveSelection(entities,[target.id],i%7,(i+1)%5);drag.push(performance.now()-t);
  }
  const hit=[];
  const point={x:target.x+5,y:target.y+5};
  for(let i=0;i<120;i++){
    const t=performance.now();hitTestEntities(entities,point,0);hit.push(performance.now()-t);
  }
  const marquee=[];
  const rect={minX:0,minY:0,maxX:2400,maxY:1200};
  for(let i=0;i<30;i++){
    const t=performance.now();selectByRect(entities,rect,'intersect');marquee.push(performance.now()-t);
  }
  const row={
    count,
    dragMedianMs:percentile(drag,.5),
    dragP95Ms:percentile(drag,.95),
    hitMedianMs:percentile(hit,.5),
    hitP95Ms:percentile(hit,.95),
    marqueeMedianMs:percentile(marquee,.5),
    marqueeP95Ms:percentile(marquee,.95)
  };
  results.push(row);
  console.log('PERF',JSON.stringify(row));
}

const byCount=Object.fromEntries(results.map(r=>[r.count,r]));
const gates={
  dragTypicalP95:byCount[5000].dragP95Ms<=16.7,
  drag20000P95:byCount[20000].dragP95Ms<=50,
  hit20000P95:byCount[20000].hitP95Ms<=50,
  marquee20000P95:byCount[20000].marqueeP95Ms<=150
};
const pass=Object.values(gates).every(Boolean);
const report={generatedAt:new Date().toISOString(),runtime:process.version,results,gates,pass};
if(process.env.PHASE32_PERF_ARTIFACT==='1')fs.writeFileSync('phase32-performance.json',JSON.stringify(report,null,2));
if(!pass)throw new Error('PHASE32 PERFORMANCE GATE FAILED '+JSON.stringify(gates));
console.log('Phase32 Performance Gate: PASS',JSON.stringify(gates));
