import {chatDocuments} from './chat-content.js';
import {escapeHtml as E} from './core.js';

export const zones=[
 {title:'เริ่มจากศูนย์ → เข้าใจภาพรวม',note:'อ่านต่อเนื่องตั้งแต่ Microcontroller, GPIO, UART, ADC และ Interrupt จนเห็นการทำงานของระบบรวม'},
 {title:'พร้อมสอบ → เก็บกลไกและจุดหลอก',note:'ต่อจากพื้นฐานด้วยภาษา C, Register, Buffer, ADC modes และ concurrency'},
 {title:'เจาะลึก / กันเหนียว → ต่อให้โจทย์เปลี่ยน',note:'เนื้อหาเพิ่มเติมนอก blueprint ที่ยืนยัน: Timer / PWM, Input Capture, Oversampling, Watchdog, Low-power และ Code Tracing'}
];

// Stable legacy lesson links now jump into the complete conversation, never hide depth.
export const lessonAnchors={foundations:'s0-9','c-bits':'s1-7',gpio:'s0-37',debounce:'s0-84','uart-frame':'s0-136','uart-time':'s0-153','uart-hal':'s0-199',adc:'s0-237','adc-accuracy':'s0-282','adc-timing':'s0-308',interrupt:'s0-366',concurrency:'s1-139',timer:'s2-5',system:'s0-428','trace-code':'s2-261','watchdog-power':'s2-167','half-duplex':'s2-240','exam-ready':'s0-490'};
export const sourceSections=chatDocuments.slice(0,3).flatMap((d,z)=>d.blocks.map((b,n)=>({...b,id:`s${z}-${n}`,zone:z})).filter(b=>/^h[12]$/.test(b.tag)));

export function sourceBlock(block,headingLevel=4){
 let html=block.html;
 // Chat's code chrome and icon stubs do not carry teaching content.
 if(html.includes('<pre>'))return html.match(/<pre>[\s\S]*?<\/pre>/g).join('');
 html=html.replace(/<svg\b[^>]*><\/svg>/g,'');
 html=html.replace(/<(\/?)h[1-6]\b/g,'<$1strong');
 if(/^h[1-6]$/.test(block.tag))html=html.replace(/^<strong\b/,`<h${headingLevel}`).replace(/<\/strong>$/,`</h${headingLevel}>`);
 return html;
}

export const readingQuestions=(()=>{
 const list=[];let current;
 for(const block of chatDocuments[3].blocks){
  const heading=block.tag==='h2'&&/^ข้อ\s+(\d+):/.exec(block.text);
  if(heading){current={number:Number(heading[1]),title:block.text,prompt:[],answer:[]};list.push(current);continue;}
  if(block.tag==='h1'){current=undefined;continue;}
  const q=current;if(!q)continue;
  if(q.number===82&&block.tag==='h2')break;
  if(!block.text.trim()&&!block.html.includes('<svg'))continue;
  if(/^เฉลย\s*:/.test(block.text)||q.answer.length)q.answer.push(block);else q.prompt.push(block);
 }
 return list;
})();
export const questionGroup=n=>n<=15?'GPIO':n<=35?'UART':n<=55?'ADC':n<=70?'Interrupt':'Extras';

