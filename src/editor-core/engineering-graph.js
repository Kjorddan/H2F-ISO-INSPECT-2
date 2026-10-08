const copy=o=>typeof structuredClone==='function'?structuredClone(o):JSON.parse(JSON.stringify(o));
export function createEngineeringGraph(){return{schemaVersion:'0.34.0',nodes:{},ports:{},edges:{},connections:{},attachments:{},mounts:{},runs:{},components:{},meta:{nextConnectionSeq:1,nextAttachmentSeq:1}}}
const endpointPort=(run,side,nodeId)=>({id:`${run.id}-PORT-${side}`,ownerId:run.id,nodeId,role:side==='START'?'source-end':'target-end',kind:'pipe-end',direction:null,nominalSize:run.engineering.nominalSize||'',spec:run.engineering.spec||'',connectedConnectionId:null});
export function registerPipeRun(graph,run){
 let g=copy(graph);return syncPipeRun(g,run);
}
export function syncPipeRun(graph,run){
 let g=copy(graph);const old=g.runs[run.id];
 if(old){for(const id of old.nodeIds||[])delete g.nodes[id];for(const id of old.edgeIds||[])delete g.edges[id];for(const id of old.portIds||[])if(!g.ports[id]?.connectedConnectionId)delete g.ports[id]}
 const nodeIds=run.vertexIds.map((id,i)=>{g.nodes[id]={id,kind:i===0||i===run.vertexIds.length-1?'pipe-endpoint':'pipe-vertex',ownerRunId:run.id};return id});
 const edgeIds=run.segments.map(s=>{g.edges[s.id]={id:s.id,kind:'pipe-segment',runId:run.id,source:s.startVertexId,target:s.endVertexId,physicalLength:s.physicalLength,properties:{...s.properties}};return s.id});
 g.attachments=g.attachments||{};g.meta.nextAttachmentSeq=g.meta.nextAttachmentSeq||1;g.mounts=g.mounts||{};
 for(const m of Object.values(g.mounts||{})){const edge=g.edges[m.segmentId];if(edge){m.source=edge.source;m.target=edge.target}else if((old?.edgeIds||[]).includes(m.segmentId))delete g.mounts[m.id]}
 for(const a of Object.values(g.attachments)){
  const edge=g.edges[a.segmentId];
  if(edge){a.source=edge.source;a.target=edge.target}
  else if((old?.edgeIds||[]).includes(a.segmentId))g=detachAttachment(g,a.id);
 }
 const startId=`${run.id}-PORT-START`,endId=`${run.id}-PORT-END`;
 const existingStart=g.ports[startId],existingEnd=g.ports[endId];
 g.ports[startId]={...endpointPort(run,'START',run.vertexIds[0]),connectedConnectionId:existingStart?.connectedConnectionId||null};
 g.ports[endId]={...endpointPort(run,'END',run.vertexIds.at(-1)),connectedConnectionId:existingEnd?.connectedConnectionId||null};
 for(const pid of[startId,endId]){const cid=g.ports[pid].connectedConnectionId,c=cid?g.connections[cid]:null;if(c){if(c.sourcePortId===pid)c.source=g.ports[pid].nodeId;if(c.targetPortId===pid)c.target=g.ports[pid].nodeId}}
 g.runs[run.id]={id:run.id,kind:'pipe-run',engineering:{...run.engineering},nodeIds,edgeIds,portIds:[startId,endId]};
 return g;
}

export function registerComponent(graph,component){
 const g=copy(graph);if(!component?.id)throw new Error('Component id required');
 if(g.components[component.id])throw new Error('Component already registered');
 const nodeId=`${component.id}-NODE`;g.nodes[nodeId]={id:nodeId,kind:'component',ownerComponentId:component.id};
 const ports=(component.ports||[]).map((p,i)=>({id:`${component.id}-PORT-${p.id||`P${i+1}`}`,ownerId:component.id,nodeId,role:p.role||'process',kind:'component-port',direction:p.direction||null,nominalSize:component.engineering?.nominalSize||'',spec:component.engineering?.spec||'',connectedConnectionId:null,attachedAttachmentId:null}));
 for(const port of ports)g.ports[port.id]=port;
 g.components[component.id]={id:component.id,kind:'component',symbolId:component.symbolId||'',componentType:component.componentType||component.symbolId||'',nodeId,portIds:ports.map(p=>p.id),engineering:{...(component.engineering||{})}};
 return g;
}
export function unregisterComponent(graph,componentId){
 let g=copy(graph),c=g.components[componentId];if(!c)return g;
 for(const m of Object.values(g.mounts||{}))if(m.componentId===componentId)delete g.mounts[m.id];
 for(const pid of c.portIds||[]){const cid=g.ports[pid]?.connectedConnectionId,aid=g.ports[pid]?.attachedAttachmentId;if(cid)g=disconnectConnection(g,cid);if(aid)g=detachAttachment(g,aid);delete g.ports[pid]}
 if(c.nodeId)delete g.nodes[c.nodeId];delete g.components[componentId];return g;
}

