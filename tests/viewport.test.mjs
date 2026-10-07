import assert from'node:assert/strict';import{createViewport,worldToScreen,screenToWorld,zoomAt,panBy,fitBounds}from'../src/editor-core/viewport.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let v=createViewport({zoom:2,panX:100,panY:50});let w={x:25,y:40};let s=worldToScreen(w,v);assert.deepEqual(s,{x:150,y:130});let wr=screenToWorld(s,v);close(wr.x,w.x);close(wr.y,w.y);
let anchor={x:300,y:200};let before=screenToWorld(anchor,v);let z=zoomAt(v,3,anchor);let after=screenToWorld(anchor,z);close(before.x,after.x);close(before.y,after.y);
let p=panBy(v,20,-10);assert.equal(p.panX,120);assert.equal(p.panY,40);
let f=fitBounds({minX:0,minY:0,maxX:1120,maxY:720},{width:1000,height:700},40);assert.ok(f.zoom>=.25&&f.zoom<=4);let tl=worldToScreen({x:0,y:0},f),br=worldToScreen({x:1120,y:720},f);assert.ok(tl.x>=0&&tl.y>=0&&br.x<=1000&&br.y<=700);
let capped=zoomAt(createViewport(),99,{x:0,y:0});assert.equal(capped.zoom,4);let floored=zoomAt(createViewport(),.01,{x:0,y:0});assert.equal(floored.zoom,.25);
console.log('PASS viewport core: 6 grupos de verificações');
