import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge'}),context=await browser.newContext(),page=await context.newPage();
const results=[];
try{
for(const width of [320,390,768,1440]){
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4173/stm32-exam-lab/#lab/adc');
 for(const bits of [8,10,12,16]){
 await page.locator('[data-field="bits"]').selectOption(String(bits));const boxes=await page.locator('.code-bits span').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {y:r.y,right:r.right};}));assert.equal(boxes.length,bits);assert.ok(boxes.every(b=>Math.abs(b.y-boxes[0].y)<1));assert.ok(boxes.every(b=>b.right<=width));assert.match(await page.locator('.binary-label').innerText(),new RegExp(`b${bits-1}`));
 }results.push({width,binaryWords:'8/10/12/16-bit remain in one row'});
 await page.goto('http://127.0.0.1:4173/stm32-exam-lab/#lab/timer');
 for(const [ccr,x,path] of [[0,20,'M20 95H580'],[250,160,null],[1000,580,'M20 30H580']]){await page.locator('[data-field="ccr"]').fill(String(ccr));assert.equal(Number(await page.locator('.compare-label').getAttribute('x')),x);const d=await page.locator('[data-output] .signal').getAttribute('d');if(path)assert.equal(d,path);else assert.ok(d.includes('H160V95'));}results.push({width,timer:'0/25/100% compare position and no false pulse at endpoints'});
}
for(const [name,route,width] of [['adc-mobile','lab/adc',390],['timer-desktop','lab/timer',1440],['lesson-desktop','learn/adc',1440]]){await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4173/stm32-exam-lab/#'+route);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`evidence/${name}.png`,fullPage:true});const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(axe.violations.length,0);}
await writeFile('evidence/diagram-fix-tests.json',JSON.stringify({passed:true,results},null,2));console.log('Diagram checks passed across 4 widths, 4 ADC word lengths, PWM 0/25/100%, 3 axe audits.');
}finally{await browser.close();}
