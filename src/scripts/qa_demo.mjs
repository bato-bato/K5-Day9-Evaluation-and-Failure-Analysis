// Browser smoke checks against the local Chrome headless CDP session; no npm dependency.
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const tabs=await (await fetch('http://127.0.0.1:9229/json')).json();
const tab=tabs.find(t=>t.url.startsWith('http://127.0.0.1:8099'));
if(!tab)throw new Error('Start local preview and Chrome CDP before this check.');
const socket=new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
let seq=0;const waiting=new Map();
socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&waiting.has(m.id)){const {resolve,reject}=waiting.get(m.id);waiting.delete(m.id);m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result);}});
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;waiting.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const results=[];
async function check(name,expression){const ok=await evaluate(expression);results.push({name,passed:!!ok});if(!ok)throw new Error(name);console.log('PASS',name);}
const out=path.resolve('prototype-qa');mkdirSync(out,{recursive:true});
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
await send('Page.reload',{ignoreCache:true});
await new Promise(r=>setTimeout(r,700));
await check('initial fixed merges',`document.querySelector('#gate-exit').textContent==='0' && document.querySelector('#stat-pass').textContent.includes('100')`);
writeFileSync(path.join(out,'desktop.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data,'base64'));
await check('regression blocks',`(()=>{const s=document.querySelector('#scenario');s.value='seeded_regression';s.dispatchEvent(new Event('change'));return document.querySelector('#gate-exit').textContent==='1'&&document.querySelector('#stat-pass').textContent.includes('71,43')})()`);
await check('gate modal contains pass_rate verdict',`(()=>{document.querySelector('#gate-details').click();return document.querySelector('#detail-dialog').open&&document.querySelector('#gate-output').textContent.includes('blocked:')&&document.querySelector('#gate-output').textContent.includes('pass_rate')})()`);
await evaluate(`document.querySelector('#close-dialog').click()`);
await check('slice regression blocks with v2',`(()=>{const s=document.querySelector('#scenario');s.value='slice_regression';s.dispatchEvent(new Event('change'));return document.querySelector('#gate-exit').textContent==='1'&&document.querySelector('#spec-badge').textContent.includes('V2')})()`);
await check('honest refactor merges',`(()=>{const s=document.querySelector('#scenario');s.value='honest_refactor';s.dispatchEvent(new Event('change'));return document.querySelector('#gate-exit').textContent==='0'})()`);
await check('trace identifies first wrong step',`(()=>{document.querySelector('#open-trace').click();return document.querySelectorAll('.timeline-event.wrong').length===1&&document.querySelector('#trace-amount').textContent.includes('20.000')})()`);
await check('fixed trace has zero money and no override',`(()=>{document.querySelector('[data-trace=fixed]').click();return document.querySelectorAll('.timeline-event.wrong').length===0&&document.querySelector('#trace-result').textContent==='denied'})()`);
await check('taxonomy search works',`(()=>{document.querySelector('[data-page=taxonomy]').click();const s=document.querySelector('#fm-search');s.value='misreport';s.dispatchEvent(new Event('input'));return document.querySelectorAll('.fm-card').length===1&&document.querySelector('.fm-id').textContent==='FM-08'})()`);
await check('judge calibration cards render',`(()=>{document.querySelector('[data-page=judge]').click();return document.querySelectorAll('.judge-card').length===2&&document.querySelectorAll('#audit-table tr').length>=5})()`);
await check('demo tour reaches completion',`(()=>{document.querySelector('[data-page=overview]').click();document.querySelector('#start-demo').click();for(let i=0;i<5;i++)document.querySelector('#tour-next').click();return document.querySelector('#tour').classList.contains('hidden')})()`);
await evaluate(`document.querySelector('[data-page=overview]').click();const s=document.querySelector('#scenario');s.value='fixed';s.dispatchEvent(new Event('change'));`);
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await check('mobile overview has no horizontal overflow',`document.documentElement.scrollWidth<=window.innerWidth`);
writeFileSync(path.join(out,'mobile.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data,'base64'));
await check('mobile menu opens',`(()=>{document.querySelector('#mobile-menu').click();return document.querySelector('.sidebar').classList.contains('open')})()`);
for(const page of ['compare','trace','taxonomy','judge']){
 await evaluate(`document.querySelector('[data-page=${page}]').click()`);
 await check(`mobile ${page} has no horizontal overflow`,`document.documentElement.scrollWidth<=window.innerWidth`);
}
writeFileSync(path.join(out,'checks.json'),JSON.stringify(results,null,2));
console.log(`${results.length}/${results.length} checks passed; screenshots: ${out}`);
await send('Browser.close');socket.close();
