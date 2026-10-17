import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {readdir,readFile} from 'node:fs/promises';
test('static build integration: project subpath, MIME, runtime-only package, 404',async()=>{
 const build=spawnSync(process.execPath,['scripts/build.mjs'],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 const files=await readdir('dist');assert.deepEqual(files.sort(),['.nojekyll','index.html','public','src']);
 const app=await readFile('dist/src/app.js','utf8');assert.ok(app.includes("from './questions.js'"));
 const port=23100+Math.floor(Math.random()*1000),server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
 const base=`http://127.0.0.1:${port}/stm32-exam-lab/`;
 try{
 for(let i=0;i<40;i++){try{await fetch(base);break;}catch{await new Promise(r=>setTimeout(r,50));}}
 const root=await fetch(base+'#learn/adc');assert.equal(root.status,200);assert.match(root.headers.get('content-type'),/text\/html/);
 const [js,css,font,notFound]=await Promise.all(['src/questions.js','src/style.css','public/NotoSansThai.ttf','not-real'].map(p=>fetch(base+p)));
 assert.equal(js.status,200);assert.match(js.headers.get('content-type'),/javascript/);assert.equal(css.status,200);assert.match(css.headers.get('content-type'),/text\/css/);assert.ok((await font.arrayBuffer()).byteLength>100000);assert.equal(notFound.status,404);
 assert.equal((await fetch(base+'evidence/test-results.json')).status,404);
 }finally{server.kill();}
});
