export const STORAGE_KEY='stm32-signal-lab-v1';
export const uint32Diff=(now,last)=>(now-last)>>>0;
export const uartFrame=(byte)=>[0,...Array.from({length:8},(_,i)=>(byte>>i)&1),1];
export const uartTime=(bytes,baud,bits=10)=>bytes*bits/baud;
export const adcCode=(vin,bits=12,vref=3.3)=>Math.round(Math.min(vref,Math.max(0,vin))*(2**bits-1)/vref);
export const adcVoltage=(code,bits=12,vref=3.3)=>code*vref/(2**bits-1);
export const timerFrequency=(clock,psc,arr)=>clock/((psc+1)*(arr+1));
export function debounceEvents(times,mode='accepted') {
  let last=0,count=0,first=true;
  return times.map(now=>{
    const delta=uint32Diff(now,last);
    const accepted=(mode==='accepted'&&first)||delta>=50;
    if(accepted) {count++;first=false;}
    if(accepted||mode==='every') last=now;
    return {now,delta,last,count,accepted};
  });
}
export function stableSamples(pins,{saturate=true}={}) {
  let stable=1,candidate=1,streak=0,count=0;
  return pins.map(pin=>{
    streak=pin===candidate?(saturate?Math.min(3,streak+1):(streak+1)&255):1;
    candidate=pin;
    if(streak===3&&stable!==candidate) {stable=candidate;if(stable===0) count++;}
    return {pin,stable,candidate,streak,count};
  });
}
export function emptyState(){return {version:1,lessons:{},depth:{},practice:{},exam:{answers:{},submitted:false,index:0},lastLesson:'foundations'};}
export function loadState(storage){
  try {
    const raw=storage.getItem(STORAGE_KEY); if(!raw) return emptyState();
    const data=JSON.parse(raw);
    if(data?.version!==1||!data.lessons||!data.practice||!data.exam?.answers) return emptyState();
    // Saved input is untrusted. Keep only expected records and bounded primitives.
    const clean=emptyState();
    const recordMap=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
    for(const [id,v] of Object.entries(recordMap(data.lessons))) if(/^[a-z-]{1,60}$/.test(id)) clean.lessons[id]=Object.fromEntries([0,1,2].map(i=>[i,v?.[i]===true]));
    for(const [id,v] of Object.entries(recordMap(data.depth))) if(/^[a-z-]{1,60}$/.test(id)&&Number.isInteger(v)&&v>=0&&v<=2) clean.depth[id]=v;
    const answers=v=>Object.fromEntries(Object.entries(recordMap(v)).filter(([id])=>/^q\d{1,2}$/.test(id)).map(([id,r])=>[id,{choice:Number.isInteger(r?.choice)&&r.choice>=0&&r.choice<4?r.choice:undefined,reason:typeof r?.reason==='string'?r.reason.slice(0,6000):'',checks:Array.isArray(r?.checks)?r.checks.slice(0,5).map(v=>v===true):[],revealed:r?.revealed===true}]));
    clean.practice=answers(data.practice);
    clean.lastLesson=typeof data.lastLesson==='string'&&/^[a-z-]{1,60}$/.test(data.lastLesson)?data.lastLesson:'foundations';
    clean.exam={answers:answers(data.exam.answers),submitted:data.exam.submitted===true,index:Number.isInteger(data.exam.index)?Math.max(0,Math.min(69,data.exam.index)):0};
    return clean;
  } catch {return emptyState();}
}
export function answerScore(questions,answers){return questions.filter(q=>Number.isInteger(answers[q.id]?.choice)&&answers[q.id].choice===q.answer).length;}
export function rubricScore(questions,answers){return questions.filter(q=>answers[q.id]?.choice===q.answer&&typeof answers[q.id]?.reason==='string'&&answers[q.id].reason.trim()&&q.rubric.every((_,i)=>answers[q.id]?.checks?.[i]===true)).length*2;}
export const escapeHtml=(value)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