export function readingPage({searchForm,lessons,state,labMarkup}){
 const toc=zones.map((zone,z)=>`<div><b>Zone ${z+1} · ${zone.title}</b>${sourceSections.filter(b=>b.zone===z&&b.tag==='h1'&&b.id!==`s${z}-0`).map(b=>`<a href="#learn/section/${b.id}">${E(b.text)}</a>`).join('')}</div>`).join('');
 const markByAnchor=Object.fromEntries(Object.entries(lessonAnchors).map(([id,anchor])=>[anchor,id]));
 const labs={'s0-83':'gpio','s0-122':'debounce','s0-188':'uart','s0-281':'adc','s0-427':'timing','s1-24':'bits','s2-68':'timer','s2-334':'trace'};
 return `<div class="scroll-reader"><header class="reader-intro"><p class="eyebrow">EN813202 · THE CONVERSATION NOTEBOOK</p><h1>STM32 อ่านต่อเนื่องเหมือนในแชท</h1><p class="lead">เนื้อหาเต็มพร้อมตาราง สูตร โค้ด และภาพจากแชทเดิม เลื่อนอ่านต่อหรือข้าม zone ได้ตามจังหวะของคุณ</p><div class="reader-shortcuts"><a href="#practice">ไถอ่านข้อสอบ 70 + 12 ข้อ →</a>${Object.keys(state.lessons).length&&state.lastLesson&&lessonAnchors[state.lastLesson]?`<a href="#learn/${state.lastLesson}">อ่านต่อจากบทที่ทำเครื่องหมายไว้ →</a>`:''}</div></header>${searchForm()}<nav class="zone-nav" aria-label="ข้ามระดับเนื้อหา">${zones.map((_,z)=>`<a href="#learn/zone/${z+1}"><span>0${z+1}</span>${['พื้นฐาน','พร้อมสอบ','เจาะลึก / กันเหนียว'][z]}</a>`).join('')}</nav><details class="reader-toc"><summary>สารบัญทั้งหมด · เลือกหัวข้อที่จะทบทวน</summary><div>${toc}</div></details><details class="reading-scope scope-details"><summary>ขอบเขตข้อสอบที่ยืนยัน และรุ่น HAL ที่ใช้อ้างอิง</summary><p>Blueprint ที่ยืนยัน: 70 ข้อ · 140 คะแนน, PA5 active high, PC13 active low, USART2 PA2/PA3, ADC1_IN0 PA0 และ VREF 3.3 V ส่วนบทเรียนและข้อจำลองเป็นเนื้อหาเพื่อฝึก ไม่ใช่ข้อสอบจริง</p><p>ยังไม่ยืนยัน MCU / HAL ของรายวิชา ตัวอย่าง HAL ใช้แนว HAL1 โดยอ้างอิง F4 HAL1 v1.8.3 ต้องตรวจ configuration ของบอร์ดก่อนใช้จริง ${'<a href="#sources">แหล่งอ้างอิงและข้อจำกัด →</a>'}</p></details>${zones.map((zone,z)=>`<section class="reading-zone" id="zone-${z+1}"><header class="zone-heading"><span>ZONE 0${z+1}</span><h2>${zone.title}</h2><p>${zone.note}</p></header><div class="chat-prose">${chatDocuments[z].blocks.map((b,n)=>{
  if(n===0&&b.tag==='h1')return '';
  const id=`s${z}-${n}`,lessonId=markByAnchor[id],lesson=lessons.find(l=>l.id===lessonId),isChapter=b.tag==='h1';
  return `<div class="source-block ${isChapter?'source-chapter':''}" id="${id}" data-source-block="${id}">${sourceBlock(b,isChapter?3:4)}</div>${lesson?`<div class="reading-mark"><button type="button" data-read-lesson="${lesson.id}" data-level="0" aria-pressed="${Boolean(state.lessons[lesson.id]?.[0])}">${state.lessons[lesson.id]?.[0]?'อ่านหัวข้อนี้แล้ว ✓':'ทำเครื่องหมายหัวข้อนี้'}</button></div>`:''}${labs[id]?`<details class="inline-experiment"><summary>ลองเปลี่ยนค่าให้เห็นผล · ${E({gpio:'GPIO',debounce:'Debounce',uart:'UART 8N1',adc:'ADC conversion',timing:'Sampling timing',bits:'Bit mask',timer:'Timer / PWM',trace:'Code tracing'}[labs[id]])}</summary>${labMarkup(labs[id])}</details>`:''}`;
 }).join('')}</div><div class="zone-end"><p>จบ Zone ${z+1} แล้ว เลือกตามจังหวะของคุณ</p>${z<2?`<a href="#learn/zone/${z+2}">อ่านลึกขึ้น: Zone ${z+2} ↓</a>`:''}<a href="#practice">ไปทบทวนข้อสอบพร้อมเฉลย →</a></div></section>`).join('')}<aside class="reading-scope" id="technical-notes"><h2>หมายเหตุสำหรับใช้ตัวอย่างอย่างถูกต้อง</h2><p>ตัวอย่างเป็น teaching snippets ไม่ใช่ firmware สำเร็จรูป: หลีกเลี่ยง blocking UART / HAL_Delay ใน ISR, รักษาอายุและ ownership ของ DMA buffer และตรวจ HAL_BUSY / error recovery ด้วย DMA transfer complete อาจเกิดก่อน UART ส่ง Stop bit สุดท้าย ต้องแยก DMA TC กับ UART TC ตาม driver</p><p>volatile ไม่ทำให้ read-modify-write เป็น atomic และ boolean flag อาจรวมหลาย event เป็นหนึ่ง การนำ counter มาใช้ต้องอ่านและล้างอย่างปลอดภัยตาม critical section ของระบบ สำหรับ consecutive-sample debounce ให้ counter อิ่มตัว (saturate) เพื่อไม่ให้ wrap</p><p>ADC มี 4096 ระดับสำหรับ 12-bit แต่ code สูงสุดคือ 4095 สูตร endpoint mapping ที่ใช้ในบทเรียนต่างจาก LSB step VREF / 4096 ต้องระบุ convention และไม่ใช้สูตรอุดมคติแทนข้อจำกัดทางไฟฟ้า / datasheet ของ MCU</p></aside><a href="#practice" class="primary">ทบทวนข้อสอบต่อทั้งชุด →</a></div>`;
}

