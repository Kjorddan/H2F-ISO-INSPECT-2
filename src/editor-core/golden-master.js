import { createHash } from 'node:crypto'

export const GOLDEN_STATUS = Object.freeze({ PASS:'PASS', FAIL:'FAIL', PENDING_ENVIRONMENT:'PENDING_ENVIRONMENT' })

export function normalizeSvg(svg='') {
  return String(svg).replace(/>\s+</g,'><').replace(/\s+/g,' ').trim()
}
export function sha256(value='') { return createHash('sha256').update(String(value)).digest('hex') }
export function createStructuralGolden(required=[]) { return Object.freeze({kind:'STRUCTURAL', required:[...new Set(required)].sort()}) }
export function validateStructuralGolden(golden, actual=[]) {
  const set=new Set(actual); const missing=golden.required.filter(x=>!set.has(x))
  return {status:missing.length?GOLDEN_STATUS.FAIL:GOLDEN_STATUS.PASS, missing, matched:golden.required.length-missing.length, total:golden.required.length}
}
export function createVectorGolden(svg) { const normalized=normalizeSvg(svg); return Object.freeze({kind:'VECTOR', hash:sha256(normalized), normalized}) }
export function compareVectorGolden(golden, svg) { const actualHash=sha256(normalizeSvg(svg)); return {status:actualHash===golden.hash?GOLDEN_STATUS.PASS:GOLDEN_STATUS.FAIL, expectedHash:golden.hash, actualHash} }
export function createInteractionMatrix(cases=[]) { return cases.map(x=>({id:x.id,label:x.label,status:x.status||'NOT_RUN',evidence:x.evidence||null})) }
export function summarizeGoldenValidation({structural=[],vector=[],interaction=[],visual=[]}={}) {
  const all=[...structural,...vector,...interaction,...visual]
  const counts=all.reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{})
  return {total:all.length, counts, pass:counts.PASS||0, fail:counts.FAIL||0, pendingEnvironment:counts.PENDING_ENVIRONMENT||0}
}
export function validateIndustrialReferenceManifest(m) {
  const issues=[]
  if (!m || m.page_count!==9) issues.push('O Golden Dataset industrial deve conter 9 folhas.')
  if (!m?.source_sha256) issues.push('SHA-256 da referência ausente.')
  for (const p of m?.pages||[]) {
    if (!p.render_sha256) issues.push(`Folha ${p.page}: hash visual ausente.`)
    if (p.text_chars!==0) issues.push(`Folha ${p.page}: baseline esperava texto vetorizado sem extração textual.`)
  }
  return {status:issues.length?GOLDEN_STATUS.FAIL:GOLDEN_STATUS.PASS,issues}
}
export function browserVisualGate({browserAvailable=false,screenshots=0,perceptualDiffRun=false}={}) {
  if (!browserAvailable || !screenshots || !perceptualDiffRun) return {status:GOLDEN_STATUS.PENDING_ENVIRONMENT,reason:'Golden Master visual exige navegador real, screenshots e diff perceptual.'}
  return {status:GOLDEN_STATUS.PASS}
}
