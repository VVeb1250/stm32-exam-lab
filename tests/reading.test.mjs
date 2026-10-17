import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chatDocuments} from '../src/chat-content.js';
import {readingQuestions,lessonAnchors,sourceSections,questionGroup} from '../src/reading.js';
import {lessons} from '../src/lessons.js';

test('complete source snapshot preserves all four assistant messages and 25 teaching diagrams',()=>{
 assert.deepEqual(chatDocuments.map(d=>d.blocks.length),[505,165,340,586]);
 const html=chatDocuments.flatMap(d=>d.blocks).map(b=>b.html).join('');
 assert.equal([...html.matchAll(/data-kind="svg"/g)].length,25);
 assert.equal([...html.matchAll(/data-kind="mermaid"/g)].length,7);
 assert.match(html,/<linearGradient id="adcGradient"><stop offset="0%" stop-color="#[0-9A-F]+"><\/stop><stop offset="100%"/);
 assert.doesNotMatch(html,/<(?:script|iframe|img|button|input)\b|\son\w+\s*=|javascript:|(?:href|src)\s*=/i);
 assert.equal([...html.matchAll(/url\(([^)]*)\)/g)].filter(m=>!m[1].startsWith('#')).length,0);
 assert.doesNotMatch(html,/expression\(|@import/i);
 assert.ok(chatDocuments[0].blocks.map(b=>b.text).join(' ').length>39000);
});
test('reading questions retain original numbering, prompts, answers, explanations and group sizes',()=>{
 assert.deepEqual(readingQuestions.map(q=>q.number),Array.from({length:82},(_,i)=>i+1));
 for(const q of readingQuestions){assert.match(q.prompt.map(b=>b.text).join(' '),/โจทย์/);assert.match(q.answer.map(b=>b.text).join(' '),/เฉลย/);assert.match(q.answer.map(b=>b.text).join(' '),/อธิบาย/);}
 assert.deepEqual(['GPIO','UART','ADC','Interrupt','Extras'].map(g=>readingQuestions.filter(q=>questionGroup(q.number)===g).length),[15,20,20,15,12]);
 assert.match(readingQuestions[18].answer.map(b=>b.text).join(' '),/LSB|10000010/);
 assert.doesNotMatch(readingQuestions[81].answer.map(b=>b.text).join(' '),/ตรวจสอบความครอบคลุม/);
});
test('every existing lesson deep link resolves to its full source heading',()=>{
 for(const lesson of lessons){assert.ok(lessonAnchors[lesson.id],lesson.id);assert.ok(sourceSections.some(s=>s.id===lessonAnchors[lesson.id]),lesson.id);}
});