export function practiceReadingPage(route){
 const selected=['GPIO','UART','ADC','Interrupt','Extras'].includes(route[1])?route[1]:'';
 const groups=[['GPIO','GPIO',15],['UART','UART',20],['ADC','ADC',20],['Interrupt','Interrupt',15],['Extras','กันเหนียว',12]];
 return `<div class="scroll-reader"><header class="reader-intro"><p class="eyebrow">READ · THINK · REVEAL</p><h1>ข้อสอบจำลอง<br>ไถอ่านและเปิดเฉลยได้เลย</h1><p class="lead">โจทย์และเหตุผลเต็มจากแชทเดิม 70 ข้อหลัก + 12 ข้อเสริม ลองคิดคำตอบในใจก่อน แล้วกดเปิดเหตุผลเมื่อพร้อม</p><p class="fine">Generated practice · ไม่ใช่ข้อสอบจริง · ข้อหลักข้อละ 2 คะแนน ต้องตอบและอธิบายถูกตามเงื่อนไขอาจารย์ ข้อเสริมไม่รวม 140 คะแนน</p></header><nav class="filter-tabs" aria-label="หมวดข้อสอบ"><a href="#practice" class="${selected?'':'selected'}">ทั้งหมด 82</a>${groups.map(([id,title,n])=>`<a href="#practice/${id}" class="${selected===id?'selected':''}">${title} ${n}</a>`).join('')}</nav><div class="practice-reading-tools"><label for="reading-jump">ไปยังข้อ</label><select id="reading-jump"><option value="">เลือกข้อที่จะทบทวน</option>${readingQuestions.map(q=>`<option value="${q.number}">${E(q.title)}</option>`).join('')}</select><a href="#exam">สลับไปโหมดทดสอบ →</a></div>${groups.filter(([id])=>!selected||id===selected).map(([id,title,n])=>`<section class="question-section" aria-labelledby="group-${id}"><header class="question-group-heading"><span>${id==='Extras'?'ADVANCED EXTRAS':'GENERATED PRACTICE'}</span><h2 id="group-${id}">${title} <small>${n} ข้อ${id==='Extras'?' · นอก blueprint ที่ยืนยัน':''}</small></h2></header>${readingQuestions.filter(q=>questionGroup(q.number)===id).map(q=>`<article class="reading-question" id="question-${q.number}"><h3>${E(q.title)}</h3><div class="chat-prose">${q.prompt.map(b=>sourceBlock(b)).join('')}</div><details class="answer-disclosure" data-read-answer="${q.number}"><summary>ดูเฉลยและเหตุผล <span aria-hidden="true">＋</span></summary><div class="chat-prose">${q.answer.map(b=>sourceBlock(b)).join('')}<p class="fine">ลองเช็กเหตุผลของคุณ: ระบุเงื่อนไข → อธิบายกลไก → สรุปผล คำตอบตรงอย่างเดียวจึงยังไม่เท่ากับเหตุผลครบ</p></div></details></article>`).join('')}</section>`).join('')}<div class="zone-end"><a href="#learn">กลับไปอ่านบทเรียน →</a><a href="#exam">พร้อมลองสอบแบบเก็บคำตอบ →</a></div></div>`;
}

