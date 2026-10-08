import{test,expect}from'@playwright/test';
const open=async page=>{await page.goto('/');await page.evaluate(()=>localStorage.clear());await page.reload();await page.getByRole('button',{name:'Formatar folha UX-08'}).click();await expect(page.locator('[data-testid="ux08-sheet-designer"]')).toBeVisible()};
test('editor opens professional A3 landscape preview and title block',async({page})=>{
 await open(page);await expect(page.getByLabel('Formato da folha')).toHaveValue('A3');await expect(page.getByLabel('Orientação da folha')).toHaveValue('landscape');
 await expect(page.locator('[data-testid="ux08-layout-preview"]')).toHaveAttribute('data-ux08-format','A3');
 await expect(page.locator('[data-testid="ux08-layout-preview"] .ux08TitleBlock')).toHaveCount(1);
 await page.screenshot({path:'test-results/ux08-a3-corporate-preview.png',fullPage:true});
});
test('A4 portrait changes frame aspect and leaves CAD geometry intact',async({page})=>{
 await open(page);const frame=page.locator('[data-testid="ux08-layout-preview"] .ux08PageBoundary');
 await page.getByLabel('Formato da folha').selectOption('A4');
 await page.getByLabel('Orientação da folha').selectOption('portrait');
 await expect(page.locator('[data-testid="ux08-layout-preview"]')).toHaveAttribute('data-ux08-orientation','portrait');
 const [w,h]=await Promise.all([frame.getAttribute('width'),frame.getAttribute('height')]);
 expect(Number(h)).toBeGreaterThan(Number(w));
 await page.getByRole('button',{name:'Concluir'}).click();
 await expect(page.locator('[data-testid="ux08-sheet-overlay"]')).toHaveAttribute('data-ux08-format','A4');
 await expect(page.locator('.pipeRunEntity')).toHaveCount(1);
 await page.screenshot({path:'test-results/ux08-a4-portrait-scene.png',fullPage:true});
});
test('margin update changes SVG frame not paper size',async({page})=>{
 await open(page);const f=page.locator('[data-testid="ux08-layout-preview"] .ux08PageFrame'),boundary=page.locator('[data-testid="ux08-layout-preview"] .ux08PageBoundary');
 const before=Number(await f.getAttribute('x')),paperBefore=await boundary.getAttribute('width');
 await page.getByLabel('Margem left').fill('30');
 await expect(page.getByLabel('Margem left')).toHaveValue('30');
 expect(Number(await f.getAttribute('x'))).toBeGreaterThan(before);
 expect(await boundary.getAttribute('width')).toBe(paperBefore);
});
test('editing live title block shows document and project values in drawing',async({page})=>{
 await open(page);
 await page.getByLabel('Carimbo Projeto').fill('BRASKEM - INSPEÇÃO');
 await page.getByLabel('Carimbo Documento').fill('ISO-029A');
 await expect(page.locator('[data-testid="ux08-layout-preview"] .ux08TitleBlock')).toContainText('BRASKEM - INSPEÇÃO');
 await expect(page.locator('[data-testid="ux08-layout-preview"] .ux08TitleBlock')).toContainText('ISO-029A');
 await page.screenshot({path:'test-results/ux08-title-block-technical.png',fullPage:true});
});
test('field inspection preset updates table and design without changing title',async({page})=>{
 await open(page);await page.getByLabel('Carimbo Projeto').fill('PLANTA EXEMPLO');
 await page.getByLabel('Template da folha').selectOption('H2F_CAMPO_END');
 await expect(page.locator('.ux08TableEditor')).toHaveCount(3);
 await expect(page.getByLabel('Carimbo Projeto')).toHaveValue('PLANTA EXEMPLO');
 await page.screenshot({path:'test-results/ux08-field-end-template.png',fullPage:true});
});
test('add technical notes and edit table position and rows',async({page})=>{
 await open(page);await page.getByLabel('Tipo de tabela para adicionar').selectOption('NOTES');
 await page.getByRole('button',{name:'＋ Adicionar tabela'}).click();
 await expect(page.locator('.ux08TableEditor')).toHaveCount(1);
 await page.locator('.ux08TableEditor').getByLabel(/Posição da tabela/).selectOption('BOTTOM_LEFT');
 await page.getByLabel('Carimbo Notas').fill('Verificar espessura nominal em campo');
 await expect(page.locator('[data-testid="ux08-layout-preview"] .ux08Table')).toContainText('Verificar espessura nominal');
 await page.screenshot({path:'test-results/ux08-notes-table.png',fullPage:true});
});
test('manual technical table supports edit and removal',async({page})=>{
 await open(page);await page.getByLabel('Tipo de tabela para adicionar').selectOption('MANUAL');
 await page.getByRole('button',{name:'＋ Adicionar tabela'}).click();
 await page.locator('.ux08TableEditor').getByLabel(/Linhas manuais/).fill('IDENTIFICAÇÃO; W-01\nEXECUÇÃO; PLANEJADA');
 await expect(page.locator('[data-testid="ux08-layout-preview"] .ux08Table')).toContainText('EXECUÇÃO');
 await page.locator('.ux08TableEditor').getByRole('button',{name:'Excluir'}).click();
 await expect(page.locator('.ux08TableEditor')).toHaveCount(0);
});
test('saving client template survives reload on offline localStorage',async({page})=>{
 await open(page);await page.getByLabel('Nome do novo template').fill('Template Cliente A');
 await page.getByRole('button',{name:'Salvar modelo'}).click();
 await expect(page.getByLabel('Template da folha').locator('option',{hasText:'Template Cliente A'})).toHaveCount(1);
 await page.getByRole('button',{name:'Concluir'}).click();
 await page.reload();await page.getByRole('button',{name:'Formatar folha UX-08'}).click();
 await expect(page.getByLabel('Template da folha').locator('option',{hasText:'Template Cliente A'})).toHaveCount(1);
});
test('second sheet layout changes do not mutate first sheet formatting',async({page})=>{
 await open(page);await page.getByLabel('Carimbo Projeto').fill('Primeira folha');
 await page.getByRole('button',{name:'Concluir'}).click();
 await page.locator('.tabs button[title="Nova folha"]').click();
 await page.getByRole('button',{name:'Formatar folha UX-08'}).click();
 await page.getByLabel('Carimbo Projeto').fill('Segunda folha');
 await page.getByLabel('Formato da folha').selectOption('A4');
 await page.getByRole('button',{name:'Concluir'}).click();
 await page.locator('.tabs button.sheet').filter({hasText:'Folha 1'}).click();
 await page.getByRole('button',{name:'Formatar folha UX-08'}).click();
 await expect(page.getByLabel('Carimbo Projeto')).toHaveValue('Primeira folha');
 await expect(page.getByLabel('Formato da folha')).toHaveValue('A3');
 await page.screenshot({path:'test-results/ux08-multiple-sheet-layouts.png',fullPage:true});
});

