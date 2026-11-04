import { readFile } from 'node:fs/promises';
const UPSTREAM='https://dir-alwatan-48-hail.ab987ati.chatgpt.site';
export default async function handler(req,res){
const method=req.method||'GET';
if(!['GET','HEAD','POST','PUT'].includes(method)){res.statusCode=405;res.end();return;}
if(!['GET','HEAD'].includes(method)){const origin=req.headers.origin;if(!origin||new URL(origin).host!==req.headers.host){res.statusCode=403;res.end('Forbidden');return;}}
const incoming=new URL(req.url,'https://'+req.headers.host),target=new URL(UPSTREAM);
const path=req.query?.__path??incoming.searchParams.get('__path')??incoming.pathname;
target.pathname='/'+String(Array.isArray(path)?path.join('/'):path).replace(/^\/+/, ''); incoming.searchParams.delete('__path');target.search=incoming.search;
if(target.pathname==='/share-image.jpg'){
try{const image=await readFile(new URL('../assets/share-image.jpg',import.meta.url));res.statusCode=200;res.setHeader('content-type','image/jpeg');res.setHeader('cache-control','public, max-age=86400');res.end(method==='HEAD'?undefined:image);}catch{res.statusCode=404;res.end();}return;
}
const headers=new Headers();for(const key of ['accept','content-type','cookie','user-agent','rsc','next-router-state-tree','next-router-prefetch','next-url','range','if-none-match'])if(typeof req.headers[key]==='string')headers.set(key,req.headers[key]);
if(!['GET','HEAD'].includes(method))headers.set('origin',UPSTREAM);
let body;if(!['GET','HEAD'].includes(method)){if(req.body!==undefined&&req.body!==null)body=Buffer.isBuffer(req.body)?req.body:typeof req.body==='string'?req.body:JSON.stringify(req.body);else{const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>4*1024*1024){res.statusCode=413;res.end();return;}chunks.push(chunk);}body=Buffer.concat(chunks);}if(Buffer.byteLength(body)>4*1024*1024){res.statusCode=413;res.end();return;}}
try{const response=await fetch(target,{method,headers,body,redirect:'manual',signal:AbortSignal.timeout(45000)});res.statusCode=response.status;for(const[key,value]of response.headers){if(['content-encoding','content-length','transfer-encoding','connection','set-cookie','location'].includes(key))continue;res.setHeader(key,value);}const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('set-cookie',cookies);const location=response.headers.get('location');if(location){const dest=new URL(location,UPSTREAM);res.setHeader('location',dest.origin===UPSTREAM?dest.pathname+dest.search+dest.hash:location);}if(target.pathname.startsWith('/api/')||['/admin','/login'].includes(target.pathname))res.setHeader('cache-control','private, no-store');if(method==='HEAD'){res.end();return;}const contentType=response.headers.get('content-type')||'';
if(response.status===200&&contentType.includes('text/html')){
let html=await response.text();
html=html.replace(/<meta\b[^>]*(?:property|name)\s*=\s*["'](?:og:|twitter:)[^"']*["'][^>]*>/gi,'');
const preview=`<meta property="og:type" content="website"><meta property="og:locale" content="ar_SA"><meta property="og:title" content="مبادرة درع الوطن"><meta property="og:description" content="مبادرة درع الوطن — الثامنة والأربعون للطفولة المبكرة"><meta property="og:url" content="https://diralwatan48.vercel.app${target.pathname.replace(/[&<>\"]/g,'')}"><meta property="og:image" content="https://diralwatan48.vercel.app/share-image.jpg"><meta property="og:image:secure_url" content="https://diralwatan48.vercel.app/share-image.jpg"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:alt" content="درع الوطن"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="مبادرة درع الوطن"><meta name="twitter:image" content="https://diralwatan48.vercel.app/share-image.jpg">`;
html=html.replace(/<\/head\s*>/i,preview+'</head>');
res.removeHeader('etag');res.end(html);return;
}
res.end(Buffer.from(await response.arrayBuffer()));}catch{res.statusCode=502;res.setHeader('content-type','text/plain;charset=utf-8');res.end('تعذر الاتصال بالمبادرة، يرجى المحاولة بعد قليل.');}}
