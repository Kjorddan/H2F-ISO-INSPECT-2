export const BETA_SEVERITY = Object.freeze(['BLOCKER','CRITICAL','MAJOR','MINOR','COSMETIC'])
export const BETA_STATUS = Object.freeze(['OPEN','IN_REVIEW','FIXED','VERIFIED','WONT_FIX'])
export const HOMOLOGATION_STATUS = Object.freeze(['PENDING','APPROVED','REJECTED','PENDING_ENVIRONMENT'])

const clone = value => JSON.parse(JSON.stringify(value))
const required = (value, name) => { if (value === undefined || value === null || value === '') throw new Error(`${name} obrigatório`); return value }
export function createBetaStore(){ return { sessions:[], feedback:[], defects:[], signoffs:[], events:[] } }
function event(store,type,payload){ store.events.push(Object.freeze({id:`evt-${store.events.length+1}`,type,payload:clone(payload)})) }

export function createBetaSession({id,participant,role,scenario,environment='CORPORATE_BETA',startedAt=new Date().toISOString()}){
  return {id:required(id,'id'),participant:required(participant,'participant'),role:required(role,'role'),scenario:required(scenario,'scenario'),environment,startedAt,endedAt:null,status:'ACTIVE'}
}
export function addBetaSession(store, session){ store.sessions.push(clone(session)); event(store,'BETA_SESSION_STARTED',{id:session.id}); return store }
export function finishBetaSession(store,id,{result,notes=''}){ const s=store.sessions.find(x=>x.id===id); if(!s) throw new Error('sessão inexistente'); s.status='FINISHED'; s.result=required(result,'result'); s.notes=notes; s.endedAt=new Date().toISOString(); event(store,'BETA_SESSION_FINISHED',{id,result}); return s }

export function addFeedback(store,{id,sessionId,category,message,rating=null}){ if(!store.sessions.some(s=>s.id===sessionId)) throw new Error('sessão inexistente'); const f={id:required(id,'id'),sessionId,category:required(category,'category'),message:required(message,'message'),rating}; store.feedback.push(f); event(store,'BETA_FEEDBACK',f); return f }
export function addDefect(store,{id,sessionId=null,title,severity='MAJOR',area,evidence=[],status='OPEN'}){ if(!BETA_SEVERITY.includes(severity)) throw new Error('severidade inválida'); if(!BETA_STATUS.includes(status)) throw new Error('status inválido'); const d={id:required(id,'id'),sessionId,title:required(title,'title'),severity,area:required(area,'area'),evidence:clone(evidence),status}; store.defects.push(d); event(store,'DEFECT_RECORDED',d); return d }
export function transitionDefect(store,id,status){ if(!BETA_STATUS.includes(status)) throw new Error('status inválido'); const d=store.defects.find(x=>x.id===id); if(!d) throw new Error('defeito inexistente'); d.status=status; event(store,'DEFECT_STATUS_CHANGED',{id,status}); return d }

export function createHomologationChecklist(items){ return items.map((item,i)=>({id:item.id||`H${i+1}`,area:required(item.area,'area'),criterion:required(item.criterion,'criterion'),status:item.status||'PENDING',evidence:item.evidence||null,notes:item.notes||''})) }
export function evaluateHomologation({checklist,defects=[]}){
  const blockers=defects.filter(d=>['BLOCKER','CRITICAL'].includes(d.severity) && !['VERIFIED','WONT_FIX'].includes(d.status))
  const rejected=checklist.filter(i=>i.status==='REJECTED')
  const pendingEnvironment=checklist.filter(i=>i.status==='PENDING_ENVIRONMENT')
  const pending=checklist.filter(i=>i.status==='PENDING')
  const approved=blockers.length===0 && rejected.length===0 && pending.length===0 && pendingEnvironment.length===0
  return {approved,blockers:blockers.length,rejected:rejected.length,pending:pending.length,pendingEnvironment:pendingEnvironment.length,status:approved?'APPROVED':rejected.length||blockers.length?'REJECTED':'PENDING_ENVIRONMENT'}
}
export function signHomologation(store,{id,actor,role,status,scope,notes=''}){ if(!HOMOLOGATION_STATUS.includes(status)) throw new Error('status de homologação inválido'); const s=Object.freeze({id:required(id,'id'),actor:required(actor,'actor'),role:required(role,'role'),status,scope:required(scope,'scope'),notes,signedAt:new Date().toISOString()}); store.signoffs.push(s); event(store,'HOMOLOGATION_SIGNOFF',s); return s }
export function betaSummary(store){ return {sessions:store.sessions.length,finished:store.sessions.filter(s=>s.status==='FINISHED').length,feedback:store.feedback.length,defects:store.defects.length,openCritical:store.defects.filter(d=>['BLOCKER','CRITICAL'].includes(d.severity)&&!['VERIFIED','WONT_FIX'].includes(d.status)).length,signoffs:store.signoffs.length} }
