import{test,expect}from'@playwright/test';
import{createDocument,createRevisionSnapshot,appendRevision}from'../../src/editor-core/document-structure.js';
import{readFile,mkdir,writeFile}from'node:fs/promises';
const start=async page=>{await page.goto('/');await page.evaluate(()=>localStorage.clear());await page.reload()};
const releaseDialog=async page=>{await page.getByRole('button',{name:'PDF / Impressão UX-09'}).click();await expect(page.locator('[data-testid="ux09-document-dialog"]')).toBeVisible();await page.getByLabel('Modo de emissão').selectOption('CONTROLLED')};
const createApprovedSnapshot=async page=>{
 await page.locator('.documentPanel').getByRole('combobox').selectOption('APROVADO');
 await page.locator('.documentPanel').getByRole('button',{name:'Criar snapshot formal'}).click();
};
test('final audit panel is available and differentiates warnings from blockers',async({page})=>{
 await start(page);await page.locator('.ux10AuditPanel summary').click();
 await expect(page.locator('.ux10AuditPanel')).toContainText('Diagnóstico integrado');
 await expect(page.locator('.ux10AuditPanel')).toContainText('Bloqueios');
 await expect(page.locator('.ux10AuditPanel')).toContainText('Alertas');
 await page.screenshot({path:'test-results/ux10-integrated-audit-panel.png',fullPage:true});
});
test('approved new full-integrity snapshot passes END/evidence SHA-256 gate',async({page})=>{
 await start(page);await createApprovedSnapshot(page);await releaseDialog(page);
 await expect(page.locator('[data-testid="ux09-controlled-gate"]')).toContainText('Snapshot completo conferido');
 await expect(page.getByRole('button',{name:'Gerar PDF único'})).toBeEnabled();
 await page.screenshot({path:'test-results/ux10-controlled-release-verified.png',fullPage:true});
});
test('mutating technical titleblock after approved snapshot blocks controlled export',async({page})=>{
 await start(page);await createApprovedSnapshot(page);
 await page.getByRole('button',{name:'Formatar folha UX-08'}).click();
 await page.getByLabel('Carimbo Projeto').fill('ALTERADO DEPOIS DA APROVAÇÃO');
 await page.getByRole('button',{name:'Concluir'}).click();
 await releaseDialog(page);
 await expect(page.locator('[data-testid="ux09-controlled-gate"]')).toContainText('mudou');
 await expect(page.getByRole('button',{name:'Gerar PDF único'})).toBeDisabled();
 await page.screenshot({path:'test-results/ux10-post-approval-change-rejected.png',fullPage:true});
});
test('legacy UX09 snapshot stays readable but cannot authorize UX10 controlled PDF',async({page})=>{
 await start(page);
 let d={...createDocument(),revisionState:'APROVADO'};
 d=appendRevision(d,await createRevisionSnapshot(d,[],{revision:'A',state:'APROVADO'}));
 await page.locator('input.hiddenFileInput[accept*=".h2fiso"]').setInputFiles({name:'ux10-legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({documentModel:d,entities:[]}))});
 await releaseDialog(page);
 await expect(page.locator('[data-testid="ux09-controlled-gate"]')).toContainText('Snapshot legado');
 await expect(page.getByRole('button',{name:'Gerar PDF único'})).toBeDisabled();
});
test('preview multi-sheet PDF unaffected by controlled release requirement',async({page})=>{
 test.setTimeout(120000);await start(page);
 await page.locator('.tabs button[title="Nova folha"]').click();
 await page.getByRole('button',{name:'Formatar folha UX-08'}).click();
 await page.getByLabel('Formato da folha').selectOption('A4');
 await page.getByLabel('Orientação da folha').selectOption('portrait');
 await page.getByRole('button',{name:'Concluir'}).click();
 await page.getByRole('button',{name:'PDF / Impressão UX-09'}).click();
 await expect(page.locator('[data-testid="ux09-plan-page"]')).toHaveCount(2);
 const event=page.waitForEvent('download',{timeout:90000});
 await page.getByRole('button',{name:'Gerar PDF único'}).click();
 const f=await event,bytes=await readFile(await f.path());
 expect(bytes.subarray(0,5).toString('ascii')).toBe('%PDF-');
 expect((bytes.toString('latin1').match(/\/Type\s*\/Page\s/g)||[]).length).toBe(2);
 await mkdir('test-results',{recursive:true});await writeFile('test-results/ux10-golden-multipage-a3-a4.pdf',bytes);
 await page.screenshot({path:'test-results/ux10-golden-multipage-export.png',fullPage:true});
});
test('UX07 custom editor, UX08 sheet designer and UX09 release dialog coexist',async({page})=>{
 await start(page);
 await page.getByRole('button',{name:'＋ Novo símbolo'}).click();
 await expect(page.locator('[data-testid="ux07-shape-editor"]')).toBeVisible();
 await page.getByRole('button',{name:'Cancelar'}).click();
 await page.getByRole('button',{name:'Formatar folha UX-08'}).click();
 await expect(page.locator('[data-testid="ux08-sheet-designer"]')).toBeVisible();
 await page.getByRole('button',{name:'Concluir'}).click();
 await page.getByRole('button',{name:'PDF / Impressão UX-09'}).click();
 await expect(page.locator('[data-testid="ux09-document-dialog"]')).toBeVisible();
});


test('photo evidence is embedded in .h2fiso with SHA-256 and survives re-import',async({page})=>{
 test.setTimeout(120000);await start(page);
 const point=await page.locator('[data-testid="editor-scene"]').evaluate(svg=>{const p=svg.createSVGPoint();p.x=730;p.y=390;const q=p.matrixTransform(svg.getScreenCTM());return{x:q.x,y:q.y}});
 await page.mouse.click(point.x,point.y);
 await expect(page.locator('.evidencePanel input[type="file"]')).toBeEnabled();
 const binary=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL9VQAAAABJRU5ErkJggg==','base64');
 await page.locator('.evidencePanel input[type="file"]').setInputFiles({name:'foto-inspecao.png',mimeType:'image/png',buffer:binary});
 await expect(page.locator('.evidencePreview')).toHaveCount(1);
 const evt=page.waitForEvent('download');
 await page.getByTestId('toolbar-save').click();
 const downloaded=await evt,pkg=JSON.parse(await readFile(await downloaded.path(),'utf8'));
 const stored=pkg['document.json']?.evidenceStore?.evidence?.[0];
 expect(stored?.sourceRef).toMatch(/^data:image\/png;base64,/);
 expect(stored?.sha256).toMatch(/^[0-9a-f]{64}$/);
 await mkdir('test-results',{recursive:true});
 await writeFile('test-results/ux10-evidence-archive-descriptor.json',JSON.stringify({id:stored.id,kind:stored.kind,sha256:stored.sha256,size:binary.length,archivedInNativeDocument:stored.metadata.archivedInNativeDocument},null,2));
 await page.reload();
 await page.locator('input.hiddenFileInput[accept*=".h2fiso"]').setInputFiles({name:'foto.h2fiso',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(pkg))});
 await expect(page.locator('.evidencePanel')).toContainText('Evidências');
 await page.screenshot({path:'test-results/ux10-archived-photo-reopened.png',fullPage:true});
});
