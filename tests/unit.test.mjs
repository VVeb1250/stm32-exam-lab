import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {questions,mainQuestions,extraQuestions} from '../src/questions.js';
import {lessons} from '../src/lessons.js';
import {blueprint} from '../src/sources.js';
import {uartFrame,uartTime,adcCode,adcVoltage,timerFrequency,uint32Diff,debounceEvents,stableSamples,loadState,emptyState,answerScore,rubricScore,escapeHtml} from '../src/core.js';
test('blueprint: 70 + 12 distinct questions, groups and points match announcement',()=>{
 assert.equal(questions.length,82);assert.equal(mainQuestions.length,70);assert.equal(extraQuestions.length,12);
 assert.deepEqual(questions.map(q=>q.number),Array.from({length:82},(_,i)=>i+1));
 assert.equal(new Set(questions.map(q=>q.prompt)).size,82);
 for(const [group,count,points] of blueprint.groups){const qs=mainQuestions.filter(q=>q.group===group);assert.equal(qs.length,count);assert.equal(qs.reduce((s,q)=>s+q.points,0),points);}
 assert.equal(mainQuestions.reduce((s,q)=>s+q.points,0),140);assert.ok(extraQuestions.every(q=>q.points===0));
});
test('all questions contain usable choices, specific rationale, rubric and real lesson',()=>{
 for(const q of questions){assert.equal(q.options.length,4,q.id);assert.equal(new Set(q.options).size,4,q.id);assert.ok(q.answer>=0&&q.answer<4,q.id);assert.ok(q.explanation.length>70,q.id);assert.ok(q.trap.length>15,q.id);assert.equal(q.rubric.length,2,q.id);assert.ok(lessons.some(l=>l.id===q.lesson),q.id);assert.match(q.source,/conversation:ข้อ/);}
});
test('18 lessons have 3 actual levels and a lab and retrieval check',()=>{
 assert.equal(lessons.length,18);assert.equal(new Set(lessons.map(l=>l.id)).size,18);
 for(const l of lessons){assert.equal(l.levels.length,3);assert.ok(l.lab);assert.ok(l.check.answer);for(const level of l.levels){assert.ok(level.paragraphs.length>=2);assert.ok(level.paragraphs.join('').length>200,l.id);}}
});
test('UART 0x41 LSB first and 8N1 wire time, not byte rate',()=>{
 assert.deepEqual(uartFrame(0x41),[0,1,0,0,0,0,0,1,0,1]);
 assert.deepEqual(uartFrame(0),[0,0,0,0,0,0,0,0,0,1]);assert.deepEqual(uartFrame(255),[0,1,1,1,1,1,1,1,1,1]);
 assert.ok(Math.abs(uartTime(1,115200)*1e6-86.80555556)<1e-6);
 assert.ok(Math.abs(uartTime(20,9600)*1e3-20.83333333)<1e-6);
 assert.ok(1000*12*10>115200);
});
test('ADC endpoints, rounding and inverse use instructor model',()=>{
 assert.equal(adcCode(0),0);assert.equal(adcCode(3.3),4095);assert.equal(adcCode(1),1241);assert.equal(adcCode(2),2482);assert.equal(adcCode(2.5,10,5),512);assert.equal(adcCode(4),4095);assert.equal(adcCode(-1),0);
 assert.ok(Math.abs(adcVoltage(2048)-1.65040293)<1e-7);assert.ok(Math.abs(3300/4096-.8056640625)<1e-9);
});
test('Timer +1 and capture wrap arithmetic',()=>{
 assert.equal(timerFrequency(72e6,71,999),1000);assert.equal(timerFrequency(72e6,71,1999),500);assert.equal(timerFrequency(80e6,79,999),1000);
 assert.equal((1000-65000+65536)%65536,1536);assert.equal(uint32Diff(0x10,0xfffffff0),32);
});
test('debounce exact original traces and boundary at 50ms',()=>{
 const a=debounceEvents([100,110,145,155,206]);assert.deepEqual(a.map(v=>v.count),[1,1,1,2,3]);assert.deepEqual(a.filter(v=>v.accepted).map(v=>v.now),[100,155,206]);
 assert.equal(debounceEvents([100,130,160,220],'every').at(-1).count,2);
 assert.equal(debounceEvents([10,60],'every')[0].count,0);
 assert.equal(debounceEvents([10,59,60]).at(-1).count,2);
});
test('stable filter press + release, original uint8 wrap vs saturating variant',()=>{
 assert.equal(stableSamples([1,0,1,0,0,0,0]).at(-1).count,1);
 assert.equal(stableSamples([1,0,1,0,0,0,0,1,1,1,0,0,0]).at(-1).count,2);
 const pins=Array(260).fill(0);assert.equal(stableSamples(pins).at(-1).streak,3);assert.equal(stableSamples(pins,{saturate:false}).at(-1).streak,4);assert.equal(stableSamples(pins,{saturate:false}).at(-1).count,1);
});
test('choice score does not pretend to grade written reasons',()=>{
 const answers=Object.fromEntries(mainQuestions.map(q=>[q.id,{choice:q.answer,reason:'เหตุผลที่ผู้เรียนเขียน',checks:[]} ]));
 assert.equal(answerScore(mainQuestions,answers),70);assert.equal(rubricScore(mainQuestions,answers),0);
 answers.q1.checks=[true,true];assert.equal(rubricScore(mainQuestions,answers),2);
 answers.q1.reason=' ';assert.equal(rubricScore(mainQuestions,answers),0);answers.q1.reason=42;assert.equal(rubricScore(mainQuestions,answers),0);
});
test('persistence handles denied storage, malformed JSON/schema, untrusted values',()=>{
 assert.deepEqual(loadState({getItem(){throw Error();}}),emptyState());assert.deepEqual(loadState({getItem:()=>'{'}),emptyState());
 const data=emptyState();data.practice.q1={choice:99,reason:{bad:true},checks:[true,'yes'],revealed:true};data.depth.gpio=100;data.exam.index=999;
 const loaded=loadState({getItem:()=>JSON.stringify(data)});assert.equal(loaded.practice.q1.choice,undefined);assert.equal(loaded.practice.q1.reason,'');assert.deepEqual(loaded.practice.q1.checks,[true,false]);assert.equal(loaded.depth.gpio,undefined);assert.equal(loaded.exam.index,69);
 assert.equal(escapeHtml('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
});
test('static entry uses relative assets for GitHub project Pages path',async()=>{
 const html=await readFile('index.html','utf8');assert.ok(!/(?:src|href)="\/(?!\/)/.test(html));assert.match(html,/lang="th"/);assert.match(html,/\.\/src\/app.js/);
});
