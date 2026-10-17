import {mkdir,cp,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const path of ['index.html','src','public']) await cp(path,`dist/${path}`,{recursive:true});
await writeFile('dist/.nojekyll','');
console.log('Static build ready: dist. Relative assets + hash routes support GitHub Pages subpaths.');