export function unregisterPipeRun(graph,runId){
 let g=copy(graph),run=g.runs[runId];if(!run)return g;
 for(const pid of run.portIds||[]){const cid=g.ports[pid]?.connectedConnectionId;if(cid)g=disconnectConnection(g,cid);delete g.ports[pid]}
 for(const eid of run.edgeIds||[]){for(const m of Object.values(g.mounts||{}))if(m.segmentId===eid)delete g.mounts[m.id];for(const a of Object.values(g.attachments||{}))if(a.segmentId===eid)g=detachAttachment(g,a.id);delete g.edges[eid]}for(const id of run.nodeIds||[])delete g.nodes[id];delete g.runs[runId];return g;
}
export function connectPorts(graph,sourcePortId,targetPortId,props={}){
 if(sourcePortId===targetPortId)throw new Error('Cannot connect a port to itself');
 const g=copy(graph),a=g.ports[sourcePortId],b=g.ports[targetPortId];if(!a||!b)throw new Error('Unknown port');
 if(a.connectedConnectionId||b.connectedConnectionId)throw new Error('Port already connected');
 const id=props.id||`CONN-${String(g.meta.nextConnectionSeq++).padStart(4,'0')}`;
 g.connections[id]={id,kind:props.kind||'physical',sourcePortId,targetPortId,source:a.nodeId,target:b.nodeId,properties:{...(props.properties||{})}};
 g.ports[sourcePortId].connectedConnectionId=id;g.ports[targetPortId].connectedConnectionId=id;return g;
}

