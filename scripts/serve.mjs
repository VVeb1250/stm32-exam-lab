import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
createServer(async(req,res)=>{
  try {
    let route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(route.startsWith('/stm32-exam-lab/')) route=route.slice('/stm32-exam-lab'.length);
    const file=resolve(root,`.${route.endsWith('/')?`${route}index.html`:route}`);
    if(!file.startsWith(root+sep)) {res.writeHead(403).end();return;}
    if(!(await stat(file)).isFile()) throw Error('not file');
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(await readFile(file));
  } catch {res.writeHead(404).end('Not found');}
}).listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('http://127.0.0.1:4173/stm32-exam-lab/'));
