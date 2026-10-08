import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',
 testMatch:/ux(02|04|05|06|07|08|09|10)\.spec\.mjs/,
 timeout:90000,
 expect:{timeout:10000},
 fullyParallel:false,
 workers:1,
 reporter:[['list'],['html',{outputFolder:'playwright-report-ux10',open:'never'}]],
 use:{baseURL:'http://127.0.0.1:4173',channel:'chrome',viewport:{width:1600,height:900},trace:'retain-on-failure',screenshot:'only-on-failure',video:'off'},
 webServer:{command:'npm run preview -- --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:60000}
});