export function attachComponentToPipeSegment(graph,componentPortId,segmentId,props={}){
 const g=copy(graph);g.attachments=g.attachments||{};g.meta.nextAttachmentSeq=g.meta.nextAttachmentSeq||1;
 const port=g.ports[componentPortId],edge=g.edges[segmentId];
 if(!port)throw new Error('Unknown component port');
 if(!edge)throw new Error('Unknown pipe segment');
 if(port.attachedAttachmentId||port.connectedConnectionId)throw new Error('Port already connected or attached');
 const id=props.id||`ATT-${String(g.meta.nextAttachmentSeq++).padStart(4,'0')}`;
 g.attachments[id]={id,kind:props.kind||'pipe-attachment',componentPortId,segmentId,componentNodeId:port.nodeId,source:edge.source,target:edge.target,properties:{...(props.properties||{})}};
 g.ports[componentPortId].attachedAttachmentId=id;
 return g;
}
// Mechanical/measurement mount: records proximity by explicit user action, never process continuity.
export function mountComponentToPipeSegment(graph,componentId,segmentId,properties={}){
 const g=copy(graph);g.mounts=g.mounts||{};
 const component=g.components?.[componentId],edge=g.edges?.[segmentId];
 if(!component)throw new Error('Mount requires registered component');
 if(!edge)throw new Error('Mount requires valid host PipeSegment');
 if(Object.values(g.mounts).some(m=>m.componentId===componentId))throw new Error('Component already mounted');
 const id=properties.id||`MNT-${componentId}`;
 if(g.mounts[id])throw new Error('Duplicate mount id');
 g.mounts[id]={id,kind:properties.kind||'mechanical-mount',componentId,segmentId,source:edge.source,target:edge.target,properties:{...properties}};
 return g;
}
export function unmountComponent(graph,componentId){
 const g=copy(graph);for(const m of Object.values(g.mounts||{}))if(m.componentId===componentId)delete g.mounts[m.id];return g;
}
export function detachAttachment(graph,attachmentId){
 const g=copy(graph),a=g.attachments?.[attachmentId];if(!a)return g;
 if(g.ports[a.componentPortId])g.ports[a.componentPortId].attachedAttachmentId=null;
 delete g.attachments[attachmentId];return g;
}
export function disconnectConnection(graph,connectionId){
 const g=copy(graph),c=g.connections[connectionId];if(!c)return g;
 if(g.ports[c.sourcePortId])g.ports[c.sourcePortId].connectedConnectionId=null;if(g.ports[c.targetPortId])g.ports[c.targetPortId].connectedConnectionId=null;delete g.connections[connectionId];return g;
}
export function connectedComponent(graph,startNodeId){
 if(!graph.nodes[startNodeId])return[];const adj={};for(const id of Object.keys(graph.nodes))adj[id]=[];
 for(const e of Object.values(graph.edges)){adj[e.source]?.push(e.target);adj[e.target]?.push(e.source)}for(const c of Object.values(graph.connections)){adj[c.source]?.push(c.target);adj[c.target]?.push(c.source)}for(const a of Object.values(graph.attachments||{})){adj[a.componentNodeId]?.push(a.source,a.target);adj[a.source]?.push(a.componentNodeId);adj[a.target]?.push(a.componentNodeId)}
 const seen=new Set([startNodeId]),q=[startNodeId];while(q.length){const n=q.shift();for(const m of adj[n]||[])if(!seen.has(m)){seen.add(m);q.push(m)}}return[...seen];
}
export function areNodesConnected(graph,a,b){return connectedComponent(graph,a).includes(b)}
export function graphStats(graph){return{runs:Object.keys(graph.runs).length,nodes:Object.keys(graph.nodes).length,ports:Object.keys(graph.ports).length,pipeEdges:Object.keys(graph.edges).length,connections:Object.keys(graph.connections).length,attachments:Object.keys(graph.attachments||{}).length}}
export function graphMountStats(graph){return{mounts:Object.keys(graph.mounts||{}).length}}
export function validateEngineeringGraph(graph){
 const issues=[];
 for(const e of Object.values(graph.edges)){if(!graph.nodes[e.source])issues.push({severity:'ERROR',code:'EDGE_SOURCE_ORPHAN',entityId:e.id});if(!graph.nodes[e.target])issues.push({severity:'ERROR',code:'EDGE_TARGET_ORPHAN',entityId:e.id})}
 const portUse={};for(const p of Object.values(graph.ports)){if(!graph.nodes[p.nodeId])issues.push({severity:'ERROR',code:'PORT_NODE_ORPHAN',entityId:p.id});if(!p.connectedConnectionId&&!p.attachedAttachmentId)issues.push({severity:'INFO',code:'PORT_UNUSED',entityId:p.id})}
 for(const m of Object.values(graph.mounts||{})){if(!graph.edges[m.segmentId])issues.push({severity:'ERROR',code:'MOUNT_SEGMENT_ORPHAN',entityId:m.id});if(!graph.components[m.componentId])issues.push({severity:'ERROR',code:'MOUNT_COMPONENT_ORPHAN',entityId:m.id});}
 for(const a of Object.values(graph.attachments||{})){if(!graph.ports[a.componentPortId])issues.push({severity:'ERROR',code:'ATTACHMENT_PORT_ORPHAN',entityId:a.id});if(!graph.edges[a.segmentId])issues.push({severity:'ERROR',code:'ATTACHMENT_SEGMENT_ORPHAN',entityId:a.id});if(!graph.nodes[a.componentNodeId])issues.push({severity:'ERROR',code:'ATTACHMENT_NODE_ORPHAN',entityId:a.id})}
 for(const c of Object.values(graph.connections)){if(!graph.ports[c.sourcePortId]||!graph.ports[c.targetPortId])issues.push({severity:'ERROR',code:'CONNECTION_PORT_ORPHAN',entityId:c.id});for(const pid of[c.sourcePortId,c.targetPortId]){portUse[pid]=(portUse[pid]||0)+1;if(portUse[pid]>1)issues.push({severity:'ERROR',code:'DUPLICATE_PORT_CONNECTION',entityId:pid})}}
 return{valid:!issues.some(i=>i.severity==='ERROR'),issues};
}
