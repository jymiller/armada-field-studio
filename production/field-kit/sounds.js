let ctx,master,active=[],timer;
function stop(){clearTimeout(timer);active.forEach(n=>{try{n.stop()}catch{}});active=[];document.querySelector('#playing').textContent='Ready.'}
async function cue(name,label){
 stop();if(name==='stop')return;
 try{
 ctx??=new (window.AudioContext||window.webkitAudioContext)();
 await ctx.resume();if(!master){master=ctx.createGain();master.connect(ctx.destination)}master.gain.value=Number(document.querySelector('#volume').value)*.55;
 const t=ctx.currentTime+.03;
 function hit(offset,duration,amp,hz=0){let n;if(hz){n=ctx.createOscillator();n.frequency.value=hz;n.type='sine'}else{const buffer=ctx.createBuffer(1,Math.ceil(duration*ctx.sampleRate),ctx.sampleRate);const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;n=ctx.createBufferSource();n.buffer=buffer}const env=ctx.createGain(),at=t+offset;env.gain.setValueAtTime(.0001,at);env.gain.exponentialRampToValueAtTime(amp,at+.008);env.gain.exponentialRampToValueAtTime(.0001,at+duration);n.connect(env);env.connect(master);n.start(at);n.stop(at+duration+.01);n.onended=()=>{n.disconnect();env.disconnect()};active.push(n)}
 if(name==='shine')[659,831,988].forEach((hz,i)=>hit(i*.13,.6,.38,hz));
 if(name==='drum')for(let i=0;i<22;i++){hit(i*.065,.083,.13+i*.012);hit(i*.065,.07,.12,124)}
 if(name==='clap')for(let i=0;i<98;i++)hit(i*.022+Math.random()*.06,.065,.2*(1-i/125));
 document.querySelector('#playing').textContent='Playing '+label.toLowerCase()+'.';timer=setTimeout(stop,name==='clap'?2400:name==='drum'?1650:1000)
 }catch{document.querySelector('#playing').textContent='Audio unavailable. Check the browser audio output.'}
}
document.querySelectorAll('[data-sound]').forEach(b=>b.onclick=()=>cue(b.dataset.sound,b.textContent.trim()));document.querySelector('#volume').oninput=e=>{if(master)master.gain.value=Number(e.target.value)*.55};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()})

const cueButtons=[...document.querySelectorAll('[data-sound]')];
let remote=false;
async function dispatchCue(button){
 if(!remote)return cue(button.dataset.sound,button.textContent.trim());
 try{const response=await fetch('relay',{method:'POST',body:button.dataset.sound});if(!response.ok)throw Error();document.querySelector('#playing').textContent='Cue sent to the phone.'}catch{document.querySelector('#playing').textContent='Phone link unavailable.'}
}
cueButtons.forEach(button=>button.onclick=()=>dispatchCue(button));
document.addEventListener('keydown',e=>{if(e.repeat||e.altKey||e.ctrlKey||e.metaKey||e.target.tagName==='INPUT')return;let i='1234'.indexOf(e.key);if(e.key.length===1&&i>=0){e.preventDefault();dispatchCue(cueButtons[i])}});
async function installRelay(){
 if(location.protocol!=='http:'||location.port!=='8173')return;
 const read=()=>fetch('relay',{cache:'no-store'}).then(r=>r.json());
 const initial=await read();let seen=initial.sequence,armed=false;
 const btn=document.createElement('button');btn.textContent=initial.role==='phone'?'Enable cues from Mac':'Send cues to old iPhone';
 const phone=initial.role==='phone';
 if(!phone){
   const samples=new Audio();
   const volume=document.querySelector('#volume');
   volume.oninput=()=>samples.volume=Number(volume.value);
   remote=false;
   document.querySelector('.intro p').textContent='Play a cue through this Mac. Number keys 1–4 also work here.';
   cueButtons[0].querySelector('span').textContent='Comedy drum fill';
   cueButtons[1].querySelector('span').textContent='Reveal flourish';
   const playSample=button=>{
     samples.pause();
     if(button.dataset.sound==='stop'){document.querySelector('#playing').textContent='Stopped.';return}
     samples.src=button.dataset.sound+'.m4a';
     samples.volume=Number(volume.value);
     samples.onended=()=>document.querySelector('#playing').textContent='Ready.';
     samples.play().then(()=>document.querySelector('#playing').textContent=button.textContent.trim()).catch(()=>document.querySelector('#playing').textContent='Sample unavailable.');
   };
   cueButtons.forEach(b=>b.onclick=()=>playSample(b));
   document.addEventListener('keydown',e=>{
     if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.tagName==='INPUT'||!/^[1-4]$/.test(e.key))return;
     e.preventDefault();e.stopImmediatePropagation();playSample(cueButtons[Number(e.key)-1]);
   },true);
   return;
 }
 if(phone){
   document.querySelector('h1').textContent='Demo speaker';
   document.querySelector('.intro p').textContent='Tap once, then leave this page open. The Mac runs the show.';
   document.querySelector('.intro').after(btn);
   document.querySelector('.keys').hidden=true;
   document.querySelector('.keys').style.display='none';
   btn.textContent='Start demo speaker';btn.style.cssText='font: bold 1.5rem system-ui;padding:1em;width:100%;cursor:pointer';
 }else document.querySelector('#playing').after(btn);
 let manual=false;
 btn.onclick=async()=>{
 if(initial.role==='phone'){ctx??=new (window.AudioContext||window.webkitAudioContext)();await ctx.resume();seen=(await read()).sequence;armed=true;btn.textContent='Speaker connected';btn.disabled=true;document.querySelector('#playing').textContent='Listening. Keep Safari open.'}
 else {manual=true;remote=!remote;btn.textContent=remote?'Play on Mac instead':'Send cues to old iPhone'}
 };
 let busy=false;setInterval(async()=>{if(busy||document.hidden)return;busy=true;try{
 if(armed)await fetch('relay',{method:'POST',body:'ready'});const data=await read();
 if(!phone&&!manual&&remote!==data.ready){remote=data.ready;btn.textContent=remote?'Play on Mac instead':'Send cues to old iPhone';document.querySelector('#playing').textContent=remote?'iPhone connected. Choose a cue.':'Playing on Mac.'}
 if(remote&&!data.ready)document.querySelector('#playing').textContent='Waiting for the old iPhone. Open Sound Machine and enable cues.';
 if(armed&&seen!==data.sequence){seen=data.sequence;if(data.fresh){const b=cueButtons.find(b=>b.dataset.sound===data.sound);if(b)cue(data.sound,b.textContent.trim())}}
 }catch{}finally{busy=false}},600)
}
installRelay().catch(()=>{});
