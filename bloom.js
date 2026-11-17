/* Original procedural models. The clock, flowers and arcade are real WebGL
   geometry; the project records below are transcribed from the supplied CVs. */
(() => {
'use strict';
const T=window.THREE,$=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const records=[
 {title:'Seoul Deck',date:'2026.06 – 2026.10',href:'#seoul',summary:'把收藏的首尔攻略，变成有口碑依据、能随时调整的一天。独立完成需求分析、产品设计、规则与评测。',facts:[['226 篇','小红书帖子'],['5,817 条','评论构成需求与口碑依据']],color:'#efb7ca'},
 {title:'经营数据 Agent',date:'2026.08 – 2026.10',href:'#agent',summary:'中文问数、查口径、生成图表与报表。将分析引擎与业务配置分离，完成第二业务域的迁移验证。',facts:[['78% → 92%','开发集综合通过率，5 轮迭代'],['92%','冻结验收集通过率']],color:'#a9c4e8'},
 {title:'售前咨询工作流',date:'2026.10 – 2026.11',href:'#presale',summary:'用飞书与 Dify，把提问分析、引用校验、人工审核、资料改进任务与升版复测串起来。',facts:[['372 条','真实商品买家提问'],['23 项','代码节点单测通过']],color:'#b7d9b5'},
 {title:'Amazon 新品上新',date:'2026.09 – 2026.10',href:'#amazon-case',summary:'从子类目筛选、低星评论编码到关键词投放与现金流模型，为美国站免热卷发器制定上新方案。',facts:[['21 个','筛选的美妆个护子类目'],['400 条','低星评论编码']],color:'#f2d367'},
 {title:'缺货损失还原',date:'2026.07 – 2026.08',href:'#stockout-case',summary:'还原销量里看不到的缺货需求，比较补货优先级，并设计门店级 A/B 实验。独立完成的分析项目。',facts:[['7,200 万条','小时数据'],['34.3% vs 31.4%','两种排序的后续损失覆盖率']],color:'#c4b6e1'}
];
const contactFlower=document.createElement('div');contactFlower.className='contact-flower';contactFlower.setAttribute('aria-hidden','true');$('#contact').append(contactFlower);
const dialog=$('#prize-dialog');let selected=0,busy=false,clawView=null;
function openPrize(){
 const r=records[selected];$('#prize-title').textContent=r.title;$('#prize-date').textContent=r.date;$('#prize-summary').textContent=r.summary;
 const dl=$('#prize-facts');dl.replaceChildren();for(const [value,label] of r.facts){const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=value;dd.textContent=label;group.append(dt,dd);dl.append(group)}
 $('#prize-open').href=r.href;$('.prize-flower').style.color=r.color;dialog.showModal();
}
function closePrize(){dialog.close();$('#claw-grab').focus({preventScroll:true});}
$('.prize-close').onclick=closePrize;$('#prize-again').onclick=()=>{closePrize();choose((selected+1)%records.length)};
dialog.addEventListener('click',e=>{if(e.target===dialog)closePrize()});
$('#prize-open').onclick=()=>{dialog.close();const dest=$(records[selected].href);if(dest?.tagName==='DETAILS')dest.open=true;requestAnimationFrame(()=>dest?.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'start'}));};
function choose(i){if(busy)return;selected=(i+records.length)%records.length;$('#picker-project').textContent=records[selected].title;$('#picker-date').textContent=records[selected].date;$('#picker-subject').textContent=['从收藏攻略，到有口碑依据的一天。','先查口径，再解释数字为什么变化。','每一个答复，都要对得上商品原文。','从低星评论，到选品与现金流判断。','没有卖出去的需求，也需要被看见。'][selected];all('[data-prize]').forEach((b,n)=>b.setAttribute('aria-pressed',n===selected));$('#prize-label').textContent=String(selected+1).padStart(2,'0')+' / '+records[selected].title;$('#machine-status').textContent='已选中「'+records[selected].title+'」，按下按钮抓取。';clawView?.select(selected)}
all('[data-prize]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.prize)));$('#claw-left').onclick=()=>choose(selected-1);$('#claw-right').onclick=()=>choose(selected+1);
function setBusy(value){busy=value;$('#claw-stage').setAttribute('aria-busy',String(value));all('.machine-controls button,[data-prize]').forEach(b=>b.disabled=value);$('#claw-grab').textContent=value?'正在抓取…':'抓住它 ↓'}
$('#claw-grab').onclick=()=>{if(busy)return;if(reduce.matches||!clawView){openPrize();return;}setBusy(true);$('#machine-status').textContent='抓手下降，正在带回「'+records[selected].title+'」…';clawView.grab(selected,()=>{setBusy(false);$('#machine-status').textContent='抓到了！'+records[selected].title;openPrize()})};
$('#claw-stage').onkeydown=e=>{if(['ArrowLeft','ArrowRight',' ','Enter'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')choose(selected-1);else if(e.key==='ArrowRight')choose(selected+1);else $('#claw-grab').click()}};
if(!T){$('#claw-stage .machine-fallback').hidden=false;return;}
const lin=color=>new T.Color(color).convertSRGBToLinear();
function material(color,metalness=0,roughness=.48){return new T.MeshStandardMaterial({color:lin(color),metalness,roughness})}
const geoCache=new Map();function geo(key,build){if(!geoCache.has(key))geoCache.set(key,build());return geoCache.get(key)}
function group(parent,x=0,y=0,z=0){const o=new T.Group();o.position.set(x,y,z);parent.add(o);return o}
function mesh(parent,g,m,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function ball(parent,x,y,z,sx,sy,sz,m){const o=mesh(parent,geo('sphere',()=>new T.SphereGeometry(1,28,20)),m,x,y,z);o.scale.set(sx,sy,sz);return o}
function box(parent,x,y,z,w,h,d,m){const o=mesh(parent,geo('box',()=>new T.BoxGeometry()),m,x,y,z);o.scale.set(w,h,d);return o}
function cylinder(parent,x,y,z,r,h,m){const o=mesh(parent,geo('cyl',()=>new T.CylinderGeometry(1,1,1,40)),m,x,y,z);o.scale.set(r,h,r);return o}
function ring(parent,x,y,z,r,tube,m){return mesh(parent,new T.TorusGeometry(r,tube,18,100),m,x,y,z)}
function rod(parent,a,b,r,m){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start),middle=start.clone().lerp(end,.5);const o=cylinder(parent,middle.x,middle.y,middle.z,r,delta.length(),m);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o}
function tube(parent,points,r,m){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(parent,new T.TubeGeometry(path,30,r,8,false),m)}
function rounded(parent,x,y,z,w,h,d,r,m){
 const key=[w,h,d,r].join('/');const g=geo(key,()=>{const shape=new T.Shape(),a=-w/2,b=-h/2;shape.moveTo(a+r,b);shape.lineTo(-a-r,b);shape.quadraticCurveTo(-a,b,-a,b+r);shape.lineTo(-a,-b-r);shape.quadraticCurveTo(-a,-b,-a-r,-b);shape.lineTo(a+r,-b);shape.quadraticCurveTo(a,-b,a,-b-r);shape.lineTo(a,b+r);shape.quadraticCurveTo(a,b,a+r,b);const g=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:3,curveSegments:8});g.translate(0,0,-d/2);return g});return mesh(parent,g,m,x,y,z);
}
function textPlane(parent,x,y,z,w,h,draw){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);draw(c.getContext('2d'),c.width,c.height);const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;tex.anisotropy=4;const o=mesh(parent,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true,toneMapped:false}),x,y,z);o.castShadow=false;return o}
function environment(renderer){
 const c=document.createElement('canvas');c.width=1024;c.height=512;const cx=c.getContext('2d');const gradient=cx.createLinearGradient(0,0,0,512);gradient.addColorStop(0,'#c4dbe3');gradient.addColorStop(.35,'#f8f9f8');gradient.addColorStop(.53,'#7a939c');gradient.addColorStop(.57,'#1c3a48');gradient.addColorStop(.69,'#e9efef');gradient.addColorStop(1,'#7e9796');cx.fillStyle=gradient;cx.fillRect(0,0,1024,512);
 cx.fillStyle='#ffffff';cx.fillRect(65,20,100,330);cx.fillRect(600,70,260,100);cx.fillStyle='#e6d8ea';cx.fillRect(900,110,60,230);const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;tex.mapping=T.EquirectangularReflectionMapping;const pm=new T.PMREMGenerator(renderer);pm.compileEquirectangularShader();const env=pm.fromEquirectangular(tex).texture;tex.dispose();pm.dispose();return env;
}
class Stage{
 constructor(element,span=3.5){
  this.el=element;this.span=span;this.visible=false;this.paused=reduce.matches;this.frame=0;
  this.renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.outputEncoding=T.sRGBEncoding;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.94;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.setClearColor(0x000000,0);element.append(this.renderer.domElement);
  this.scene=new T.Scene();this.scene.environment=environment(this.renderer);window.botanicalAssets?.light(this.renderer).then(env=>{if(env){this.scene.environment.dispose();this.scene.environment=env;this.render()}}).catch(()=>{});this.camera=new T.OrthographicCamera(-span,span,span,-span,.1,100);this.camera.position.set(0,0,15);this.camera.lookAt(0,0,0);
  this.scene.add(new T.HemisphereLight(0xffffff,0x9cae9f,.58));const key=new T.DirectionalLight(0xfffaf2,1.45);key.position.set(-4,7,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=7;key.shadow.camera.bottom=-6;key.shadow.bias=-.0005;key.shadow.normalBias=.025;this.scene.add(key);const fill=new T.DirectionalLight(0xdbe7ff,.35);fill.position.set(5,1,4);this.scene.add(fill);
  this.root=group(this.scene);this.resize=new ResizeObserver(()=>this.size());this.resize.observe(element);
  new IntersectionObserver(([e])=>{this.visible=e.isIntersecting;if(this.visible)this.start()},{rootMargin:'100px'}).observe(element);
  window.addEventListener('botanyready',()=>{if(this.visible)this.render()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.start()});
  reduce.addEventListener('change',e=>{this.paused=e.matches;this.start()});
 }
 size(){const w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);const a=w/h;this.camera.left=-this.span*a;this.camera.right=this.span*a;this.camera.top=this.span;this.camera.bottom=-this.span;this.camera.updateProjectionMatrix();this.render()}
 render(){this.renderer.render(this.scene,this.camera)}
 start(){if(this.frame||!this.visible||document.hidden)return;const loop=now=>{this.frame=0;if(!this.visible||document.hidden)return;this.update?.(now);this.render();if(!this.paused||this.animating)this.frame=requestAnimationFrame(loop)};this.frame=requestAnimationFrame(loop)}
}
function flower(parent,color,scale=1,chrome=false){
 const root=group(parent),petal=material(color,chrome?.9:.12,chrome?.19:.3),gold=material('#f2d052',.45,.26),stemMat=material('#73998a',.12,.55),leafMat=material('#b3c8a6',.08,.54);root.scale.setScalar(scale);const head=group(root,0,.22,0);const petals=[];
 for(let i=0;i<8;i++){const a=i*Math.PI/4,o=group(head);o.rotation.z=a;const p=ball(o,0,.48,0,.26,.49,.16,petal);p.rotation.x=.15;petals.push(o)}
 ball(head,0,0,.15,.265,.265,.14,gold);for(let i=0;i<18;i++){const a=i*2.399,r=.18*Math.sqrt(i/18);ball(head,Math.cos(a)*r,Math.sin(a)*r,.28,.016,.016,.014,material('#b28d31',.25,.5))}
 tube(root,[[0,.1,-.06],[-.05,-.7,-.08],[.17,-1.55,-.12]],.037,stemMat);const l1=ball(root,-.28,-.76,-.06,.32,.11,.065,leafMat);l1.rotation.z=-.55;const l2=ball(root,.3,-1.07,-.05,.31,.11,.065,leafMat);l2.rotation.z=.65;return {root,head,petals};
}
function makeClock(){
 const stage=new Stage($('#bloom-clock'),3.35);const root=stage.root;root.rotation.set(.1,-.2,-.13);root.position.y=.16;const silver=material('#d9e5e5',.97,.17),pearl=material('#f4f4e8',.17,.36),blue=material('#244cdb',.5,.2),dark=material('#204743',.35,.28);
 const clock=group(root,0,.18,0);ring(clock,0,0,0,1.89,.15,silver);ring(clock,0,0,.065,1.72,.028,silver);const face=cylinder(clock,0,0,-.05,1.77,.14,pearl);face.rotation.x=Math.PI/2;
 for(let i=0;i<60;i++){const a=i*Math.PI/30;const large=i%5===0;const tick=box(clock,Math.sin(a)*1.57,Math.cos(a)*1.57,.065,large?.046:.018,large?.16:.065,.025,large?dark:silver);tick.rotation.z=-a;}
 textPlane(clock,0,0,.07,3.2,3.2,(c,w,h)=>{c.fillStyle='#244cdb';c.textAlign='center';c.textBaseline='middle';c.font='italic '+w*.11+'px Georgia';c.fillText('12',w/2,h*.13);c.fillText('3',w*.88,h/2);c.fillText('6',w/2,h*.88);c.fillText('9',w*.13,h/2);c.font=w*.028+'px Arial';c.fillStyle='#446560';c.fillText('RUOHAN’S',w/2,h*.62);c.font=w*.019+'px Arial';c.fillText('TIME TO MAKE THINGS',w/2,h*.68)});
 function hand(len,width,m,z){const g=group(clock,0,0,z);rounded(g,0,len*.38,0,width,len,.035,width*.4,m);return g}
 const hour=hand(.98,.12,dark,.12),minute=hand(1.37,.085,blue,.17),second=hand(1.48,.024,silver,.23);ball(clock,0,0,.27,.11,.11,.075,blue);ball(clock,0,0,.34,.035,.035,.025,silver);
 const branch=window.botanicalAssets?.jacaranda(root,{scale:1.27,seed:31});if(branch){branch.position.set(-1.68,-2.20,.5);branch.rotation.z=.42;branch.rotation.y=.3}
 const yellow=flower(root,'#cbb989',.34);yellow.root.position.set(1.8,1.16,-.12);yellow.root.rotation.set(-.1,.25,-.3);
 const chrome=flower(root,'#c8d1d4',.60,true);chrome.root.position.set(1.42,-1.27,.52);chrome.root.rotation.set(.16,-.15,-.37);
 const tiny=flower(root,'#aaa1bc',.22);tiny.root.position.set(-1.65,1.76,-.15);tiny.root.rotation.z=.3;
 const flowerHeads=[yellow.head,chrome.head,tiny.head];
 // Fine concentric machining and polished studs around the dial.
 ring(clock,0,0,.08,1.82,.012,silver);ring(clock,0,0,.09,1.67,.009,silver);
 for(const a of [Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4]){ball(clock,Math.sin(a)*1.81,Math.cos(a)*1.81,.12,.025,.025,.018,dark)}
 const satellite=ball(root,1.15,2.32,-.2,.12,.12,.12,silver);ring(root,-2.16,.23,-.1,.20,.065,blue).rotation.y=.7;
 let pointerX=0,pointerY=0,bloomAt=-10000,paused=reduce.matches;
 $('#bloom-clock').addEventListener('pointermove',e=>{if(paused)return;const r=e.currentTarget.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;stage.start()});$('#bloom-clock').addEventListener('pointerleave',()=>{pointerX=pointerY=0});
 $('.clock-bloom').onclick=()=>{bloomAt=performance.now();stage.animating=true;stage.start()};
 $('#clock-pause').onclick=()=>{paused=!paused;stage.paused=paused;$('#clock-pause').setAttribute('aria-pressed',String(paused));$('#clock-pause').textContent=paused?'播放动效 ▷':'暂停动效 Ⅱ';stage.start()};
 let lastSecond=-1;
 stage.update=now=>{
  const date=new Date(),seconds=date.getUTCSeconds()+(!paused?date.getUTCMilliseconds()/1000:0),minutes=date.getUTCMinutes(),hours=(date.getUTCHours()+8)%12;
  hour.rotation.z=-(hours+minutes/60)*Math.PI/6;minute.rotation.z=-(minutes+seconds/60)*Math.PI/30;second.rotation.z=-seconds*Math.PI/30;
  if(date.getUTCSeconds()!==lastSecond){lastSecond=date.getUTCSeconds();$('#clock-time').textContent='SHANGHAI / '+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'}).format(date)}
  root.rotation.y+=((-.2+pointerX*.28)-root.rotation.y)*.045;root.rotation.x+=((.1+pointerY*.16)-root.rotation.x)*.045;
  const t=now*.001;if(!paused){if(branch)branch.rotation.z=.42+Math.sin(t*.6)*.025;yellow.head.rotation.z=Math.sin(t*.7+1)*.09;chrome.head.rotation.z=Math.sin(t*.5)*.045;satellite.position.y=2.32+Math.sin(t)*.06}
  const dt=(now-bloomAt)/1000;if(dt>=0&&dt<1.7){const pulse=1+.15*Math.sin(dt/1.7*Math.PI);for(const f of flowerHeads)f.scale.setScalar(pulse);if(branch)branch.rotation.z=.42+Math.sin(dt*Math.PI/1.7)*.08;stage.animating=true;}else{stage.animating=false;for(const f of flowerHeads)f.scale.setScalar(1)}
 };
 stage.size();stage.start();return stage;
}
const ease=t=>t*t*(3-2*t),mix=(a,b,t)=>a+(b-a)*ease(Math.max(0,Math.min(1,t)));
function makeClaw(){
 const stage=new Stage($('#claw-stage'),3.0);stage.camera.position.set(3.1,1.2,13);stage.camera.lookAt(0,.22,0);stage.renderer.setPixelRatio(Math.min(devicePixelRatio,2));stage.renderer.toneMappingExposure=.88;
 const world=stage.root;world.position.y=.12;
 // Deliberately simple composition: a single large collectible, articulated
 // machined gripper and one low plinth, with enough room for the silhouette.
 const painted=(color,rough=.32,metal=.0)=>new T.MeshPhysicalMaterial({color:lin(color),roughness:rough,metalness:metal,clearcoat:.48,clearcoatRoughness:.24,envMapIntensity:.42});
 const violet=painted('#8360bd'),forest=painted('#24483f',.34,.18),ivory=painted('#e9dfc8',.55),steel=painted('#abb6bc',.22,.94),brass=painted('#a98e56',.32,.78),rubber=painted('#263b36',.62),black=painted('#112d2b',.16,.25);
 // Gentle brushed microstructure instead of flat gray metal.
 const grain=document.createElement('canvas');grain.width=256;grain.height=256;const gc=grain.getContext('2d'),pixels=gc.createImageData(256,256);let seed=42;for(let i=0;i<pixels.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=128+(seed%19)-9;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}gc.putImageData(pixels,0,0);const bump=new T.CanvasTexture(grain);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(3,12);steel.bumpMap=bump;steel.bumpScale=.008;
 function soft(parent,x,y,z,sx,sy,sz,m){const obj=mesh(parent,geo('picker-soft',()=>new T.SphereGeometry(1,64,48)),m,x,y,z);obj.scale.set(sx,sy,sz);return obj}
 function lathe(parent,points,m,x=0,y=0,z=0){return mesh(parent,new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),96),m,x,y,z)}
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=256;const cx=shadowCanvas.getContext('2d'),grad=cx.createRadialGradient(128,128,3,128,128,124);grad.addColorStop(0,'rgba(34,55,43,.23)');grad.addColorStop(.45,'rgba(34,55,43,.12)');grad.addColorStop(1,'rgba(34,55,43,0)');cx.fillStyle=grad;cx.fillRect(0,0,256,256);const shadow=mesh(world,new T.PlaneGeometry(5.5,4.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),0,-2.31,.05);shadow.rotation.x=-Math.PI/2;shadow.castShadow=shadow.receiveShadow=false;
 const plinth=lathe(world,[[0,-.14],[1.64,-.14],[1.71,-.11],[1.74,-.06],[1.74,.02],[1.71,.075],[1.64,.10],[0,.10]],forest,0,-2.12,0);
 const rim=ring(world,0,-2.13,0,1.72,.012,brass);rim.rotation.x=Math.PI/2;
 for(let k=0;k<64;k++){const a=k*Math.PI/32;rod(world,[Math.sin(a)*1.728,-2.19,Math.cos(a)*1.728],[Math.sin(a)*1.728,-2.12,Math.cos(a)*1.728],.004,rubber)}
 // A restrained embossed maker's label on the plinth.
 textPlane(world,0,-2.17,1.733,1.12,.115,(c,w,h)=>{c.fillStyle='#d8d1bb';c.textAlign='center';c.textBaseline='middle';c.font='500 '+h*.52+'px Arial';c.fillText('R.   /   COLLECTED QUESTIONS',w/2,h/2)});
 const collectible=group(world);collectible.rotation.y=-.16;
 const coat=painted('#8360bd',.49),inner=painted('#b5a1d2',.58),belly=painted('#e3d8c5',.66);coat.clearcoat=.12;coat.envMapIntensity=.25;const eyeInk=new T.MeshStandardMaterial({color:lin('#16382e'),roughness:.82,metalness:0,envMapIntensity:.025});
 const body=soft(collectible,0,-1.29,-.035,.61,.64,.47,coat);soft(collectible,0,-1.22,.362,.42,.46,.125,belly);
 const head=group(collectible,0,-.22,0);const skull=soft(head,0,0,0,.94,.64,.62,coat);skull.rotation.z=-.035;
 // Swept, asymmetrical ears: continuously curved closed surfaces and recessed
 // inner panels. The cross-section tapers into the tip, without sphere stacks.
 function earGeometry(side,patch=false){
  const rows=48,cols=48,vs=[],uv=[],indices=[];
  for(let i=0;i<=rows;i++){const u=i/rows,arch=Math.pow(Math.max(.00001,Math.sin(u*Math.PI)),.47),width=(patch?.125:.205)*arch,thick=(patch?.018:.13)*arch;for(let j=0;j<=cols;j++){const a=j/cols*Math.PI*2;const bend=side*(.13*u*u+.04*Math.sin(u*Math.PI));vs.push(bend+Math.cos(a)*width,u*(side<0?1.06:1.22),Math.sin(a)*thick+.08*u*u+(patch?.119:0));uv.push(j/cols,u)}}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;indices.push(a,b,a+1,a+1,b,b+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vs,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
 }
 for(const side of [-1,1]){const ear=group(head,side*.42,.39,-.075);ear.rotation.z=-side*.12;mesh(ear,earGeometry(side),coat);const inset=mesh(ear,earGeometry(side,true),inner);inset.position.y=.075;inset.scale.set(.86,.83,1);}
 // Eyes sit on the curved face; reflections come from the studio light.
 const eyes=[];for(const side of [-1,1]){const eye=rounded(head,side*.31,.035,.586,.074,.30,.018,.035,eyeInk);eye.rotation.z=-.06;eyes.push(eye);}
 soft(head,0,-.20,.614,.039,.026,.017,eyeInk);
 tube(head,[[0,-.23,.615],[0,-.28,.61],[-.055,-.30,.603]],.009,black);tube(head,[[0,-.28,.61],[.043,-.30,.605],[.075,-.28,.60]],.009,black);
 for(const side of [-1,1]){const foot=soft(collectible,side*.42,-1.88,.14,.345,.165,.45,coat);foot.rotation.y=side*-.22;const hand=soft(collectible,side*.58,-1.17,.22,.19,.32,.24,coat);hand.rotation.z=side*.26;}
 soft(collectible,0,-1.45,-.49,.22,.22,.21,belly);
 // Small R badge makes this a garden collectible belonging to this portfolio.
 const badge=cylinder(head,.65,-.34,.43,.105,.028,brass);badge.rotation.x=Math.PI/2;
 textPlane(head,.65,-.34,.451,.12,.12,(c,w,h)=>{c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f8f2dc';c.font='italic '+h*.76+'px Georgia';c.fillText('R',w/2,h/2)});
 const accessory=group(collectible,0,-1.20,.62);accessory.rotation.set(-.05,0,.035);
 const props=[];
 function label(parent,title,sub){textPlane(parent,0,.04,.137,.84,.52,(c,w,h)=>{c.fillStyle='#274b45';c.textAlign='left';c.textBaseline='middle';c.font='600 '+h*.13+'px Arial';c.fillText(title,w*.08,h*.17);c.font=h*.095+'px Arial';c.fillStyle='#75857a';c.fillText(sub,w*.08,h*.86)});}
 // 01: a folded itinerary with a route and physical paper folds.
 const map=group(accessory);
 const mapPrint=textPlane(map,0,0,.065,.96,.70,(c,w,h)=>{c.fillStyle='#f1ecdc';c.fillRect(0,0,w,h);c.strokeStyle='#d2d9cb';c.lineWidth=2;for(let i=1;i<7;i++){c.beginPath();c.moveTo(w*i/7,0);c.lineTo(w*i/7,h);c.stroke();}for(let j=1;j<5;j++){c.beginPath();c.moveTo(0,h*j/5);c.lineTo(w,h*j/5);c.stroke();}c.fillStyle='#294f44';c.font='bold '+h*.11+'px Arial';c.fillText('SEOUL DECK',w*.08,h*.16);c.strokeStyle='#8064ac';c.lineWidth=7;c.lineJoin='round';c.beginPath();c.moveTo(w*.22,h*.72);c.lineTo(w*.4,h*.4);c.lineTo(w*.7,h*.58);c.lineTo(w*.83,h*.31);c.stroke();for(const [x,y] of [[.22,.72],[.4,.4],[.7,.58],[.83,.31]]){c.fillStyle='#8462b9';c.beginPath();c.arc(w*x,h*y,12,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(w*x,h*y,5,0,Math.PI*2);c.fill();}});
 const printTexture=mapPrint.material.map;map.remove(mapPrint);
 for(let k=0;k<3;k++){const panel=group(map,(k-1)*.326,0,k===1?0:.026);panel.rotation.y=k===1?.16:-.16;box(panel,0,0,0,.326,.745,.012,ivory);const geometry=new T.PlaneGeometry(.326,.745),uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,(uv.getX(i)+k)/3);const print=mesh(panel,geometry,new T.MeshBasicMaterial({map:printTexture,toneMapped:false}),0,0,.007);print.castShadow=false;}
 props.push(map);
 // 02: a framed analytical card. Bars are a symbolic object, not report data.
 const chart=group(accessory);rounded(chart,0,0,0,1.05,.78,.075,.045,forest);rounded(chart,0,0,.055,.91,.65,.035,.025,ivory);label(chart,'DATA AGENT','QUERY · VERIFY · EXPLAIN');
 for(let i=0;i<3;i++)rounded(chart,-.24+i*.23,-.09+i*.04,.12,.12,.18+i*.08,.07,.018,i===2?violet:forest);props.push(chart);
 // 03: the evidence folder with an actual metal clip and offset sheets.
 const file=group(accessory);rounded(file,0,0,-.02,1.02,.78,.07,.035,forest);for(let i=0;i<3;i++)rounded(file,-.014+i*.012,.008+i*.014,.025+i*.013,.87,.66,.018,.012,ivory);label(file,'EVIDENCE FIRST','SOURCE · REVIEW · REVISE');rounded(file,0,.39,.10,.27,.115,.065,.025,steel);for(let i=0;i<3;i++){rod(file,[-.27,.08-i*.12,.12],[.1,.08-i*.12,.12],.008,belly);tube(file,[[.20,.08-i*.12,.13],[.24,.04-i*.12,.13],[.31,.13-i*.12,.13]],.012,forest)}props.push(file);
 // 04: tactile small parcel, paper seams and cotton tape.
 const parcel=group(accessory);rounded(parcel,0,-.02,0,.96,.66,.48,.045,painted('#a98959',.73));rounded(parcel,0,.31,.0,1,.065,.51,.02,painted('#bca374',.78));box(parcel,0,-.02,.28,.19,.67,.012,ivory);box(parcel,0,.35,0,.19,.012,.51,ivory);textPlane(parcel,.23,.06,.285,.27,.27,(c,w,h)=>{c.fillStyle='#f3ebd7';c.fillRect(0,0,w,h);c.fillStyle='#416054';c.font='bold '+h*.34+'px Arial';c.textAlign='center';c.fillText('04',w*.5,h*.44);for(let k=0;k<15;k++)c.fillRect(w*(.1+k*.052),h*.62,2+k%3,h*.22)});props.push(parcel);
 // 05: braided produce basket; the leaves have a central vein and curvature.
 const basket=group(accessory),cane=painted('#c3a36b',.77);lathe(basket,[[.26,-.25],[.40,-.22],[.44,.07],[.43,.15]],painted('#a5834b',.78));ring(basket,0,.14,0,.46,.022,cane).rotation.x=Math.PI/2;
 for(let k=0;k<28;k++){const a=k*Math.PI/14;tube(basket,[[Math.cos(a)*.33,-.24,Math.sin(a)*.33],[Math.cos(a)*.415,-.05,Math.sin(a)*.415],[Math.cos(a)*.46,.14,Math.sin(a)*.46]],.012,cane)}for(let k=0;k<5;k++)ring(basket,0,-.19+k*.067,0,.355+k*.027,.013,cane).rotation.x=Math.PI/2;
 function produceLeaf(){const vs=[],uv=[],idx=[],rows=24,cols=12;for(let i=0;i<=rows;i++){const u=i/rows;for(let j=0;j<=cols;j++){const v=j/cols*2-1,width=Math.sin(u*Math.PI)*(.14+.018*Math.sin(u*24));vs.push(v*width,.42*u,.10*Math.sin(u*Math.PI)+Math.abs(v)*.025+Math.cos(u*23)*Math.abs(v)*.012);uv.push(j/cols,u)}}for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;idx.push(a,b,a+1,a+1,b,b+1)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vs,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
 const greens=[painted('#607e4b',.7),painted('#81975b',.73)];greens.forEach(m=>m.side=T.DoubleSide);const leafShape=produceLeaf();
 for(let k=0;k<9;k++){const a=k*2.4,leaf=group(basket,Math.cos(a)*.16,.03+(k%3)*.035,Math.sin(a)*.16);leaf.rotation.set(.3, a,Math.cos(a)*.35);mesh(leaf,leafShape,greens[k%2]);tube(leaf,[[0,0,.007],[0,.2,.105],[0,.40,.025]],.005,ivory);for(const side of [-1,1])for(let j=0;j<3;j++)rod(leaf,[0,.12+j*.065,.10],[side*(.08-j*.012),.19+j*.06,.10],.0025,cane);}
 props.push(basket);
 // Industrial gripper with discrete joints, cut profiles and rubber pads.
 const gripper=group(world,0,2.45,0);lathe(gripper,[[0,.39],[.15,.39],[.19,.34],[.19,.22],[.29,.18],[.33,.1],[.33,-.12],[.29,-.19],[.22,-.23],[0,-.23]],steel);
 cylinder(gripper,0,.0,0,.337,.10,forest);ring(gripper,0,-.13,0,.30,.022,brass).rotation.x=Math.PI/2;cylinder(gripper,0,-.25,0,.14,.10,black);
 for(let k=0;k<12;k++){const a=k*Math.PI/6;const screw=soft(gripper,Math.sin(a)*.285,.17,Math.cos(a)*.285,.022,.012,.022,brass);}
 const fingers=[];
 function fingerPlate(parent){const shape=new T.Shape();shape.moveTo(-.045,.02);shape.quadraticCurveTo(.12,-.02,.21,-.20);shape.lineTo(.43,-.61);shape.quadraticCurveTo(.49,-.79,.22,-.86);shape.lineTo(.19,-.80);shape.quadraticCurveTo(.37,-.70,.32,-.61);shape.lineTo(.12,-.24);shape.quadraticCurveTo(.065,-.13,-.045,-.10);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.075,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:4,curveSegments:16});geo.translate(0,0,-.0375);return mesh(parent,geo,steel);}
 for(let k=0;k<3;k++){const radial=group(gripper);radial.rotation.y=k*Math.PI*2/3+.45;const mount=group(radial,.22,-.17,0);rounded(mount,0,-.02,0,.16,.21,.19,.025,forest);const pivot=cylinder(mount,0,-.04,0,.066,.23,brass);pivot.rotation.x=Math.PI/2;const finger=group(mount,0,-.04,0);fingerPlate(finger);const axle=cylinder(finger,.31,-.56,0,.045,.11,brass);axle.rotation.x=Math.PI/2;soft(finger,.23,-.82,0,.074,.036,.064,rubber);rod(radial,[.17,-.03,0],[.37,-.39,0],.019,black);const spring=[];for(let n=0;n<=80;n++){const u=n/80,a=u*Math.PI*16;spring.push([.27+u*.08+Math.cos(a)*.026,-.06-u*.24,Math.sin(a)*.026])}tube(radial,spring,.008,brass);fingers.push(finger);}
 // Ribbed suspension flex and a concentric ferrule; wire is never a flat line.
 const cord=group(world,0,3.55,0);const core=cylinder(cord,0,-.23,0,.042,.95,rubber);const spiral=[];for(let i=0;i<=220;i++){const u=i/220,a=u*Math.PI*34;spiral.push([Math.cos(a)*.05,-.70+u*.95,Math.sin(a)*.05])}tube(cord,spiral,.009,black);
 cylinder(gripper,0,.41,0,.095,.12,brass);const cable=cylinder(world,0,3.13,0,.033,.60,black);
 let selection=0,animation=null,done=null,swapAt=-1,pointerX=0,pointerY=0;
 const palette=[['#8360bd','#b5a1d2'],['#49796c','#9ebbb0'],['#a66f86','#d6b0bf'],['#ae8651','#dfc995'],['#6d8351','#b1c592']];
 function show(i){selection=i;props.forEach((p,k)=>p.visible=k===i);coat.color.copy(lin(palette[i][0]));inner.color.copy(lin(palette[i][1]));}
 show(0);
 stage.select=i=>{show(i);swapAt=reduce.matches?-1:performance.now();stage.animating=!reduce.matches;stage.start()};
 stage.grab=(i,callback)=>{show(i);animation={start:performance.now(),i};done=callback;stage.animating=true;stage.start()};
 let tapStart=null;stage.el.addEventListener('pointerdown',e=>{tapStart={x:e.clientX,y:e.clientY,t:performance.now()}});stage.el.addEventListener('pointerup',e=>{if(tapStart&&Math.hypot(e.clientX-tapStart.x,e.clientY-tapStart.y)<7&&performance.now()-tapStart.t<550)$('#claw-grab').click();tapStart=null});
 stage.el.addEventListener('pointermove',e=>{if(reduce.matches)return;const r=stage.el.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;stage.start()});stage.el.addEventListener('pointerleave',()=>{pointerX=pointerY=0});
 stage.update=now=>{
  let close=.0,gy=2.45,raise=0,turn=0;
  if(animation){const t=(now-animation.start)/1000;swapAt=-1;
   if(t<.7)gy=mix(2.45,1.93,t/.7);
   else if(t<1.12){gy=1.93;close=ease((t-.7)/.42);}
   else if(t<2.05){close=1;gy=mix(1.93,2.58,(t-1.12)/.93);raise=gy-1.93;}
   else if(t<2.8){close=1;gy=2.58;raise=.65;turn=mix(0,.25,(t-2.05)/.75);}
   else if(t<3.5){gy=mix(2.58,1.93,(t-2.8)/.7);raise=gy-1.93;close=1;turn=.25;}
   else if(t<3.85){gy=mix(1.93,2.45,(t-3.5)/.35);close=1-ease((t-3.5)/.35);}
   else{animation=null;stage.animating=false;done?.();done=null;}
  }
  const elapsed=now-swapAt;let scale=1;if(swapAt>0&&elapsed<520){scale=.93+.07*ease(elapsed/520);stage.animating=true}else if(!animation)stage.animating=false;
  collectible.scale.setScalar(scale);collectible.position.y=raise;
  const idle=stage.paused?0:Math.sin(now*.0009)*.015;const blinkPhase=(now*.001)%7.2,blink=(!stage.paused&&!animation&&blinkPhase<.18)?1-.92*Math.sin(blinkPhase/.18*Math.PI):1;for(const eye of eyes)eye.scale.y=blink;
  collectible.rotation.y+=(-.16+turn+pointerX*.13-collectible.rotation.y)*.045;head.rotation.z=idle+.02;gripper.position.y=gy;gripper.rotation.y=pointerX*.08;for(const finger of fingers)finger.rotation.z=.15-close*.5;
  cable.position.y=(gy+.45+2.87)/2;cable.scale.y=Math.max(.02,2.87-(gy+.45));
  world.rotation.x+=((pointerY*.035)-world.rotation.x)*.035;
 };
 stage.size();stage.start();return stage;
}

// Heavy scenes and HDR lighting start only as the reader approaches them.
const sceneLoader=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;sceneLoader.unobserve(entry.target);if(entry.target.id==='bloom-clock'){try{makeClock()}catch(e){console.warn('Clock WebGL unavailable',e);$('#bloom-clock').innerHTML='<div class="clock-fallback"><span>✳</span><p>好奇，慢慢开花。</p></div>'}}else{try{clawView=makeClaw()}catch(e){console.warn('Arcade WebGL unavailable',e);$('#claw-stage .machine-fallback').hidden=false}}}},{rootMargin:'240px'});
sceneLoader.observe($('#bloom-clock'));sceneLoader.observe($('#claw-stage'));
// Section entrances use native intersection observers, preserving normal scroll.
if(!reduce.matches){const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.animate([{opacity:.5,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});observer.unobserve(e.target)}},{threshold:.13});all('.arcade-copy,.research-heading,.project-intro > h2').forEach(el=>observer.observe(el))}
})();
