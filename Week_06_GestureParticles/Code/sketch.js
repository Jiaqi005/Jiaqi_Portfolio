/* DM3014 Interactive Devices — Week 6
 * Jiaqi Li — Gesture Bloom
 * Based on Ashley's Train Your Own Model classroom example.
 * I used a three-gesture Teachable Machine model to control particles:
 * Open Hand makes them bloom, Fist gathers them, and Peace makes three orbits.
 * I added the particle animation, gesture controls, and camera/model status.
 * The original classroom example and the model source are credited in README.md.
 */
// Same model, bundled locally; original URL is in MODEL_SOURCE.txt.
const imageModelURL=new URL('./model/',window.location.href).href;
const KNOWN=['Open Hand','Fist','Peace'];
let classifier=null,modelReady=false,modelLoading=false,video=null,inputFrame;
let cameraReady=false,requesting=false,classifying=false,live=false;
let gesture='Idle',candidate='',candidateCount=0,lastConfident=0;
let confidence=0,rawLabel='',particles=[],burst=0,lastClassify=0;
let modelTimer=null,loadGeneration=0,recognitionSession=0;
function setup(){
 createCanvas(windowWidth,windowHeight);pixelDensity(1);
 inputFrame=createGraphics(320,240);inputFrame.pixelDensity(1);makeParticles();
 document.getElementById('start-camera').onclick=startRecognition;
 document.getElementById('live').onclick=startRecognition;
 document.getElementById('preview').onclick=()=>preview('Open Hand');
 document.querySelectorAll('[data-gesture]').forEach(b=>b.onclick=()=>preview(b.dataset.gesture));
 document.getElementById('full').onclick=()=>{try{fullscreen(!fullscreen());}catch(e){setStatus('Full screen unavailable; canvas still fits the window.');}};
}
function setStatus(message){document.getElementById('status').textContent=message;}
function makeParticles(){
 particles=[];const n=Math.min(460,Math.max(180,Math.floor(width*height/3800)));
 for(let i=0;i<n;i++)particles.push({x:width/2+random(-30,30),y:height/2+random(-30,30),vx:0,vy:0,a:random(TWO_PI),r:Math.sqrt(random()),phase:random(TWO_PI),group:i%3,size:random(1.5,3.8)});
}
function setGesture(next){
 if(next!==gesture&&next==='Open Hand')burst=1;
 gesture=next;
 document.querySelectorAll('[data-gesture]').forEach(b=>b.classList.toggle('active',b.dataset.gesture===next));
}
function preview(next){
 live=false;recognitionSession++;startGeneration++;candidate='';candidateCount=0;confidence=0;
 // Stop the camera while previewing. Pending callbacks cannot alter preview mode.
 if(video&&video.srcObject){video.srcObject.getTracks().forEach(t=>t.stop());video.srcObject=null;}
 cameraReady=false;if(video){video.remove();video=null;}document.getElementById('intro').classList.add('hidden');
 document.getElementById('preview-label').textContent='VISUAL PREVIEW';
 document.getElementById('live').textContent='Start camera';setGesture(next);
 setStatus('Visual preview · '+next+' · camera off · H: hide controls');
}
let cameraState='off',modelState='not loaded',startGeneration=0;
function showStartup(){
 if(live)setStatus('Camera: '+cameraState+' · Model: '+modelState);
}
function withTimeout(promise,ms,message){
 let timer;
 return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms);})]).finally(()=>clearTimeout(timer));
}
async function loadGestureClassifier(){
 if(modelReady||modelLoading)return;
 if(typeof ml5==='undefined'){modelState='ml5.js missing; check vendor folder';showStartup();return;}
 modelLoading=true;modelState='checking local model files';showStartup();
 try{
  const url=imageModelURL+'model.json';
  const response=await withTimeout(fetch(url,{cache:'no-store'}),12000,'model.json request timed out');
  if(!response.ok)throw new Error('model/model.json HTTP '+response.status+'; keep the whole model folder');
  const config=await response.json();
  if(!config.modelTopology||!config.weightsManifest)throw new Error('model.json is not a valid exported model');
  const mr=await withTimeout(fetch(imageModelURL+'metadata.json',{cache:'no-store'}),12000,'metadata request timed out');
  if(!mr.ok)throw new Error('model/metadata.json HTTP '+mr.status);
  const metadata=await mr.json();
  if(!KNOWN.every(label=>metadata.labels&&metadata.labels.includes(label)))throw new Error('model labels do not match Fist / Open Hand / Peace');
  // Check the weights before ml5 runs; Live Server can otherwise return an HTML 404.
  for(const manifest of config.weightsManifest)for(const path of manifest.paths){
   const wr=await withTimeout(fetch(new URL(path,imageModelURL).href),15000,'model weights request timed out');
   if(!wr.ok)throw new Error(path+' HTTP '+wr.status+'; keep the whole model folder');
   if((await wr.arrayBuffer()).byteLength<1000)throw new Error(path+' is empty or incomplete');
  }
  modelState='initialising classifier';showStartup();
  // ml5 0.5 returns a readiness promise when no callback is supplied.
  // Await it to surface asynchronous model errors instead of waiting silently.
  classifier=await withTimeout(ml5.imageClassifier(url),25000,'classifier took too long; check browser WebGL support and retry');
  classifier.mapStringToIndex=metadata.labels;
  modelReady=true;modelState='ready';
 }catch(e){modelReady=false;modelState=e.message;document.getElementById('live').textContent='Retry startup';}
 finally{modelLoading=false;showStartup();}
}
async function requestCamera(generation){
 requesting=true;cameraState='waiting for permission';showStartup();
 let stream=null,expired=false;
 try{
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('camera API unavailable; use http://localhost');
  const pending=navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480}},audio:false});
  pending.then(s=>{if(expired||generation!==startGeneration||!live)s.getTracks().forEach(t=>t.stop());}).catch(()=>{});
  stream=await withTimeout(pending,15000,'permission still pending; click the site icon beside the address and allow Camera');
  if(generation!==startGeneration||!live){stream.getTracks().forEach(t=>t.stop());return;}
  cameraState='starting video';showStartup();
  if(video){video.srcObject=null;video.remove();}
  video=document.createElement('video');video.id='camera-preview';video.muted=true;video.autoplay=true;video.playsInline=true;
  video.setAttribute('playsinline','');
  video.style.cssText='position:fixed;right:24px;top:24px;width:200px;max-width:24vw;aspect-ratio:4/3;object-fit:cover;transform:scaleX(-1);z-index:2;border-radius:10px';
  document.body.appendChild(video);
  // Attach listeners before assigning srcObject, and also check readyState.
  const hasFrame=new Promise((resolve,reject)=>{
   video.onloadeddata=resolve;video.onerror=()=>reject(new Error('video could not start'));
  });
  video.srcObject=stream;
  await withTimeout(video.play(),10000,'video playback timed out; close other camera apps and retry');
  if(video.readyState<2)await withTimeout(hasFrame,10000,'camera did not deliver frames; close other camera apps and retry');
  if(generation!==startGeneration||!live){stream.getTracks().forEach(t=>t.stop());video.remove();return;}
  cameraReady=true;cameraState='ready';
  stream.getVideoTracks()[0].onended=()=>{cameraReady=false;cameraState='stopped; retry';if(live){setGesture('Idle');showStartup();}};
 }catch(e){
  expired=true;if(stream)stream.getTracks().forEach(t=>t.stop());
  cameraReady=false;if(video){video.remove();video=null;}
  cameraState=e.name==='NotAllowedError'?'blocked; allow Camera in site settings':e.name==='NotReadableError'?'busy; close other camera apps':e.message;
 }finally{requesting=false;showStartup();}
}
async function startRecognition(){
 document.getElementById('intro').classList.add('hidden');
 live=true;recognitionSession++;setGesture('Idle');candidate='';candidateCount=0;lastConfident=0;
 document.getElementById('preview-label').textContent='LIVE RECOGNITION';document.getElementById('live').textContent='Restart / retry';
 if(requesting){showStartup();return;}
 const generation=++startGeneration;
 // Request permission before initialising the model, independently of model load.
 const cameraPromise=cameraReady?Promise.resolve():requestCamera(generation);
 const modelPromise=loadGestureClassifier();
 await Promise.allSettled([cameraPromise,modelPromise]);showStartup();
}
function classifyVideo(){
 if(!live||!cameraReady||!modelReady||classifying||video.readyState<2)return;
 classifying=true;
 inputFrame.push();inputFrame.translate(320,0);inputFrame.scale(-1,1);inputFrame.drawingContext.drawImage(video,0,0,320,240);inputFrame.pop();
 const session=recognitionSession;
 try{classifier.classify(inputFrame.canvas,(error,results)=>{if(session!==recognitionSession){classifying=false;return;}gotResult(error,results);});}catch(e){classifying=false;setStatus('Classification error: '+e.message);}
}
function gotResult(error,results){
 classifying=false;if(!live)return;
 if(error){setGesture('Idle');setStatus('Classification error. Click Restart / retry, or preview.');return;}
 if(!results||!results.length)return;
 rawLabel=results[0].label;confidence=results[0].confidence||0;
 if(KNOWN.includes(rawLabel)&&confidence>=.80){
  candidateCount=rawLabel===candidate?candidateCount+1:1;candidate=rawLabel;
  if(candidateCount>=3){setGesture(rawLabel);lastConfident=millis();}
 }else{candidate='';candidateCount=0;}
 setStatus(rawLabel+' · '+Math.round(confidence*100)+'% · '+(gesture==='Idle'?'waiting for a stable gesture':gesture)+' · H: hide controls');
}
function particleTarget(p,t){
 const cx=width/2,cy=height/2;
 const radius=Math.min(width*.33,height*.33);
 if(gesture==='Open Hand')return {x:cx+Math.cos(p.a)*radius*p.r,y:cy+Math.sin(p.a)*radius*p.r};
 if(gesture==='Fist'){const a=p.a+t*.35;return {x:cx+Math.cos(a)*30*p.r,y:cy+Math.sin(a)*30*p.r};}
 if(gesture==='Peace'){
  const g=p.group*TWO_PI/3+t*.2;
  const gx=cx+Math.cos(g)*radius*.55,gy=cy+Math.sin(g)*radius*.55;
  return {x:gx+Math.cos(p.a+t*(.5+p.r*.2))*radius*.26,y:gy+Math.sin(p.a+t*(.5+p.r*.2))*radius*.26};
 }
 return {x:cx+Math.cos(p.a+t*.12)*radius*.5*p.r,y:cy+Math.sin(p.a+t*.12)*radius*.5*p.r};
}
function draw(){
 background(12,13,26);const t=millis()/1000,dt=Math.min(deltaTime/16.667,2);
 if(live&&cameraReady&&modelReady&&millis()-lastClassify>100){classifyVideo();lastClassify=millis();}
 if(live&&lastConfident&&millis()-lastConfident>1800){setGesture('Idle');lastConfident=0;}
 if(burst>0){for(const p of particles){p.vx+=Math.cos(p.a)*8*burst;p.vy+=Math.sin(p.a)*8*burst;}burst=0;}
 const colour=gesture==='Fist'?[183,160,255]:gesture==='Peace'?[255,186,124]:[215,170,255];
 for(const p of particles){
  const target=particleTarget(p,t),ox=p.x,oy=p.y;
  p.vx=(p.vx+(target.x-p.x)*.012*dt)*Math.pow(.88,dt);
  p.vy=(p.vy+(target.y-p.y)*.012*dt)*Math.pow(.88,dt);
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  stroke(...colour,90);strokeWeight(1);line(ox,oy,p.x,p.y);
  noStroke();fill(...colour,18);circle(p.x,p.y,p.size*5);fill(...colour,235);circle(p.x,p.y,p.size);
 }

}
function keyPressed(){if(key==='1')preview('Open Hand');if(key==='2')preview('Fist');if(key==='3')preview('Peace');if(key==='h'||key==='H')document.body.classList.toggle('clean');}
function windowResized(){resizeCanvas(windowWidth,windowHeight);makeParticles();}
window.addEventListener('pagehide',()=>{if(video&&video.srcObject)video.srcObject.getTracks().forEach(t=>t.stop());clearTimeout(modelTimer);});
