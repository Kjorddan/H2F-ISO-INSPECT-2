import{test,expect}from'@playwright/test';
const point=async(page,x,y)=>page.locator('[data-testid="ux07-drawing-surface"]').evaluate((svg,{x,y})=>{const p=svg.createSVGPoint();p.x=x;p.y=y;const a=p.matrixTransform(svg.getScreenCTM());return{x:a.x,y:a.y}},{x,y});
const draw=async(page,tool,a={x:10,y:10},b={x:60,y:35})=>{await page.locator('.ux07Tools').getByRole('button',{name:tool,exact:true}).click();const start=await point(page,a.x,a.y),end=await point(page,b.x,b.y);await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:6});await page.mouse.up()};
const open=async(page)=>{await page.goto('/');await page.evaluate(()=>localStorage.clear());await page.reload();await page.getByRole('button',{name:'＋ Novo símbolo'}).click();await expect(page.locator('[data-testid="ux07-shape-editor"]')).toBeVisible()};
test('new shape begins invalid until its geometry is authored',async({page})=>{
 await open(page);
 await expect(page.getByRole('button',{name:'Salvar nova forma'})).toBeDisabled();
 await expect(page.getByRole('heading',{name:/Criador de Formas Personalizadas/})).toBeVisible();
 await page.screenshot({path:'test-results/ux07-shape-designer-empty.png',fullPage:true});
});
test('draw circle and rectangle on vector canvas and save to industrial library',async({page})=>{
 await open(page);await page.getByLabel('Nome da forma').fill('Marca exclusiva UX07');
 await draw(page,'Círculo');await draw(page,'Retângulo',{x:12,y:12},{x:54,y:31});
 await expect(page.locator('.ux07PrimitiveList').first().locator('button')).toHaveCount(2);
 await page.screenshot({path:'test-results/ux07-shape-designer-drawn.png',fullPage:true});
 await page.getByRole('button',{name:'Salvar nova forma'}).click();
 await expect(page.locator('[data-testid="ux07-shape-editor"]')).toHaveCount(0);
 const row=page.locator('.symbolCard').filter({hasText:'Marca exclusiva UX07'}).first();
 await expect(row).toBeVisible();
 await expect(row.getByRole('button',{name:/Editar/})).toBeVisible();
 await page.screenshot({path:'test-results/ux07-custom-library-card.png',fullPage:true});
});
test('new symbol survives reload from local offline library',async({page})=>{
 await open(page);await page.getByLabel('Nome da forma').fill('Persistência UX07');await draw(page,'Linha');
 await page.getByRole('button',{name:'Salvar nova forma'}).click();
 await page.reload();
 await expect(page.locator('.symbolCard').filter({hasText:'Persistência UX07'})).toHaveCount(1);
});
test('editing existing definition creates new revision, leaving original independent',async({page})=>{
 await open(page);await page.getByLabel('Nome da forma').fill('Versão original UX07');await draw(page,'Linha');await page.getByRole('button',{name:'Salvar nova forma'}).click();
 const card=page.locator('.symbolCard').filter({hasText:'Versão original UX07'});
 await card.getByRole('button',{name:/Editar/}).click();
 await expect(page.getByRole('button',{name:'Salvar nova revisão'})).toBeVisible();
 await draw(page,'Elipse');
 await page.getByRole('button',{name:'Salvar nova revisão'}).click();
 await expect(page.locator('.symbolCard').filter({hasText:'Versão original UX07'})).toContainText('v2');
 await page.screenshot({path:'test-results/ux07-revision-v2.png',fullPage:true});
});
test('reference points are graphics, not implicit process links',async({page})=>{
 await open(page);await draw(page,'Polilinha');
 await page.getByRole('button',{name:'＋ Referência'}).click();
 const p=await point(page,0,23);await page.mouse.click(p.x,p.y);
 await expect(page.locator('.ux07Reference')).toHaveCount(1);
 await expect(page.locator('.ux07Validation')).toContainText('sem conexões de processo');
 await page.screenshot({path:'test-results/ux07-graphic-reference.png',fullPage:true});
});
test('undo and redo update primitive count',async({page})=>{
 await open(page);await draw(page,'Arco Bézier');
 await expect(page.locator('.ux07PrimitiveList').first().locator('button')).toHaveCount(1);
 await page.getByRole('button',{name:'↶ Desfazer'}).click();
 await expect(page.locator('.ux07PrimitiveList').first().locator('button')).toHaveCount(0);
 await page.getByRole('button',{name:'↷ Refazer'}).click();
 await expect(page.locator('.ux07PrimitiveList').first().locator('button')).toHaveCount(1);
});
test('all 8 drawing tool controls are available',async({page})=>{
 await open(page);for(const t of['Linha','Polilinha','Arco Bézier','Círculo','Elipse','Retângulo','Polígono','Texto'])await expect(page.locator('.ux07Tools').getByRole('button',{name:t,exact:true})).toBeVisible();
});
test('custom shapes are free objects and do not split PipeRun',async({page})=>{
 await open(page);await page.getByLabel('Nome da forma').fill('Símbolo custom independente');
 await draw(page,'Polígono');await page.getByRole('button',{name:'Salvar nova forma'}).click();
 const row=page.locator('.symbolCard').filter({hasText:'Símbolo custom independente'}).first();
 await row.locator('.symbolPick').click();
 const at=await page.locator('[data-testid="editor-scene"]').evaluate(svg=>{const p=svg.createSVGPoint();p.x=730;p.y=390;const q=p.matrixTransform(svg.getScreenCTM());return{x:q.x,y:q.y}});
 await page.mouse.click(at.x,at.y);
 await expect(page.locator('.pipeRunEntity')).toHaveCount(1);
 await expect(page.locator('.industrialSymbol .customGlyph')).toHaveCount(1);
 await page.screenshot({path:'test-results/ux07-custom-shape-in-scene.png',fullPage:true});
});
test('corrupt oversized JSON library import is refused',async({page})=>{
 await open(page);await page.getByRole('button',{name:'Cancelar'}).click();
 await page.locator('.importLibraryBtn input').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('not json')});
 await expect(page.getByText('Importação recusada')).toBeVisible();
});
