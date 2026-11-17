/* DM3014 Week 5 — extended from the supplied classroom frame-difference sketch.
 * Changes: responsive mirrored video; one consistent grid mapping; larger sparse
 * cat stamps; real movement-driven colour interpolation; time-based fading;
 * explicit camera permission and optional debug view. No hand classification.
 */
let catImage, camera, analysisFrame, previousPixels = null;
let ready = false, requesting = false, cells = [], lastAnalysis = 0;
const ANALYSIS_W = 160, ANALYSIS_H = 120, FADE_MS = 1200;
let latestMotion = 0;
function preload(){catImage = loadImage('img.png',()=>{},()=>{document.getElementById('error').textContent='img.png could not load. Keep it next to index.html and sketch.js.';});}
function setup(){
  createCanvas(windowWidth,windowHeight);pixelDensity(1);
  analysisFrame=createGraphics(ANALYSIS_W,ANALYSIS_H);analysisFrame.pixelDensity(1);
  rebuildGrid();
  document.getElementById('begin').onclick=startCamera;
  document.getElementById('spacing').oninput=rebuildGrid;
  document.getElementById('clear').onclick=()=>cells.forEach(c=>c.t=-Infinity);
  document.getElementById('full').onclick=()=>{try{fullscreen(!fullscreen());}catch(e){document.getElementById('status').textContent='Full screen unavailable. The canvas still fits the window.';}};
}
async function startCamera(){
 if(requesting||ready)return;requesting=true;document.getElementById('error').textContent='Requesting camera…';
 let stream;
 try{
  stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480}},audio:false});
  camera=document.createElement('video');camera.muted=true;camera.playsInline=true;camera.autoplay=true;camera.srcObject=stream;
  await new Promise((resolve,reject)=>{camera.onloadedmetadata=resolve;camera.onerror=reject;});await camera.play();
  previousPixels=null;ready=true;document.getElementById('start').classList.add('hidden');
  stream.getVideoTracks()[0].onended=()=>{ready=false;requesting=false;document.getElementById('start').classList.remove('hidden');document.getElementById('error').textContent='Camera stopped. Start it again.';};
 }catch(e){if(stream)stream.getTracks().forEach(t=>t.stop());document.getElementById('error').textContent='Camera unavailable: '+e.message+'. Open on localhost and allow camera access.';}
 finally{requesting=false;}
}
function rebuildGrid(){
 const gap=Number(document.getElementById('spacing').value);cells=[];
 for(let y=gap/2;y<height;y+=gap)for(let x=gap/2;x<width;x+=gap)cells.push({x,y,t:-Infinity,mix:0});
 previousPixels=null;
}
function cameraRect(){
 const vw=camera.videoWidth||640,vh=camera.videoHeight||480;
 const scale=Math.max(width/vw,height/vh);
 return {x:(width-vw*scale)/2,y:(height-vh*scale)/2,w:vw*scale,h:vh*scale};
}
function analyse(now){
 analysisFrame.push();analysisFrame.translate(ANALYSIS_W,0);analysisFrame.scale(-1,1);
 analysisFrame.drawingContext.drawImage(camera,0,0,ANALYSIS_W,ANALYSIS_H);analysisFrame.pop();
 analysisFrame.loadPixels();const pixels=analysisFrame.pixels;
 if(!previousPixels){previousPixels=new Uint8ClampedArray(pixels);return;}
 const diff=new Float32Array(ANALYSIS_W*ANALYSIS_H);const cutoff=Number(document.getElementById('sensitivity').value);
 let count=0;
 for(let i=0;i<diff.length;i++){
  const k=i*4;
  diff[i]=Math.abs(.299*(pixels[k]-previousPixels[k])+.587*(pixels[k+1]-previousPixels[k+1])+.114*(pixels[k+2]-previousPixels[k+2]));
  if(diff[i]>cutoff)count++;
 }
 latestMotion=count/diff.length;
 const r=cameraRect();
 for(const c of cells){
  // Map the same mirrored, cover-cropped video rectangle to the analysis image.
  const ax=Math.floor((c.x-r.x)/r.w*ANALYSIS_W),ay=Math.floor((c.y-r.y)/r.h*ANALYSIS_H);
  let hits=0,total=0,strength=0;
  for(let yy=ay-2;yy<=ay+2;yy++)for(let xx=ax-2;xx<=ax+2;xx++){
   if(xx<0||xx>=ANALYSIS_W||yy<0||yy>=ANALYSIS_H)continue;
   const d=diff[xx+yy*ANALYSIS_W];total++;strength+=d;if(d>cutoff)hits++;
  }
  if(total&&hits/total>.20){c.t=now;c.mix=constrain((strength/total)/65+latestMotion*.8,0,1);}
 }
 previousPixels.set(pixels);
}
function draw(){
 background(22,19,30);if(!ready||camera.readyState<2)return;
 const r=cameraRect();
 push();translate(width,0);scale(-1,1);drawingContext.drawImage(camera,r.x,r.y,r.w,r.h);pop();
 const now=millis();if(now-lastAnalysis>50){analyse(now);lastAnalysis=now;}
 const size=Number(document.getElementById('size').value);
 push();imageMode(CENTER);
 for(const c of cells){
  const life=1-(now-c.t)/FADE_MS;if(life<=0)continue;
  const col=lerpColor(color(225,199,255),color(255,105,175),c.mix);col.setAlpha(255*life);
  tint(col);image(catImage,c.x,c.y,size,size*catImage.height/catImage.width);
 }
 pop();noTint();
 if(document.getElementById('debug').checked){image(analysisFrame,width-176,90,160,120);}
 document.getElementById('status').textContent='Motion '+Math.round(latestMotion*100)+'% · H: hide controls';
}
function windowResized(){resizeCanvas(windowWidth,windowHeight);rebuildGrid();}
function keyPressed(){if(key==='h'||key==='H')document.body.classList.toggle('clean');}
window.addEventListener('pagehide',()=>{if(camera&&camera.srcObject)camera.srcObject.getTracks().forEach(t=>t.stop());});
