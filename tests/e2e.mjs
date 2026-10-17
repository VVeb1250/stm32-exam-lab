import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {lessons} from '../src/lessons.js';
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
 const responses=await Promise.all(['src/app.js','src/style.css','public/NotoSansThai.ttf'].map(s=>fetch(base+s)));assert.ok(responses.every(r=>r.status===200));await go('learn/adc');await page.reload();assert.match(await page.locator('h1').textContent(),/แรงดัน/);
});
await check('GPIO active low control works by keyboard, state matches diagram',async()=>{
 await go('home');const button=page.locator('[data-action="press"]');await button.focus();await page.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-pressed'),'true');assert.match(await page.locator('.circuit').getAttribute('aria-label'),/LOW 0.*HIGH 1/);await page.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-pressed'),'false');await axe('home');
});
await check('Search: subject results, empty query, no results, escaped user input',async()=>{
 await page.locator('#search').fill('debounce');assert.ok(await page.locator('#search-results a').count()>2);await page.locator('#search').fill('zzzzzzzz');assert.match(await page.locator('#search-results').innerText(),/พบ 0/);await page.locator('#search').fill('<img onerror=alert(1)>');assert.equal(await page.locator('#search-results img').count(),0);await page.locator('#search').fill('');assert.equal(await page.locator('#search-results').innerText(),'');
});
await check('Depth, mark read, next chapter and persistence survive reload',async()=>{
 await go('learn/debounce');await page.locator('[data-depth="1"]').first().click();await page.locator('#mark-read').click();await page.reload();assert.equal(await page.locator('.level-tabs [aria-pressed=true]').innerText(),'2. พร้อมสอบ ✓');await page.locator('[data-depth="2"]').first().click();assert.match(await page.locator('.reading').innerText(),/uint8_t/);await page.getByRole('link',{name:'ไปบทต่อไป →',exact:true}).click();assert.ok(page.url().includes('uart-frame'));await axe('lesson');
});
await check('Practice requires choice AND reason, saves draft, rubric is self-assessed',async()=>{
 await go('practice/question/1');const reveal=page.locator('#reveal');assert.equal(await reveal.isDisabled(),true);await page.locator(`input[name=answer][value="${questions[0].answer}"]`).check();assert.equal(await reveal.isDisabled(),true);await page.locator('#reason').fill('PC13 กดเป็น LOW ส่วน LED active high ต้อง HIGH จึงติด');await page.reload();assert.match(await page.locator('#reason').inputValue(),/PC13/);assert.equal(await page.locator('#reveal').isDisabled(),false);assert.equal(await page.locator('.feedback').count(),0);await page.locator('#reveal').click();assert.match(await page.locator('.feedback h3').first().innerText(),/ถูก/);await page.locator('[data-rubric="0"]').check();await page.locator('[data-rubric="1"]').check();assert.match(await page.locator('.rubric-result').innerText(),/2\/2/);await axe('practice-revealed');await page.locator('#retry-question').click();assert.equal(await page.locator('.feedback').count(),0);assert.equal(await page.locator('#reason').inputValue(),'');
});
await check('All 82 practice questions have gated reveal and complete explanations',async()=>{
 for(const q of questions){await go(`practice/question/${q.number}`);assert.equal(await page.locator('.question-card').getAttribute('data-question'),q.id);if(await page.locator('#retry-question').count())await page.locator('#retry-question').click();await page.locator(`input[name=answer][value="${q.answer}"]`).check();await page.locator('#reason').fill(`อธิบายก่อนเปิดเฉลย: ${q.rubric.join(' และ ')}`);await page.locator('#reveal').click();assert.ok((await page.locator('.feedback').innerText()).includes(q.explanation),q.id);}
});
await check('Wrong practice filter and retry path',async()=>{
 await go('practice/question/7');await page.locator('#retry-question').click();await page.locator(`input[name=answer][value="${(questions[6].answer+1)%4}"]`).check();await page.locator('#reason').fill('เหตุผลทดลองที่ผิด');await page.locator('#reveal').click();await go('practice/wrong');assert.equal(await page.locator('.question-card').getAttribute('data-question'),'q7');await page.locator('#retry-question').click();assert.ok(page.url().includes('practice/question/7'));assert.equal(await page.locator('.feedback').count(),0);
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
await check('Responsive: all 54 lesson levels at 320/390/768/1280/1440 without body overflow',async()=>{
 for(const width of [320,390,768,1280,1440]){
 await page.setViewportSize({width,height:900});
 for(const l of lessons){for(let d=0;d<3;d++){await go(`learn/${l.id}`);await page.locator(`.level-tabs [data-depth="${d}"]`).click();const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`${width} ${l.id} depth${d}`);}}
 for(const route of ['home','practice/question/70','exam',...Object.keys((await import('../src/labs.js')).labNames).map(l=>'lab/'+l)]){await go(route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width} ${route}`);if(route==='lab/adc'){const ys=await page.locator('.code-bits span').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().y));assert.ok(ys.every(y=>Math.abs(y-ys[0])<1),`binary word wraps at ${width}`);}}
 }
});
await check('Storage failure, corrupt data, safe reset confirmation',async()=>{
 const denied=await browser.newContext({viewport:{width:390,height:844}});await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});});const p=await denied.newPage();await p.goto(base+'#learn/gpio');await p.locator('#mark-read').click();assert.equal(await p.locator('#storage-warning').isVisible(),true);await denied.close();
 await page.evaluate(key=>localStorage.setItem(key,'{broken'),STORAGE_KEY);await go('progress');assert.match(await page.locator('.progress-summary').innerText(),/0\/18/);await page.locator('#reset-progress').click();await page.locator('#cancel-reset').click();assert.equal(await page.locator('#confirm-reset').count(),0);await page.locator('#reset-progress').click();await page.locator('#confirm-reset').click();assert.match(await page.locator('.progress-summary').innerText(),/0\/82/);
});
await check('Final screenshot captures and zero runtime errors',async()=>{
 const scenes=[['desktop','home',1440,1000],['mobile','home',390,844],['lesson-desktop','learn/adc',1440,1000],['lesson-mobile','learn/debounce',390,844],['uart-desktop','lab/uart',1440,1000],['adc-mobile','lab/adc',390,844],['practice-mobile','practice/question/1',390,844],['timer-desktop','lab/timer',1440,1000]];
 for(const [name,route,width,height] of scenes){await page.setViewportSize({width,height});await go(route);await page.screenshot({path:`evidence/${name}.png`,fullPage:true});}
 assert.deepEqual(errors,[]);
});
}finally{await writeFile('evidence/test-results.json',JSON.stringify({date:new Date().toISOString(),base,results,a11y,errors},null,2));await browser.close();server?.kill();}
const failed=results.filter(r=>!r.pass);console.log(`${results.length-failed.length}/${results.length} e2e checks passed; ${a11y.length} axe audits; ${errors.length} runtime errors`);if(failed.length)process.exitCode=1;