test('invalid frame margin is refused with feedback without crashing CAD',async({page})=>{
 await open(page);
 await page.getByLabel('Margem left').fill('-1');
 await expect(page.locator('.ux08Foot')).toContainText('margin-left');
 await expect(page.getByLabel('Margem left')).toHaveValue('20');
 await expect(page.locator('[data-testid="ux08-layout-preview"] .ux08PageFrame')).toHaveCount(1);
 await page.getByLabel('Margem left').fill('25');
 await expect(page.getByLabel('Margem left')).toHaveValue('25');
 await page.screenshot({path:'test-results/ux08-validation-recovery.png',fullPage:true});
});

test('duplicated sheet retains its table layout and independent formatting',async({page})=>{
 await open(page);
 await page.getByLabel('Tipo de tabela para adicionar').selectOption('END');
 await page.getByRole('button',{name:'＋ Adicionar tabela'}).click();
 await page.getByRole('button',{name:'Concluir'}).click();
 await page.locator('.tabs button[title="Duplicar folha"]').click();
 await expect(page.locator('.tabs button.sheet')).toHaveCount(2);
 await page.getByRole('button',{name:'Formatar folha UX-08'}).click();
 await expect(page.locator('.ux08TableEditor')).toHaveCount(1);
 await expect(page.locator('[data-testid="ux08-layout-preview"] [data-ux08-table="END"]')).toHaveCount(1);
 await page.getByLabel('Formato da folha').selectOption('A4');
 await page.getByRole('button',{name:'Concluir'}).click();
 await page.locator('.tabs button.sheet').filter({hasText:'Folha 1'}).first().click();
 await expect(page.locator('[data-testid="ux08-sheet-overlay"]')).toHaveAttribute('data-ux08-format','A3');
 await page.screenshot({path:'test-results/ux08-duplicate-sheet-preserves-tables.png',fullPage:true});
});
