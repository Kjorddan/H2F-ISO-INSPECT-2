export const PERFORMANCE_BUDGETS = Object.freeze({
  dragLatencyMs: 16.7,
  selectionLatencyMs: 50,
  zoomLatencyMs: 50,
  loadMs: 2000,
  saveMs: 1000,
  fpsFloor: 50,
  elementBenchmarks: [1000, 5000, 10000, 20000]
});

export function createPerformanceSample(input = {}) {
  return {
    elementCount: Number(input.elementCount || 0),
    fps: Number(input.fps || 0),
    dragLatencyMs: Number(input.dragLatencyMs || 0),
    selectionLatencyMs: Number(input.selectionLatencyMs || 0),
    zoomLatencyMs: Number(input.zoomLatencyMs || 0),
    loadMs: Number(input.loadMs || 0),
    saveMs: Number(input.saveMs || 0),
    memoryBytes: Number(input.memoryBytes || 0),
    documentBytes: Number(input.documentBytes || 0)
  };
}

export function evaluatePerformance(sample, budgets = PERFORMANCE_BUDGETS) {
  const checks = {
    fps: sample.fps >= budgets.fpsFloor,
    drag: sample.dragLatencyMs <= budgets.dragLatencyMs,
    selection: sample.selectionLatencyMs <= budgets.selectionLatencyMs,
    zoom: sample.zoomLatencyMs <= budgets.zoomLatencyMs,
    load: sample.loadMs <= budgets.loadMs,
    save: sample.saveMs <= budgets.saveMs
  };
  return { pass: Object.values(checks).every(Boolean), checks, sample, budgets };
}

export function createSpatialHash(cellSize = 128) {
  if (!(cellSize > 0)) throw new Error('cellSize deve ser positivo');
  const cells = new Map();
  const key = (x, y) => `${Math.floor(x / cellSize)}:${Math.floor(y / cellSize)}`;
  return {
    cellSize,
    clear() { cells.clear(); },
    insert(entity) {
      const b = entity.bounds;
      if (!b) throw new Error('Entidade sem bounds');
      const x0 = Math.floor(b.x / cellSize), x1 = Math.floor((b.x + b.width) / cellSize);
      const y0 = Math.floor(b.y / cellSize), y1 = Math.floor((b.y + b.height) / cellSize);
      for (let x=x0;x<=x1;x++) for (let y=y0;y<=y1;y++) {
        const k = `${x}:${y}`; if (!cells.has(k)) cells.set(k, new Map()); cells.get(k).set(entity.id, entity);
      }
    },
    query(rect) {
      const out = new Map();
      const x0 = Math.floor(rect.x / cellSize), x1 = Math.floor((rect.x + rect.width) / cellSize);
      const y0 = Math.floor(rect.y / cellSize), y1 = Math.floor((rect.y + rect.height) / cellSize);
      for (let x=x0;x<=x1;x++) for (let y=y0;y<=y1;y++) for (const [id,e] of (cells.get(`${x}:${y}`)||[])) {
        const b=e.bounds; if (b.x <= rect.x+rect.width && b.x+b.width >= rect.x && b.y <= rect.y+rect.height && b.y+b.height >= rect.y) out.set(id,e);
      }
      return [...out.values()];
    },
    size() { return cells.size; }
  };
}

export function redactLogPayload(value) {
  const forbidden = /password|senha|token|secret|authorization|cookie/i;
  const walk = (v) => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k,val]) => [k, forbidden.test(k) ? '[REDACTED]' : walk(val)]));
    return v;
  };
  return walk(value);
}

export function validateUploadDescriptor(file, policy = {}) {
  const allowedMime = policy.allowedMime || ['image/png','image/jpeg','image/svg+xml','application/pdf','application/json'];
  const maxBytes = policy.maxBytes || 50 * 1024 * 1024;
  const errors = [];
  if (!allowedMime.includes(file.mime)) errors.push('MIME não permitido');
  if (file.size > maxBytes) errors.push('Arquivo excede o tamanho permitido');
  if (!file.extension || !String(file.name||'').toLowerCase().endsWith(String(file.extension).toLowerCase())) errors.push('Extensão inconsistente');
  if (file.magicValid === false) errors.push('Magic bytes inválidos');
  return { valid: errors.length === 0, errors, private: true, antimalwareRequired: true };
}

export function securityBaseline() {
  return Object.freeze({
    mfa: true, secureSessions: true, httpOnlyCookies: true, secureCookies: true,
    sameSite: true, csrf: true, cors: true, csp: true, rateLimit: true,
    rbac: true, tenantIsolation: true, idorProtection: true,
    privateStorage: true, signedUrls: true, antimalwarePipeline: true,
    noSecretsInLogs: true
  });
}

export function createAuditEvent({action, actorId, targetId=null, metadata={}}) {
  const allowed = ['LOGIN','REVISION','APPROVAL','EXPORT','CRITICAL_CHANGE','UPLOAD','AI_APPLIED'];
  if (!allowed.includes(action)) throw new Error('Ação de auditoria não suportada');
  if (!actorId) throw new Error('actorId obrigatório');
  return Object.freeze({ id: crypto.randomUUID(), action, actorId, targetId, metadata: redactLogPayload(metadata), at: new Date().toISOString() });
}

export function createRecoverySnapshot(document, reason='PERIODIC') {
  if (!document) throw new Error('Documento obrigatório');
  return Object.freeze({ id: crypto.randomUUID(), reason, createdAt: new Date().toISOString(), document: structuredClone(document), recovered: false });
}

export function recoveryPrompt(snapshot) {
  return snapshot ? 'Encontramos uma versão não salva. Deseja recuperar?' : null;
}

export function safeUserError(error) {
  const message = error instanceof Error ? error.message : String(error || 'Erro desconhecido');
  return { title: 'Não foi possível concluir a operação', message, technicalDetailsVisible: false };
}

export function validateCriticalSecurityConfig(config) {
  const required = ['mfa','secureSessions','httpOnlyCookies','secureCookies','sameSite','csrf','cors','csp','rateLimit','rbac','tenantIsolation','idorProtection'];
  const missing = required.filter(k => config?.[k] !== true);
  return { valid: missing.length === 0, missing };
}
