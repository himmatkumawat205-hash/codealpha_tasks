import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.join(import.meta.dirname,'dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.wav':'audio/wav'};
const server=http.createServer((req,res)=>{
 let requested;try{requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
 const target=path.resolve(root,requested==='/'?'index.html':`.${requested}`);
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.stat(target,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404).end('Not found');return}const headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
 const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);let start=0,end=stat.size-1,status=200;
 if(range){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;if(start>end){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return}status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`}
 headers['Content-Length']=end-start+1;res.writeHead(status,headers);if(req.method==='HEAD'){res.end();return}fs.createReadStream(target,{start,end}).pipe(res);
 });
});
server.listen(5173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:5173'));