export function bindReading(root){
 root.querySelectorAll('.chat-prose [data-kind="grid"]').forEach(grid=>{
  const count=/repeat\((8|10),/.exec(grid.style.gridTemplateColumns)?.[1];if(!count)return;
  grid.classList.add('source-bit-grid');grid.style.setProperty('--source-bit-count',count);
  const wrap=document.createElement('div');wrap.className='source-bit-scroll';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','ลำดับบิต เลื่อนแนวนอนเพื่อดูทุกบิต');grid.before(wrap);wrap.append(grid);
 });
 root.querySelectorAll('.chat-prose svg:not([data-kind="svg"]):not([data-kind="mermaid"])').forEach(el=>el.remove());
 root.querySelectorAll('.source-svg').forEach(el=>{el.tabIndex=0;el.setAttribute('role','region');el.setAttribute('aria-label','แผนภาพ เลื่อนแนวนอนได้');if(Number(el.querySelector('svg')?.getAttribute('viewBox')?.split(' ')[2])>450)el.dataset.wide='true';});
 root.querySelectorAll('.source-mermaid').forEach(el=>{el.style.maxWidth=`${Math.min(480,Number(el.querySelector('svg').getAttribute('viewBox').split(' ')[2]))}px`;});
 root.querySelectorAll('.chat-prose [style*="background-color: rgb(59, 139, 112)"]').forEach(el=>el.style.backgroundColor='#28735c');
 root.querySelectorAll('.chat-prose [style*="background-color: rgb(68, 123, 194)"]').forEach(el=>el.style.backgroundColor='#3267a8');
 root.querySelectorAll('.chat-prose [data-kind="table"]').forEach(el=>{el.tabIndex=0;el.setAttribute('role','region');el.setAttribute('aria-label','ตารางในบทเรียน เลื่อนแนวนอนได้');});
 root.querySelectorAll('.chat-prose th').forEach(el=>el.scope='col');
 root.querySelectorAll('.chat-prose svg').forEach((el,i)=>{el.setAttribute('role','img');el.setAttribute('aria-label',`แผนภาพประกอบ ${i+1}: ${el.textContent.replace(/\s+/g,' ').trim().slice(0,180)}`);});
 root.querySelectorAll('[data-kind="slider"]').forEach(el=>{
  const box=el.parentElement;el.innerHTML='<label for="source-pwm">Duty Cycle (%)</label><input id="source-pwm" type="range" min="0" max="100" step="1" value="25">';
  const update=()=>{const value=Number(el.querySelector('input').value);const labels=box.querySelectorAll('[data-kind="caption"]');const stats=box.querySelectorAll('strong[data-kind="title"]');stats[0].textContent=`${value}%`;stats[1].textContent=String(value*10);stats[2].textContent=`${(value/100).toFixed(2)} ms`;labels[0].textContent=`HIGH: ${value}%`;labels[1].textContent=`LOW: ${100-value}%`;const bar=el.nextElementSibling?.querySelector('[style*="width"]');if(bar)bar.style.width=`${value}%`;};
  el.querySelector('input').addEventListener('input',update);update();
 });
}
