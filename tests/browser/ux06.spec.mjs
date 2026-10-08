import{test,expect}from'@playwright/test';
const world=async(page,x,y)=>page.locator('[data-testid="editor-scene"]').evaluate((svg,{x,y})=>{const p=svg.createSVGPoint();p.x=x;p.y=y;const a=p.matrixTransform(svg.getScreenCTM());return{x:a.x,y:a.y}},{x,y});
const click=async(page,x,y)=>{const p=await world(page,x,y);await page.mouse.click(p.x,p.y)};
const choose=async(page,name)=>{await page.locator('.librarySearch').fill(name);const card=page.locator('.symbolCard').filter({hasText:name}).first();await expect(card).toBeVisible();await card.locator('.symbolPick').click()};
test.beforeEach(async({page})=>{await page.goto('/');await page.evaluate(()=>localStorage.clear());await page.reload();await expect(page.getByText('ISO INSPECT 2.0')).toBeVisible()});
test('inspection library differentiates CML, weld and corrosion',async({page})=>{
 await page.locator('.libraryCategory').selectOption('INSPEÇÃO');
 const a=page.locator('.symbolCard').filter({hasText:'Ponto CML'}).locator('svg');
 const b=page.locator('.symbolCard').filter({hasText:'Solda de topo'}).locator('svg');
 const c=page.locator('.symbolCard').filter({hasText:'Corrosão localizada'}).locator('svg');
 await expect(a).toBeVisible();await expect(b).toBeVisible();await expect(c).toBeVisible();
 expect(new Set(await Promise.all([a.innerHTML(),b.innerHTML(),c.innerHTML()])).size).toBe(3);
 await page.screenshot({path:'test-results/ux06-inspection-library.png',fullPage:true});
});
test('NDT library differentiates PAUT TOFD and IRIS',async({page})=>{
 await page.locator('.libraryCategory').selectOption('END');
 const a=page.locator('.symbolCard').filter({hasText:'Ultrassom phased array'}).locator('svg');
 const b=page.locator('.symbolCard').filter({hasText:'Ultrassom TOFD'}).locator('svg');
 const c=page.locator('.symbolCard').filter({hasText:'IRIS'}).locator('svg').first();
 await expect(a).toBeVisible();await expect(b).toBeVisible();await expect(c).toBeVisible();
 expect(new Set(await Promise.all([a.innerHTML(),b.innerHTML(),c.innerHTML()])).size).toBe(3);
 await page.screenshot({path:'test-results/ux06-ndt-library.png',fullPage:true});
});
test('annotation and sheet symbols have distinct glyphs',async({page})=>{
 await page.locator('.libraryCategory').selectOption('ANOTAÇÕES');
 const a=page.locator('.symbolCard').filter({hasText:'Nuvem de revisão'}).locator('svg');
 const b=page.locator('.symbolCard').filter({hasText:'Alerta técnico'}).locator('svg');
 expect(await a.innerHTML()).not.toBe(await b.innerHTML());
 await page.locator('.libraryCategory').selectOption('SÍMBOLOS DE FOLHA');
 const c=page.locator('.symbolCard').filter({hasText:'Match line'}).locator('svg');
 const d=page.locator('.symbolCard').filter({hasText:'Corte / seção'}).locator('svg');
 expect(await c.innerHTML()).not.toBe(await d.innerHTML());
 await page.screenshot({path:'test-results/ux06-sheet-and-annotations.png',fullPage:true});
});
test('TML is only marker until explicitly planned',async({page})=>{
 await choose(page,'Ponto TML/CML');await click(page,730,390);
 await expect(page.locator('[data-symbol-id="insp-tml"]')).toHaveCount(1);
 await expect(page.locator('.pipeRunEntity')).toHaveCount(1);
 const panel=page.locator('[data-testid="ux06-marker-properties"]');
 await expect(panel).toContainText('SOMENTE MARCADOR');await expect(panel).toContainText('PR-001');
 await page.screenshot({path:'test-results/ux06-tml-before-registration.png',fullPage:true});
 await panel.getByRole('button',{name:'Registrar inspeção como PLANEJADO'}).click();
 await expect(panel).toContainText('REGISTRO PLANEJADO');
 await page.screenshot({path:'test-results/ux06-tml-registered.png',fullPage:true});
});
test('PAUT placement does not mean completed exam',async({page})=>{
 await choose(page,'Ultrassom phased array');await click(page,730,390);
 await expect(page.locator('[data-symbol-id="ndt-paut"]')).toHaveCount(1);
 const panel=page.locator('[data-testid="ux06-marker-properties"]');
 await expect(panel).toContainText('SOMENTE MARCADOR');
 await panel.getByRole('button',{name:'Registrar END como PLANEJADO'}).click();
 await expect(panel).toContainText('REGISTRO PLANEJADO');
 await expect(page.locator('.pipeRunEntity')).toHaveCount(1);
 await page.screenshot({path:'test-results/ux06-paut-planned.png',fullPage:true});
});
test('unmounted END cannot fabricate physical record',async({page})=>{
 await choose(page,'Ultrassom TOFD');await click(page,500,290);
 await expect(page.locator('[data-testid="ux06-marker-properties"]').getByRole('button',{name:'Registrar END como PLANEJADO'})).toBeDisabled();
});
test('sheet match line remains editable and scoped to SHEET-1',async({page})=>{
 await choose(page,'Match line / limite de folha');await click(page,500,310);
 await expect(page.locator('[data-symbol-id="sheet-match-line"]')).toHaveCount(1);
 const p=page.locator('[data-testid="ux06-marker-properties"]');await expect(p).toContainText('SHEET-1');
 await p.getByLabel('Texto do marcador').fill('CONTINUA FOLHA 02');
 await expect(p.getByLabel('Texto do marcador')).toHaveValue('CONTINUA FOLHA 02');
 await page.screenshot({path:'test-results/ux06-match-line-sheet.png',fullPage:true});
});

test('sheet symbols are visible only on their own sheet',async({page})=>{
 await choose(page,'Match line / limite de folha');await click(page,500,310);
 await expect(page.locator('[data-symbol-id="sheet-match-line"]')).toHaveCount(1);
 await page.locator('.tabs button[title="Nova folha"]').click();
 await expect(page.locator('[data-symbol-id="sheet-match-line"]')).toHaveCount(0);
 await page.locator('.tabs button.sheet').filter({hasText:'Folha 1'}).click();
 await expect(page.locator('[data-symbol-id="sheet-match-line"]')).toHaveCount(1);
 await page.screenshot({path:'test-results/ux06-sheet-scope.png',fullPage:true});
});

test('weld variants show separate technical geometry rather than TML diamond',async({page})=>{
 await page.locator('.libraryCategory').selectOption('INSPEÇÃO');
 const pairs=[
  ['Solda de topo','BUTT_WELD'],
  ['Solda de filete','FILLET_WELD'],
  ['Solda de campo','FIELD_WELD'],
  ['Solda de fabricação','SHOP_WELD']
 ];
 const paths=[];
 for(const [name,variant] of pairs){
  const item=page.locator('.symbolCard').filter({hasText:name}).first();
  await expect(item).toBeVisible();
  const glyph=item.locator('.ux06Glyph');
  await expect(glyph).toHaveAttribute('data-ux06-variant',variant);
  paths.push(await glyph.locator('path').getAttribute('d'));
 }
 expect(new Set(paths).size).toBe(4);
 await page.screenshot({path:'test-results/ux06-differentiated-weld-glyphs.png',fullPage:true});
});
