import{test,expect}from'@playwright/test';
import{readFile,writeFile,mkdir}from'node:fs/promises';
import{createDocument,addSheet,createRevisionSnapshot,appendRevision}from'../../src/editor-core/document-structure.js';
import{ux08NewTable,ux08AddTable}from'../../src/editor-core/ux08-sheet-layout.js';
import{createInspectionStore,createNDT,addNDT}from'../../src/editor-core/inspection.js';
const start=async(page)=>{await page.goto('/');await page.evaluate(()=>localStorage.clear());await page.reload();await page.getByRole('button',{name:'PDF / Impressão UX-09'}).click();await expect(page.locator('[data-testid="ux09-document-dialog"]')).toBeVisible()};
const load=async(page,doc,inspection=createInspectionStore(),entities=[])=>{
 await page.goto('/');await page.evaluate(()=>localStorage.clear());await page.reload();
 await page.locator('input.hiddenFileInput[accept*=".h2fiso"]').setInputFiles({name:'ux09-case.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({documentModel:doc,entities,inspectionStore:inspection}))});
 await page.getByRole('button',{name:'PDF / Impressão UX-09'}).click();
 await expect(page.locator('[data-testid="ux09-document-dialog"]')).toBeVisible();
};
test('print dialog lists active A3 sheet without inventing signatures',async({page})=>{
 await start(page);
 await expect(page.locator('[data-testid="ux09-plan-page"]')).toHaveCount(1);
 await expect(page.getByLabel('Área da impressão')).toHaveValue('ALL_SHEETS');
 await expect(page.getByLabel('Modo de emissão')).toHaveValue('PREVIEW');
 await expect(page.locator('[data-testid="ux09-page-list"]')).toContainText('420 × 297 mm');
 await expect(page.locator('[data-testid="ux09-controlled-gate"]')).toContainText('bloqueada');
 await page.screenshot({path:'test-results/ux09-document-dialog-a3.png',fullPage:true});
});
test('multisheet print dialog lists both sheets with individual sizes and can select current',async({page})=>{
 let d=addSheet(createDocument());d.sheets[0].format='A4';d.sheets[0].orientation='portrait';d.sheets[1].format='A3';
 await load(page,d);
 await expect(page.locator('[data-testid="ux09-plan-page"]')).toHaveCount(2);
 await expect(page.locator('[data-testid="ux09-page-list"]')).toContainText('210 × 297 mm');
 await expect(page.locator('[data-testid="ux09-page-list"]')).toContainText('420 × 297 mm');
 await page.getByLabel('Área da impressão').selectOption('CURRENT_SHEET');
 await expect(page.locator('[data-testid="ux09-plan-page"]')).toHaveCount(1);
 await page.screenshot({path:'test-results/ux09-multipage-size-plan.png',fullPage:true});
});
test('large END table receives continuation pages with all planned rows',async({page})=>{
 let d=ux08AddTable(createDocument(),'SHEET-1',ux08NewTable('END','T-END',{maxRows:5}));
 let s=createInspectionStore();for(let i=0;i<14;i++)s=addNDT(s,createNDT({id:'N-'+i,method:'UT',target:{kind:'pipe-segment',id:'S-001'}}));
 await load(page,d,s);
 await expect(page.locator('[data-testid="ux09-plan-page"]')).toHaveCount(3);
 await expect(page.locator('[data-testid="ux09-page-list"]')).toContainText('Linhas 11–14');
 await page.screenshot({path:'test-results/ux09-table-continuation-plan.png',fullPage:true});
 await page.getByLabel('Gerar páginas de continuação para tabelas grandes').uncheck();
 await expect(page.locator('[data-testid="ux09-plan-page"]')).toHaveCount(1);
 await expect(page.locator('.ux09Warnings')).toContainText('9 linha');
});
test('controlled export blocked for draft document',async({page})=>{
 await start(page);await page.getByLabel('Modo de emissão').selectOption('CONTROLLED');
 await expect(page.getByRole('button',{name:'Gerar PDF único'})).toBeDisabled();
 await expect(page.getByRole('button',{name:'Abrir para imprimir'})).toBeDisabled();
});
test('valid approved snapshot enables unsigned controlled release',async({page})=>{
 let d={...createDocument(),revisionState:'APROVADO'};
 d=appendRevision(d,await createRevisionSnapshot(d,[],{revision:'A',state:'APROVADO'}));
 await load(page,d);
 await page.getByLabel('Modo de emissão').selectOption('CONTROLLED');
 await expect(page.locator('[data-testid="ux09-controlled-gate"]')).toContainText('SHA-256 correspondente');
 await expect(page.getByRole('button',{name:'Gerar PDF único'})).toBeEnabled();
 await page.screenshot({path:'test-results/ux09-controlled-hash-gate.png',fullPage:true});
});
test('draft one-page PDF downloads as genuine PDF file, not editor screenshot',async({page})=>{
 test.setTimeout(120000);
 await start(page);
 const downloadEvent=page.waitForEvent('download',{timeout:90000});
 await page.getByRole('button',{name:'Gerar PDF único'}).click();
 const download=await downloadEvent;
 expect(download.suggestedFilename()).toMatch(/PREVIA_COMPLETO\.pdf$/);
 const bytes=await readFile(await download.path());
 expect(bytes.subarray(0,5).toString('ascii')).toBe('%PDF-');
 expect(bytes.length).toBeGreaterThan(1800);
 await mkdir('test-results',{recursive:true});await writeFile('test-results/ux09-actual-one-page.pdf',bytes);
 expect((bytes.toString('latin1').match(/\\/Type\\s*\\/Page\\s/g)||[]).length).toBe(1);
 await expect(page.locator('.ux09Error[role="status"]')).not.toContainText('Falha');
});
test('multisheet PDF downloads a single file and reuses sheet plan',async({page})=>{
 test.setTimeout(120000);
 let d=addSheet(createDocument());d.sheets[0].format='A4';d.sheets[0].orientation='portrait';
 await load(page,d);await expect(page.locator('[data-testid="ux09-plan-page"]')).toHaveCount(2);
 const evt=page.waitForEvent('download',{timeout:90000});
 await page.getByRole('button',{name:'Gerar PDF único'}).click();
 const file=await evt;const bytes=await readFile(await file.path());
 expect(bytes.subarray(0,5).toString('ascii')).toBe('%PDF-');
 await mkdir('test-results',{recursive:true});await writeFile('test-results/ux09-actual-mixed-formats.pdf',bytes);
 expect((bytes.toString('latin1').match(/\\/Type\\s*\\/Page\\s/g)||[]).length).toBe(2);
 await page.screenshot({path:'test-results/ux09-multipage-pdf-download.png',fullPage:true});
});
test('print action opens a browser PDF viewer instead of printing CAD controls',async({page,context})=>{
 test.setTimeout(120000);
 await start(page);
 const ev=context.waitForEvent('page',{timeout:90000});
 await page.getByRole('button',{name:'Abrir para imprimir'}).click();
 const pdfTab=await ev;
 await expect(page.getByText('PDF aberto para impressão')).toBeVisible({timeout:90000});
 await pdfTab.close();
});
