import {test,expect} from '@playwright/test';

const sizes=[
 {width:1920,height:1080},{width:1600,height:900},{width:1536,height:864},
 {width:1440,height:900},{width:1366,height:768},{width:1280,height:720},{width:1024,height:768}
];

test.beforeEach(async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
 await expect(page.getByText('ISO INSPECT 2.0')).toBeVisible();
});

test('menus, ícones, tooltips e ações reais',async({page})=>{
 const toolbar=page.getByTestId('cad-toolbar');
 await expect(toolbar).toBeVisible();
 await expect(toolbar.locator('svg.cadIcon').first()).toBeVisible();
 const save=page.getByTestId('toolbar-save');
 await expect(save).toHaveAttribute('data-tooltip',/Salvar.*Ctrl\+S/);

 await page.getByRole('button',{name:'Arquivo',exact:true}).click();
 await expect(page.getByRole('menuitem',{name:'Salvar',exact:true})).toBeVisible();
 await page.getByRole('menuitem',{name:'Exportar',exact:true}).hover();
 await expect(page.getByRole('menuitem',{name:'PDF',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');

 await page.getByRole('button',{name:'Editar',exact:true}).click();
 await expect(page.getByRole('menuitem',{name:'Preferências',exact:true})).toBeDisabled();
 const reason=await page.getByRole('menuitem',{name:'Preferências',exact:true}).getAttribute('title');
 expect(reason).toBeTruthy();
 await page.keyboard.press('Escape');

 await page.getByRole('button',{name:'Ajuda',exact:true}).click();
 await page.getByRole('menuitem',{name:'Versão',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('UX-02');
 await page.getByRole('dialog').getByRole('button',{name:'Fechar',exact:true}).last().click();
});

test('painéis recolhíveis, persistência e auto-hide',async({page})=>{
 await expect(page.locator('.libraryPanel')).toBeVisible();
 await page.locator('.libraryPanel').getByRole('button',{name:'Recolher biblioteca'}).click();
 await expect(page.locator('.libraryPanel')).toHaveCount(0);
 await page.reload();
 await expect(page.locator('.libraryPanel')).toHaveCount(0);
 await page.getByRole('button',{name:'Biblioteca',exact:true}).click();
 await expect(page.locator('.libraryPanel')).toBeVisible();

 const props=page.locator('aside.right');
 await expect(props).toBeVisible();
 await props.getByRole('button',{name:'Auto-ocultar painel'}).click();
 await page.mouse.move(500,300);
 await expect(page.locator('.autoHideRail')).toBeVisible();
 await page.locator('.autoHideRail').hover();
 await expect(page.locator('aside.right')).toBeVisible();
 await page.locator('aside.right').getByRole('button',{name:'Fixar painel'}).click();
 await expect(page.locator('aside.right')).toBeVisible();
});

for(const size of sizes){
 test(`toolbar sem rolagem e shell contido ${size.width}x${size.height}`,async({page})=>{
  await page.setViewportSize(size);
  await page.reload();
  const metrics=await page.evaluate(()=>{
   const t=document.querySelector('[data-testid="cad-toolbar"]');
   const r=t.getBoundingClientRect();
   return{
    toolbarClient:t.clientWidth,toolbarScroll:t.scrollWidth,toolbarLeft:r.left,toolbarRight:r.right,
    viewport:innerWidth,bodyScroll:document.documentElement.scrollWidth,
    overflowX:getComputedStyle(t).overflowX
   };
  });
  expect(metrics.toolbarScroll).toBeLessThanOrEqual(metrics.toolbarClient+2);
  expect(metrics.toolbarLeft).toBeGreaterThanOrEqual(-1);
  expect(metrics.toolbarRight).toBeLessThanOrEqual(metrics.viewport+1);
  expect(metrics.bodyScroll).toBeLessThanOrEqual(metrics.viewport+2);
  expect(['auto','scroll']).not.toContain(metrics.overflowX);
  await expect(page.getByRole('button',{name:'Arquivo',exact:true})).toBeVisible();
  await expect(page.getByTestId('editor-viewport')).toBeVisible();
  await page.screenshot({path:`test-results/ux02-${size.width}x${size.height}.png`,fullPage:true});
 });
}
