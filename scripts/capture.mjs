import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
await mkdir('evidence',{recursive:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const result=[];
for(const [name,url] of [['reference-sparkfun','https://learn.sparkfun.com/tutorials/serial-communication/all'],['reference-wokwi','https://docs.wokwi.com/guides/diagram-editor']]){
 try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});await page.screenshot({path:`evidence/${name}.png`});result.push({name,url,title:await page.title()});}catch(e){result.push({name,error:e.message});}
}
await page.goto('http://127.0.0.1:4173/stm32-exam-lab/');await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:'evidence/desktop-before.png',fullPage:true});
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:'evidence/mobile-before.png',fullPage:true});
await writeFile('evidence/reference-capture.json',JSON.stringify(result,null,2));
console.log(result);
await browser.close();
