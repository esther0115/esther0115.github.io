import {T,Stage,group,part,material,label,oval,rod,tube,reduced} from './scene.js?v=1118j';
import {createBranch} from './botany.js?v=1118j';
export function createClock(el){
 const s=new Stage(el,{span:2.25,width:4.5,camera:[0,.3,12],target:[0,0,0],exposure:.82}),r=s.root;
 const ink=material('#253e38',{metalness:.68,roughness:.32}),steel=material('#a6b2b1',{metalness:.94,roughness:.24}),sage=material('#7f8b78',{roughness:.82});
 label(r,{x:.0,y:.82,z:-.2,w:4.1,h:1.1,draw(c,w,h){c.font='italic '+h*.76+'px Georgia';c.fillStyle='#b4baa9';c.textAlign='center';c.fillText('Education',w/2,h*.80)}});
 label(r,{x:.45,y:-.71,z:-.2,w:3.6,h:1.05,draw(c,w,h){c.font=h*.72+'px Georgia';c.fillStyle='#60746a';c.textAlign='center';c.fillText('& practice.',w/2,h*.80)}});
 const hub=group(r,.12,.06,.2),hands=[];
 function hand(length,width,mat,z){const g=group(hub,0,0,z),shape=new T.Shape();shape.moveTo(-width*.2,-.22);shape.quadraticCurveTo(-width*.43,length*.24,-width*.50,length*.58);shape.quadraticCurveTo(-width*.62,length*.73,0,length);shape.quadraticCurveTo(width*.62,length*.73,width*.50,length*.58);shape.quadraticCurveTo(width*.43,length*.24,width*.2,-.22);shape.closePath();part(g,new T.ExtrudeGeometry(shape,{depth:.038,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:3,curveSegments:24}),mat);oval(g,0,length*.66,.054,width*.15,width*.15,.013,steel,20);return g}
 const hour=hand(.95,.16,ink,0),minute=hand(1.46,.105,ink,.09),second=group(hub,0,0,.20);rod(second,[0,-.35,0],[0,1.67,0],.009,steel);oval(hub,0,0,.28,.075,.075,.046,steel,24);
 // Restrained time marks give the hands context without a solid clock face.
 for(let i=0;i<12;i++){const a=i*Math.PI/6;rod(hub,[Math.sin(a)*1.61,Math.cos(a)*1.61,-.12],[Math.sin(a)*1.66,Math.cos(a)*1.66,-.12],.008,sage)}
 const branch=createBranch(r);const baseRotations=branch.blooms.map(f=>f.mesh.rotation.y);branch.root.position.set(-1.43,-.97,.1);branch.root.scale.setScalar(.66);branch.root.rotation.z=-.24;
 let paused=reduced.matches,last=0,explore=null,near=0,nearTarget=0,nearStart=0;const pause=document.querySelector('#clock-pause'),bloom=document.querySelector('.clock-bloom');
 function state(){bloom.setAttribute('aria-pressed',String(branch.target===1));bloom.setAttribute('aria-label',branch.target===1?'收起花朵':'让花盛开');bloom.innerHTML='<span>'+(branch.target===1?'收起花朵':'让花盛开')+'</span>';pause.textContent=paused?'播放动效 ▷':'暂停动效 Ⅱ';pause.setAttribute('aria-pressed',String(paused))}
 bloom.onclick=()=>{if(branch.target===1){view.closeFlowers(true)}else view.openFlowers()};
 pause.onclick=()=>{paused=!paused;s.paused=paused;s.request();state()};
 reduced.addEventListener('change',()=>{paused=reduced.matches;s.paused=paused;if(reduced.matches)branch.set(branch.target);state();s.request()});
 s.paused=paused;s.update=now=>{const date=new Date(),sec=date.getUTCSeconds()+date.getUTCMilliseconds()/1000,min=date.getUTCMinutes()+sec/60,hr=(date.getUTCHours()+8)%12+min/60;if(!paused||!last||explore!==null){const angle=explore===null?-min*Math.PI/30:-explore;minute.rotation.z+=Math.atan2(Math.sin(angle-minute.rotation.z),Math.cos(angle-minute.rotation.z))*(reduced.matches?1:.18);hour.rotation.z=-hr*Math.PI/6;second.rotation.z=-sec*Math.PI/30;last=now}
 if(now>=nearStart)near+=(nearTarget-near)*(reduced.matches?1:.08);if(Math.abs(nearTarget-near)<.001)near=nearTarget;
 s.camera.zoom=1+near*.35;s.camera.updateProjectionMatrix();branch.root.position.set(-1.43*(1-near),-.97*(1-near),.1);branch.root.scale.setScalar(.66+near*.78);branch.root.rotation.z=-.24*(1-near);
 r.children.forEach(child=>{if(child!==branch.root)child.visible=near<.45});document.querySelector('#clock-time').textContent='SHANGHAI / '+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'}).format(date);s.animating=branch.update(now)||near!==nearTarget||Math.abs(Math.atan2(Math.sin((explore===null?-min*Math.PI/30:-explore)-minute.rotation.z),Math.cos((explore===null?-min*Math.PI/30:-explore)-minute.rotation.z)))>.002};
 const view={stage:s,branch,explore(angle){explore=angle;s.request()},now(){explore=null;s.request()},openFlowers(){branch.move(1,performance.now(),reduced.matches);nearTarget=1;nearStart=performance.now()+(reduced.matches?0:600);s.animating=true;s.request();state();window.dispatchEvent(new CustomEvent('garden-open'))},closeFlowers(fold=false){nearTarget=0;nearStart=0;if(fold)branch.move(0,performance.now(),reduced.matches);s.animating=true;s.request();state()},selectFlower(i){branch.blooms.forEach((f,n)=>{f.mesh.rotation.y=baseRotations[n]+(n===i?0.12:0);if(f.mesh.userData.discovered)f.mesh.userData.discovered.visible=n===i});s.request()}};s.update(performance.now());state();s.draw();s.request();return view;
}
