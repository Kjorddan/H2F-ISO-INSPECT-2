import assert from'node:assert/strict';
import{createSelection,selectOnly,toggleSelection,selectionBounds,entityBounds,hitTestEntity,hitTestEntities,normalizeRect,selectByRect,moveSelection,handlePositions,resizeSelection,rotateSelection}from'../src/editor-core/selection.js';
let n=0;const ok=(name,fn)=>{fn();n++;console.log('PASS',name)};
const E=[{id:'a',x:10,y:10,width:40,height:20,rotation:0},{id:'b',x:80,y:20,width:30,height:30,rotation:0},{id:'c',x:150,y:50,width:40,height:20,rotation:30}];
ok('selection unique',()=>assert.deepEqual(createSelection(['a','a','b']).ids,['a','b']));
ok('select only',()=>assert.deepEqual(selectOnly(createSelection(['b']),'a').ids,['a']));
ok('toggle adds/removes',()=>{let s=toggleSelection(createSelection(['a']),'b');assert.deepEqual(s.ids,['a','b']);s=toggleSelection(s,'a');assert.deepEqual(s.ids,['b'])});
ok('bounds multi',()=>assert.deepEqual(selectionBounds(E,['a','b']),{minX:10,minY:10,maxX:110,maxY:50}));
ok('hit test normal',()=>assert.equal(hitTestEntity(E[0],{x:20,y:20}),true));
ok('hit test rotated',()=>assert.equal(hitTestEntity(E[2],{x:170,y:60}),true));
ok('topmost hit',()=>{const x=[...E,{id:'d',x:5,y:5,width:30,height:30,rotation:0}];assert.equal(hitTestEntities(x,{x:20,y:20}).id,'d')});
ok('normalize marquee',()=>assert.deepEqual(normalizeRect({x:30,y:40},{x:10,y:5}),{minX:10,minY:5,maxX:30,maxY:40}));
ok('marquee contain',()=>assert.deepEqual(selectByRect(E,{minX:0,minY:0,maxX:120,maxY:60},'contain'),['a','b']));
ok('move multi',()=>{const m=moveSelection(E,['a','b'],5,-3);assert.equal(m[0].x,15);assert.equal(m[1].y,17);assert.equal(m[2].x,150)});
ok('handles include rotate',()=>assert(handlePositions(selectionBounds(E,['a'])).rotate.y<10));
ok('resize east changes width',()=>{const b=selectionBounds(E,['a']);const m=resizeSelection(E,['a'],'e',{x:70,y:20},b);assert.equal(Math.round(m[0].width),60);assert.equal(Math.round(m[0].x),10)});
ok('resize multi scales centers',()=>{const b=selectionBounds(E,['a','b']);const m=resizeSelection(E,['a','b'],'se',{x:210,y:90},b);assert(m[1].x>80);assert(m[0].width>40)});
ok('rotate selection',()=>{const b=selectionBounds(E,['a']);const m=rotateSelection(E,['a'],b,{x:30,y:-20},{x:60,y:20});assert(Math.abs(m[0].rotation)>1)});
console.log(`SELECTION_TESTS_PASS=${n}`);

// FASE 7 regression: polyline participates in selection geometry and transforms
{
 const pl={id:'PL',kind:'polyline',points:[{x:0,y:0},{x:100,y:0},{x:100,y:50}]};
 const b=entityBounds(pl);assert.deepEqual(b,{minX:0,minY:0,maxX:100,maxY:50});
 const moved=moveSelection([pl],['PL'],10,20)[0];assert.deepEqual(moved.points[0],{x:10,y:20});
 console.log('PASS polyline selection integration');
}
