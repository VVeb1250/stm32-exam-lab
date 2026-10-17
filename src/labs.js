import {uartFrame,uartTime,adcCode,adcVoltage,timerFrequency,debounceEvents,stableSamples,escapeHtml as E} from './core.js';
export const labNames={gpio:'GPIO · กดปุ่มแล้วตามสัญญาณ',bits:'Bits · จับเลขฐานสอง',debounce:'Debounce · ไล่สถานะทีละ sample',uart:'UART · ดู 8N1 บนเส้นเวลา',adc:'ADC · หมุนแรงดัน อ่าน code',timing:'Timing · เมื่อ software ติดงาน',timer:'Timer · PSC / ARR / CCR',system:'System · ข้อมูลต้องส่งให้ทัน',trace:'Trace · เดินโค้ดทีละขั้น'};
const button=(text,attrs='')=>`<button type="button" ${attrs}>${text}</button>`;
const field=(label,input)=>`<label>${label}${input}</label>`;
const range=(name,value,min,max,step=1)=>`<input data-field="${name}" aria-label="${name}" type="range" value="${value}" min="${min}" max="${max}" step="${step}">`;
const num=(name,value,min,max)=>`<input data-field="${name}" aria-label="${name}" type="number" value="${value}" min="${min}" max="${max}" step="1" inputmode="numeric">`;
const select=(name,items)=>`<select data-field="${name}" aria-label="${name}">${items.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select>`;
const table=(headers,rows)=>`<div class="table-wrap" tabindex="0" role="region" aria-label="ตาราง trace เลื่อนแนวนอนได้"><table><thead><tr>${headers.map(v=>`<th scope="col">${v}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
export function wave(values,labels,{active=-1,description='สัญญาณ digital ตามลำดับเวลา'}={}) {
 const width=values.length*64+44;
 let path=`M 22 ${values[0]?30:94}`;
 values.forEach((v,i)=>{if(i) path+=` V ${v?30:94}`;path+=` H ${22+(i+1)*64}`;});
 return `<div class="wave-scroll"><svg viewBox="0 0 ${width} 150" role="img" aria-label="${E(description)}"><text x="1" y="32" class="axis">1</text><text x="1" y="97" class="axis">0</text>${values.map((_,i)=>`<path d="M${22+i*64} 15V110" class="grid-line"/>${active===i?`<rect x="${23+i*64}" y="16" width="62" height="94" class="cursor"/>`:''}<text text-anchor="middle" x="${54+i*64}" y="133" class="axis">${E(labels[i]??i)}</text>`).join('')}<path d="${path}" class="signal"/>${active>=0?`<circle cx="${54+active*64}" cy="${values[active]?30:94}" r="5" class="sample-dot"/>`:''}</svg></div>`;
}
export function labMarkup(name,compact=false){
 let controls='';
 if(name==='gpio') controls=`${button('กดปุ่ม PC13','data-action="press" aria-pressed="false" class="primary"')}<span class="lab-hint">คลิก หรือกด Enter เพื่อกด/ปล่อย</span>`;
 if(name==='bits') controls=`${field('Bit index สำหรับ mask',num('mask',5,0,7))}${button('Set bit','data-action="set"')}${button('Clear bit','data-action="clear"')}${button('Toggle bit','data-action="toggle"')}`;
 if(name==='uart') controls=`${field('Byte (decimal 0–255)',num('byte',65,0,255))}${field('Baud rate',select('baud',[[115200,'115200'],[9600,'9600']]))}${button('บิตถัดไป','data-action="step"')}${button('เริ่ม frame ใหม่','data-action="reset"')}`;
 if(name==='adc') controls=`${field('VIN (V)',range('VIN',1,0,3.3,0.01))}${field('Resolution',select('bits',[[12,'12-bit ตาม blueprint'],[10,'10-bit ทดลอง'],[8,'8-bit ทดลอง'],[16,'16-bit ทดลอง']]))}`;
 if(name==='debounce') controls=`${field('วิธีกรอง',select('mode',[['accepted','Time: เปลี่ยน last เฉพาะที่รับ'],['every','Time: เปลี่ยน last ทุก event'],['stable','Stable: 3 samples (ปรับปรุง)'],['original','Stable: โค้ดอาจารย์ uint8_t']]))}${field('เวลา ms หรือ pin samples คั่นด้วย comma','<input data-field="sequence" aria-label="sequence" value="100,110,145,155,206">')}${button('ไล่การทำงาน','data-action="run" class="primary"')}`;
 if(name==='timing') controls=`${field('ภาระงาน main',select('load',[['busy','UART + งานผันผวน'],['idle','งานน้อย (ตัวอย่าง)']]))}${button('สลับมุมมองเวลา','data-action="switch"')}`;
 if(name==='timer') controls=`${field('Timer clock (MHz)',num('clock',72,1,200))}${field('PSC',num('psc',71,0,65535))}${field('ARR',num('arr',999,1,65535))}${field('CCR',range('ccr',250,0,1000))}`;
 if(name==='system') controls=`${field('Sampling rate',select('rate',[[5,'5 Hz · 200 ms'],[1,'1 Hz · 1000 ms'],[1000,'1 kHz · stress case']]))}${field('Bytes / sample',num('bytes',12,1,1000))}${field('UART transfer',select('transfer',[['dma','DMA'],['blocking','Blocking']]))}${button('กดปุ่มสลับ 200/1000 ms','data-action="interval"')}`;
 if(name==='trace') controls=`${field('ตัวอย่าง',select('program',[['flag','Flag: irq / process'],['race','Race: count++ สูญหาย'],['lost','Race: read / clear flag'],['assign','C: = กับ ==']]))}${button('ก้าวถัดไป','data-action="step" class="primary"')}${button('เริ่ม trace ใหม่','data-action="reset"')}`;
 return `<section class="lab ${compact?'compact':''}" data-lab="${name}" aria-label="${E(labNames[name])}"><div class="lab-display" data-output></div><div class="lab-controls">${controls}</div><p class="lab-error" role="alert"></p>${compact?'':`<p class="fine">แบบจำลองเพื่อเรียนรู้ · ไม่ใช่ firmware emulator หรือผลวัดจากบอร์ดจริง</p>`}</section>`;
}
export function bindLabs(root){
 root.querySelectorAll('[data-lab]').forEach(host=>{
 const name=host.dataset.lab,out=host.querySelector('[data-output]'),error=host.querySelector('.lab-error');
 let pressed=false,value=65,step=-1,switched=false;
 const el=key=>host.querySelector(`[data-field="${key}"]`);
 const get=key=>el(key)?.value;
 const finite=(key,min,max)=>{const raw=get(key);const n=Number(raw);if(raw===''||!Number.isFinite(n)||n<min||n>max||(!['VIN'].includes(key)&&!Number.isInteger(n))) throw Error(`กรุณาใส่ ${key} ระหว่าง ${min} ถึง ${max}${key==='VIN'?'':' เป็นจำนวนเต็ม'}`);return n;};
 function render(){try{
 error.textContent='';
 if(name==='gpio'){
 out.innerHTML=`<div class="board-title"><span>PC13 → CPU → PA5</span><span>3.3 V · Logic model</span></div><svg class="circuit" viewBox="0 0 640 240" role="img" aria-label="${pressed?'ปุ่มกด PC13 LOW 0, LED PA5 HIGH 1 ติด':'ปล่อยปุ่ม PC13 HIGH 1, LED PA5 LOW 0 ดับ'}"><path class="wire" d="M80 30V65m0 34v34h170m-170 0v25m0 35v23M390 133h140v-30"/><path class="resistor" d="M80 65l-9 5 18 6-18 6 18 6-9 11"/><path class="switch-line" d="M80 158L${pressed?80:105} 193"/><path class="wire" d="M65 217h30m-25 7h20m-15 7h10"/><circle cx="80" cy="133" r="5" class="node"/><rect x="250" y="75" width="140" height="116" rx="6" class="chip"/><text x="320" y="126" text-anchor="middle" class="chip-label">STM32</text><text x="320" y="151" text-anchor="middle" class="axis">if (pressed)</text><circle cx="530" cy="82" r="22" class="led ${pressed?'on':''}"/><path class="led-mark" d="M522 75l16 8-16 8zM538 74v18"/><text x="80" y="20" text-anchor="middle" class="axis">VDD</text><text x="110" y="116" class="pin-label">PC13 = ${pressed?0:1}</text><text x="438" y="160" class="pin-label">PA5 = ${pressed?1:0}</text><text x="110" y="185" class="axis">Active low</text><text x="495" y="40" class="axis">LED · ${pressed?'ON':'OFF'}</text></svg><div class="readouts" aria-live="polite"><div><span>BUTTON INPUT</span><strong>${pressed?'0 · LOW':'1 · HIGH'}</strong><small>${pressed?'กดอยู่':'ปล่อยอยู่'}</small></div><div><span>LED OUTPUT</span><strong>${pressed?'1 · HIGH':'0 · LOW'}</strong><small>${pressed?'ไฟติด':'ไฟดับ'}</small></div></div>`;
 const b=host.querySelector('[data-action="press"]');b.setAttribute('aria-pressed',String(pressed));b.textContent=pressed?'ปล่อยปุ่ม PC13':'กดปุ่ม PC13';
 }
 if(name==='bits'){
 out.innerHTML=`<p class="board-title">กดแต่ละบิตเพื่อเปลี่ยนค่า · b7 → b0</p><div class="bit-bank">${Array.from({length:8},(_,j)=>{const i=7-j;return button(`<small>b${i} · ${2**i}</small><strong>${(value>>i)&1}</strong>`,`data-bit="${i}" aria-label="bit ${i}" aria-pressed="${Boolean((value>>i)&1)}"`);}).join('')}</div><div class="readouts"><div><span>DECIMAL</span><strong>${value}</strong></div><div><span>HEXADECIMAL</span><strong>0x${value.toString(16).toUpperCase().padStart(2,'0')}</strong></div><div><span>BINARY</span><strong>${value.toString(2).padStart(8,'0')}</strong></div></div>`;
 }
 if(name==='uart'){
 const byte=finite('byte',0,255),baud=finite('baud',1,1000000),frame=uartFrame(byte);step=Math.min(9,step);
 out.innerHTML=`<p class="board-title">8N1 · LSB first <span>เวลา →</span></p>${wave(frame,['Start',...Array.from({length:8},(_,i)=>`b${i}`),'Stop'],{active:step,description:`Frame 0x${byte.toString(16)}: ${frame.join(', ')}`})}<div class="frame-bits">${frame.map((v,i)=>button(`${['Start','b0','b1','b2','b3','b4','b5','b6','b7','Stop'][i]}<b>${v}</b>`,`data-frame="${i}" aria-pressed="${i===step}"`)).join('')}</div><div class="readouts"><div><span>BYTE</span><strong>0x${byte.toString(16).toUpperCase().padStart(2,'0')}</strong></div><div><span>BIT PERIOD</span><strong>${(1e6/baud).toFixed(2)} µs</strong></div><div><span>10-BIT FRAME</span><strong>${(uartTime(1,baud)*1e6).toFixed(2)} µs</strong></div></div><p class="lab-caption" aria-live="polite">${step<0?'Idle HIGH → Start LOW → b0 ถึง b7 → Stop HIGH':`กำลังอ่าน ${['Start','b0','b1','b2','b3','b4','b5','b6','b7','Stop'][step]} = ${frame[step]} ที่กลางช่องเวลา ${((step+0.5)*1e6/baud).toFixed(2)} µs หลังเริ่ม frame`} · ไม่มี parity</p>`;
 }
 if(name==='adc'){
 const vin=finite('VIN',0,3.3),bits=finite('bits',8,16),code=adcCode(vin,bits),max=2**bits-1;
 out.innerHTML=`<p class="board-title">ADC1_IN0 · PA0 <span>VREF+ = 3.3 V</span></p><div class="adc-scale"><span>0 V</span><div class="scale-track"><i style="width:${vin/3.3*100}%"></i><b style="left:${vin/3.3*100}%"></b></div><span>3.3 V</span></div><div class="adc-flow"><div><span>ANALOG INPUT</span><strong>${vin.toFixed(2)}<small> V</small></strong></div><span class="flow-arrow" aria-hidden="true">→</span><div class="converter">${bits}-bit<br>ADC</div><span class="flow-arrow" aria-hidden="true">→</span><div><span>DIGITAL CODE</span><strong>${code}<small> / ${max}</small></strong></div></div><p class="equation">round(${vin.toFixed(2)} × ${max} / 3.3) = <b>${code}</b></p><p class="binary-label">Binary word · b${bits-1} (MSB) → b0 (LSB)</p><div class="code-bits" style="--bit-count:${bits}" role="img" aria-label="${bits}-bit binary จาก MSB ถึง LSB ${code.toString(2).padStart(bits,'0')}">${code.toString(2).padStart(bits,'0').split('').map(b=>`<span class="${b==='1'?'high':''}">${b}</span>`).join('')}</div><p class="lab-caption">Endpoint model + nearest rounding ตามโจทย์ · ${2**bits} levels · LSB ${(3300/2**bits).toFixed(4)} mV · แปลงกลับ ${adcVoltage(code,bits).toFixed(4)} V</p>`;
 }
 if(name==='debounce'){
 const mode=get('mode'),parts=get('sequence').split(',').map(s=>s.trim());if(parts.length>200||parts.some(v=>v==='')) throw Error('ใส่ค่าที่ไม่ว่าง คั่นด้วย comma ไม่เกิน 200 ค่า');
 const values=parts.map(Number);if(values.some(v=>!Number.isInteger(v)||v<0||v>4294967295)) throw Error('ใช้จำนวนเต็มไม่ติดลบในช่วง uint32_t');
 const stable=mode==='stable'||mode==='original';if(stable&&values.some(v=>v!==0&&v!==1))throw Error('Stable samples รับเฉพาะ 0 หรือ 1');
 const rows=stable?stableSamples(values,{saturate:mode==='stable'}):debounceEvents(values,mode);
 out.innerHTML=`<p class="board-title">${stable?'ยืนยันระดับครบ 3 samples':'Time threshold = 50 ms'}</p>${stable?wave(values,values.map((_,i)=>i+1)):''}${stable?table(['sample','pin','candidate','streak','stable','count'],rows.map((r,i)=>[i+1,r.pin,r.candidate,r.streak,r.stable,r.count])):table(['now ms','Δt','รับ?','last หลัง event','count'],rows.map(r=>[r.now,r.delta,r.accepted?'รับ':'ปฏิเสธ',r.last,r.count]))}<p class="lab-caption" aria-live="polite">นับได้ <b>${rows.at(-1).count}</b> ครั้ง · ${mode==='accepted'?'last เปลี่ยนเฉพาะ event ที่รับ, first รับได้ทันที':mode==='every'?'last เปลี่ยนทุก event; ไม่มีการนับย้อนหลังเมื่อเงียบ':mode==='original'?'ตามโค้ดอาจารย์: uint8_t streak วนกลับได้':'โหมดปรับปรุง: streak หยุดที่ 3 ไม่ wrap'}</p>`;
 }
 if(name==='timing'){
 const busy=get('load')==='busy',actual=busy?[0,1,2.2,3,4.4,5.1]:[0,1,2.02,3.01,4.02,5.01];
 const strip=(times,label)=>`<div class="timing-strip"><b>${label}</b><div class="timeline">${times.map(t=>`<i style="left:${t/6*100}%"><span>${t} ms</span></i>`).join('')}</div></div>`;
 out.innerHTML=`<p class="board-title">ต้องการ 1 kHz · ทุก 1 ms</p>${switched?strip(actual,'Software loop'):strip([0,1,2,3,4,5],'Hardware trigger')}${switched?strip([0,1,2,3,4,5],'Hardware trigger'):strip(actual,'Software loop')}<div class="flow-diagram"><span>Timer trigger</span><b>→</b><span>ADC conversion</span><b>→</b><span>DMA → RAM</span></div><p class="lab-caption">เวลาจำลองเพื่อเทียบแนวคิด ไม่ใช่ผลวัด · Timer ลด jitter จาก main load ส่วน DMA ย้ายผล ไม่ได้สร้าง trigger</p>`;
 }
 if(name==='timer'){
 const clock=finite('clock',1,200)*1e6,psc=finite('psc',0,65535),arr=finite('arr',1,65535);el('ccr').max=arr+1;
 if(Number(get('ccr'))>arr+1) el('ccr').value=arr+1;
 const ccr=finite('ccr',0,arr+1),freq=timerFrequency(clock,psc,arr),duty=ccr/(arr+1)*100;
 const compareX=20+duty*5.6,signalPath=ccr===0?'M20 95H580':ccr===arr+1?'M20 30H580':`M20 30H${compareX}V95H580`;
 out.innerHTML=`<p class="board-title">PWM1 · Active high · Upcounting</p><svg viewBox="0 0 640 150" role="img" aria-label="PWM duty ${duty.toFixed(1)} เปอร์เซ็นต์"><path d="M${compareX} 24V110" class="compare-marker grid-line"/><path d="${signalPath}" class="signal"/><path d="M20 110H580" class="grid-line"/><text x="20" y="135" class="axis">CNT 0</text><text x="${compareX}" y="18" text-anchor="${duty<15?'start':duty>85?'end':'middle'}" class="compare-label axis">CCR ${ccr}</text><text x="580" y="135" text-anchor="end" class="axis">ARR ${arr}</text></svg><div class="readouts"><div><span>FREQUENCY</span><strong>${freq.toFixed(2)} Hz</strong></div><div><span>DUTY</span><strong>${duty.toFixed(2)}%</strong></div><div><span>PERIOD</span><strong>${(1000/freq).toFixed(3)} ms</strong></div></div><p class="equation">${clock} / ((${psc}+1) × (${arr}+1))</p><p class="lab-caption">Timer clock เป็นค่าทดลอง · ไม่มี repetition เพิ่ม · CCR=${ccr}${ccr===0?' · LOW ตลอดรอบ':ccr===arr+1?' · HIGH ตลอดรอบ':''}</p>`;
 }
 if(name==='system'){
 const rate=finite('rate',1,1000),bytes=finite('bytes',1,1000),required=rate*bytes*10,ok=required<=115200;
 out.innerHTML=`<p class="board-title">ADC → Buffer → USART2 <span>115200 Baud · 8N1</span></p><div class="flow-diagram"><span>PA0<br><b>${rate} samples/s</b></span><b>→</b><span>RAM<br><b>${bytes} bytes/sample</b></span><b>→</b><span>UART<br><b>11,520 bytes/s max</b></span></div><div class="budget-track"><i style="width:${Math.min(100,required/115200*100)}%" class="${ok?'':'over'}"></i></div><div class="readouts"><div><span>REQUIRED</span><strong>${required.toLocaleString()} bit/s</strong></div><div><span>ผลการส่งต่อเนื่อง</span><strong>${ok?'อยู่ในเพดานสาย':'ส่งไม่ทัน'}</strong></div></div><p class="lab-caption" aria-live="polite">${get('transfer')==='dma'?'DMA ลด CPU load แต่ไม่เพิ่ม bandwidth':'Blocking ทำให้ main รอ แต่ EXTI ยังเข้าได้ถ้า enable/mask/priority อนุญาต'} · ${ok?'ต้องเผื่อ framing/protocol gap และออกแบบ buffer':'Buffer ใหญ่แค่เลื่อนเวลาที่เต็ม ต้องลด payload/rate หรือเพิ่ม baud'}</p>`;
 }
 if(name==='trace'){
 const programs={flag:[['เริ่ม','pressed=0; interval=200'],['irq()','pressed=1; interval=200'],['process()','pressed=0; interval=1000'],['process() ไม่มี flag','pressed=0; interval=1000'],['irq()','pressed=1; interval=1000'],['process()','pressed=0; interval=200']],race:[['เริ่ม count=5','count=5'],['Main อ่าน count','main_temp=5; count=5'],['ISR อ่าน เพิ่ม เขียน','count=6; main_temp=5'],['Main เพิ่มค่าเก่าและเขียน','count=6 (ควรเป็น7 หากเพิ่มครบ)']],lost:[['เริ่มมี event เก่า','flag=1'],['Main อ่านเห็น1','flag=1; take=1'],['ISR มี event ใหม่ ตั้ง1','flag=1; take=1'],['Main clear ตามเดิม','flag=0; event ใหม่หาย']],assign:[['เริ่ม','x=5'],['if (x == 3) เป็น false','x=5'],['เริ่มอีกกรณี x=5','x=5'],['if (x = 3) assignก่อน','x=3; เงื่อนไข true'],['เข้า block: x=10','x=10']]};
 const rows=programs[get('program')];step=Math.max(0,Math.min(rows.length-1,step));
 out.innerHTML=`<p class="board-title">Code trace · ขั้น ${step+1}/${rows.length}</p><div class="trace-step" aria-live="polite"><span>${E(rows[step][0])}</span><code>${E(rows[step][1])}</code></div>${table(['ขั้น','การทำงาน','ตัวแปรหลังขั้น'],rows.slice(0,step+1).map((r,i)=>[i+1,E(r[0]),E(r[1])]))}<p class="lab-caption">ลำดับจำลองกำหนดไว้ชัดเจน · race examples แสดง interleaving ที่เป็นไปได้ ไม่ใช่ทุกการรันจะได้แบบนี้</p>`;
 }
 }catch(err){error.textContent=err.message;}}
 host.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.dataset.action==='press')pressed=!pressed;
 if(b.dataset.bit!==undefined)value^=1<<Number(b.dataset.bit);
 if(['set','clear','toggle'].includes(b.dataset.action)){
 try{const mask=1<<finite('mask',0,7);if(b.dataset.action==='set')value|=mask;if(b.dataset.action==='clear')value&=~mask;if(b.dataset.action==='toggle')value^=mask;}catch(err){error.textContent=err.message;return;}}
 if(b.dataset.frame!==undefined)step=Number(b.dataset.frame);
 if(b.dataset.action==='step')step++;
 if(b.dataset.action==='reset')step=name==='uart'?-1:0;
 if(b.dataset.action==='switch')switched=!switched;
 if(b.dataset.action==='interval')el('rate').value=get('rate')==='5'?'1':'5';
 render();
 if(b.dataset.bit!==undefined)host.querySelector(`[data-bit="${b.dataset.bit}"]`)?.focus();
 if(b.dataset.frame!==undefined)host.querySelector(`[data-frame="${b.dataset.frame}"]`)?.focus();
 });
 host.addEventListener('input',event=>{if(event.target.dataset.field==='sequence')return;render();});
 host.addEventListener('change',event=>{if(event.target.dataset.field==='mode'){el('sequence').value=['stable','original'].includes(get('mode'))?'1,0,1,0,0,0,0':'100,130,160,220';}if(event.target.dataset.field==='program')step=0;render();});
 render();
 });
}
