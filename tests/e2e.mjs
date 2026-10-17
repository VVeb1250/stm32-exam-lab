import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {questions,mainQuestions} from '../src/questions.js';
import {STORAGE_KEY} from '../src/core.js';
const base=process.env.BASE_URL||'http://127.0.0.1:4173/stm32-exam-lab/';
let server;
if(!process.env.BASE_URL){try{await fetch(base);}catch{server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});for(let i=0;i<50;i++){try{await fetch(base);break;}catch{await new Promise(r=>setTimeout(r,100));}}}}
await mkdir('evidence',{recursive:true});
const browser=await chromium.launch(process.env.CI?{headless:true}:{channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
const errors=[],results=[],a11y=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
const go=async hash=>{await page.goto(base+'#'+hash);await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);};
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(e){results.push({name,pass:false,error:e.stack});console.log('FAIL',name,e.message);}}
async function axe(name){const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();a11y.push({name,violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>n.target)}))});assert.equal(r.violations.length,0,`${name}: ${r.violations.map(v=>v.id).join(',')}`);}
try{
await check('GitHub project subpath: assets, hash route refresh, skip link',async()=>{
 await go('home');assert.equal(await page.locator('h1').textContent(),'เข้าใจสัญญาณแล้วอธิบายได้');await page.keyboard.press('Tab');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main');assert.equal(new URL(page.url()).hash,'#home');
 const responses=await Promise.all(['src/app.js','src/style.css','public/NotoSansThai.ttf'].map(s=>fetch(base+s)));assert.ok(responses.every(r=>r.status===200));await go('learn/adc');await page.reload();assert.match(await page.locator('h1').textContent(),/เหมือนในแชท/);assert.equal(await page.locator('#s0-237').count(),1);
});
await check('GPIO active low control works by keyboard, state matches diagram',async()=>{
 await go('home');const button=page.locator('[data-action="press"]');await button.focus();await page.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-pressed'),'true');assert.match(await page.locator('.circuit').getAttribute('aria-label'),/LOW 0.*HIGH 1/);await page.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-pressed'),'false');await axe('home');
});
await check('Search: subject results, empty query, no results, escaped user input',async()=>{
 await page.locator('#search').fill('debounce');assert.ok(await page.locator('#search-results a').count()>2);await page.locator('#search').fill('zzzzzzzz');assert.match(await page.locator('#search-results').innerText(),/พบ 0/);await page.locator('#search').fill('<img onerror=alert(1)>');assert.equal(await page.locator('#search-results img').count(),0);await page.locator('#search').fill('');assert.equal(await page.locator('#search-results').innerText(),'');
});
await check('Continuous full lessons: three visible zones, original diagrams, depth jumps and saved marks',async()=>{
 await go('learn');assert.equal(await page.locator('.reading-zone').count(),3);assert.equal(await page.locator('.chat-prose svg[data-kind=svg]').count(),25);assert.equal(await page.locator('[data-depth]').count(),0);assert.equal(await page.locator('.source-block').count(),1008);assert.equal(await page.locator('#adcGradient stop').count(),2);assert.equal(await page.locator('svg:has(#adcGradient)').evaluate(e=>Math.round(e.getBoundingClientRect().height)),23);await page.locator('.zone-nav a').nth(1).click();assert.equal(new URL(page.url()).hash,'#learn/zone/2');await page.waitForFunction(()=>Math.abs(document.querySelector('#zone-2').getBoundingClientRect().top-90)<8,{},{timeout:5000});
 await go('learn/debounce');await page.locator('[data-read-lesson=debounce]').click();await page.reload();assert.equal(await page.locator('[data-read-lesson=debounce]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#zone-3').isVisible(),true);await page.locator('#source-pwm').fill('60');const pwm=page.locator('#source-pwm').locator('../..');assert.match(await pwm.innerText(),/600/);assert.match(await pwm.innerText(),/0.60 ms/);await axe('full-lessons');
});
await check('Practice is an uninterrupted 82-question list with immediate native explanation disclosures',async()=>{
 await go('practice');assert.equal(await page.locator('.reading-question').count(),82);assert.equal(await page.locator('.question-card,input[name=answer],#reason,#reveal').count(),0);for(const q of questions){const article=page.locator(`#question-${q.number}`);assert.match(await article.locator('h3').innerText(),new RegExp(`ข้อ ${q.number}:`));assert.equal(await article.locator('details').getAttribute('open'),null);await article.locator('summary').click();assert.ok((await article.locator('details .chat-prose').innerText()).length>70);await article.locator('summary').click();}await axe('practice-reading');await go('progress');assert.match(await page.locator('.progress-summary').innerText(),/82\/82/);
});
await check('Question filters and deep links preserve scrolling across topics',async()=>{
 await go('practice/UART');assert.equal(await page.locator('.reading-question').count(),20);await page.locator('#reading-jump').selectOption('70');await page.waitForURL('**/#practice/question/70');assert.equal(await page.locator('.reading-question').count(),82);await page.waitForFunction(()=>Math.abs(document.querySelector('#question-70').getBoundingClientRect().top-90)<8,{},{timeout:5000});await page.locator('#question-70 summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#question-70 details').getAttribute('open'),'');await axe('practice-expanded');
});
await check('Labs: bits, UART frame step, ADC, debounce variants and validation',async()=>{
 await go('lab/bits');await page.locator('[data-bit="5"]').click();assert.match(await page.locator('.readouts').innerText(),/97/);
 await go('lab/uart');assert.match(await page.locator('.readouts').innerText(),/86.81/);await page.locator('[data-action="step"]').click();assert.match(await page.locator('.lab-caption').innerText(),/Start = 0/);await page.locator('[data-field="byte"]').fill('300');assert.match(await page.locator('.lab-error').innerText(),/0 ถึง 255/);await page.locator('[data-field="byte"]').fill('65');await page.locator('[data-field="baud"]').selectOption('9600');assert.match(await page.locator('.readouts').innerText(),/1041.67/);await axe('uart-lab');
 await go('lab/adc');assert.match(await page.locator('.adc-flow').innerText(),/1241/);await page.locator('[data-field="VIN"]').fill('3.3');assert.match(await page.locator('.adc-flow').innerText(),/4095/);await axe('adc-lab');
 await go('lab/debounce');assert.match(await page.locator('.lab-caption').innerText(),/นับได้ 3/);await page.locator('[data-field="mode"]').selectOption('every');assert.match(await page.locator('.lab-caption').innerText(),/นับได้ 2/);await page.locator('[data-field="mode"]').selectOption('stable');assert.match(await page.locator('.lab-caption').innerText(),/นับได้ 1/);await page.locator('[data-field="sequence"]').fill('1,x,0');await page.locator('[data-action="run"]').click();assert.ok((await page.locator('.lab-error').innerText()).length>10);await page.locator('[data-field="sequence"]').fill('1,0,0,0');await page.locator('[data-action="run"]').click();assert.equal(await page.locator('.lab-error').innerText(),'');await axe('debounce-lab');
});
await check('Labs: timer math, scheduling jitter, rate budget and trace state',async()=>{
 await go('lab/timer');assert.match(await page.locator('.readouts').innerText(),/1000.00 Hz/);assert.equal(Number(await page.locator('.compare-label').getAttribute('x')),160);await page.locator('[data-field="ccr"]').fill('0');assert.equal(await page.locator('[data-output] .signal').getAttribute('d'),'M20 95H580');await page.locator('[data-field="ccr"]').fill('1000');assert.equal(await page.locator('[data-output] .signal').getAttribute('d'),'M20 30H580');await page.locator('[data-field="arr"]').fill('1999');assert.match(await page.locator('.readouts').innerText(),/500.00 Hz/);await page.locator('[data-field="ccr"]').fill('500');assert.match(await page.locator('.readouts').innerText(),/25.00%/);
 await go('lab/timing');assert.equal(await page.locator('.timing-strip').count(),2);await page.locator('[data-action="switch"]').click();assert.match(await page.locator('.timing-strip').first().innerText(),/Software/);
 await go('lab/system');await page.locator('[data-field="rate"]').selectOption('1000');assert.match(await page.locator('.readouts').innerText(),/ส่งไม่ทัน/);await page.locator('[data-field="bytes"]').fill('2');assert.match(await page.locator('.readouts').innerText(),/อยู่ในเพดาน/);await page.locator('[data-action="interval"]').click();assert.equal(await page.locator('[data-field="rate"]').inputValue(),'5');
 await go('lab/trace');for(let i=0;i<5;i++)await page.locator('[data-action="step"]').click();assert.match(await page.locator('.trace-step').innerText(),/interval=200/);await page.locator('[data-field="program"]').selectOption('race');for(let i=0;i<3;i++)await page.locator('[data-action="step"]').click();assert.match(await page.locator('.trace-step').innerText(),/count=6/);
});
await check('Exam 70-question actual user journey: incomplete prevention, resume, submit, scores',async()=>{
 await go('exam');assert.equal(await page.locator('.feedback').count(),0);await page.locator('#submit-exam').click();assert.match(await page.locator('#submit-status').innerText(),/ยังขาด/);
 for(let i=0;i<mainQuestions.length;i++){
 const q=mainQuestions[i];assert.equal(await page.locator('.question-card').getAttribute('data-question'),q.id);await page.locator(`input[name=answer][value="${q.answer}"]`).check();await page.locator('#reason').fill(q.rubric.join(' เพราะ '));assert.equal(await page.locator('.feedback').count(),0);if(i===34){await page.reload();assert.match(await page.locator('#reason').inputValue(),new RegExp(q.rubric[0].slice(0,5)));}if(i<69)await page.locator('[data-emove="1"]').click();
 }
 assert.match(await page.locator('#exam-count').innerText(),/70\/70/);await page.locator('#submit-exam').click();assert.match(await page.locator('#choice-score').innerText(),/70\/70/);assert.match(await page.locator('#rubric-score').innerText(),/0\/140/);await page.locator('[data-rubric="0"]').check();await page.locator('[data-rubric="1"]').check();assert.match(await page.locator('#rubric-score').innerText(),/2\/140/);await page.reload();assert.match(await page.locator('#rubric-score').innerText(),/2\/140/);await axe('exam-submitted');
});
await check('Sources distinguish platform / confirmed / generated and extras outside 140',async()=>{await go('sources');assert.match(await page.locator('main').innerText(),/Z80/);assert.match(await page.locator('main').innerText(),/v1.8.3/);assert.match(await page.locator('main').innerText(),/Generated practice/);await axe('sources');});
await check('Responsive: continuous reading, all explanations and labs at 320/390/768/1280/1440',async()=>{
 for(const width of [320,390,768,1280,1440]){
 await page.setViewportSize({width,height:900});
 for(const route of ['learn','home','practice','exam',...Object.keys((await import('../src/labs.js')).labNames).map(l=>'lab/'+l)]){await go(route);if(route==='practice')await page.locator('.answer-disclosure').evaluateAll(els=>els.forEach(e=>e.open=true));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width} ${route}`);if(route==='learn'){for(const grid of await page.locator('.source-bit-grid').all()){const ys=await grid.locator(':scope > *').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().y));assert.ok(ys.every(y=>Math.abs(y-ys[0])<1),`source UART bit order wraps at ${width}`);}}if(route==='lab/adc'){const ys=await page.locator('.code-bits span').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().y));assert.ok(ys.every(y=>Math.abs(y-ys[0])<1),`binary word wraps at ${width}`);}}
 }
});
await check('Storage failure, corrupt data, safe reset confirmation',async()=>{
 const denied=await browser.newContext({viewport:{width:390,height:844}});await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});});const p=await denied.newPage();await p.goto(base+'#learn/gpio');await p.locator('[data-read-lesson=gpio]').click();assert.equal(await p.locator('#storage-warning').isVisible(),true);await denied.close();
 await page.evaluate(key=>localStorage.setItem(key,'{broken'),STORAGE_KEY);await go('progress');await page.reload();assert.match(await page.locator('.progress-summary').innerText(),/0\/18/);await page.locator('#reset-progress').click();await page.locator('#cancel-reset').click();assert.equal(await page.locator('#confirm-reset').count(),0);await page.locator('#reset-progress').click();await page.locator('#confirm-reset').click();assert.match(await page.locator('.progress-summary').innerText(),/0\/82/);
});
await check('Final screenshot captures and zero runtime errors',async()=>{
 const scenes=[['desktop','home',1440,1000],['mobile','home',390,844],['reading-desktop','learn',1440,1000],['reading-mobile','learn/gpio',390,844],['uart-desktop','lab/uart',1440,1000],['adc-mobile','lab/adc',390,844],['practice-reading-mobile','practice/question/1',390,844],['timer-desktop','lab/timer',1440,1000]];
 for(const [name,route,width,height] of scenes){await page.setViewportSize({width,height});await go(route);await page.screenshot({path:`evidence/${name}.png`,fullPage:!['learn','practice'].includes(route.split('/')[0])});}
 assert.deepEqual(errors,[]);
});
}finally{await writeFile('evidence/test-results.json',JSON.stringify({date:new Date().toISOString(),base,results,a11y,errors},null,2));await browser.close();server?.kill();}
const failed=results.filter(r=>!r.pass);console.log(`${results.length-failed.length}/${results.length} e2e checks passed; ${a11y.length} axe audits; ${errors.length} runtime errors`);if(failed.length)process.exitCode=1;
