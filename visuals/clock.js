import {T,Stage,group,part,material,label,oval,rod,tube,reduced} from './scene.js?v=1118f';
import {createBranch} from './botany.js?v=1118f';
export function createClock(el){
 const s=new Stage(el,{span:2.25,width:4.5,camera:[0,.3,12],target:[0,0,0],exposure:.82}),r=s.root;
 const ink=material('#253e38',{metalness:.68,roughness:.32}),steel=material('#a6b2b1',{metalness:.94,roughness:.24}),sage=material('#7f8b78',{roughness:.82});
 label(r,{x:.0,y:.82,z:-.2,w:4.1,h:1.1,draw(c,w,h){c.font='italic '+h*.90+'px Georgia';c.fillStyle='#b4baa9';c.textAlign='center';c.fillText('Education',w/2,h*.80)}});
 label(r,{x:.45,y:-.71,z:-.2,w:3.6,h:1.05,draw(c,w,h){c.font=h*.82+'px Georgia';c.fillStyle='#60746a';c.textAlign='center';c.fillText('& practice.',w/2,h*.80)}});
 const hub=group(r,.12,.06,.2),hands=[];
 function hand(length,width,mat,z){const g=group(hub,0,0,z),shape=new T.Shape();shape.moveTo(-width*.2,-.22);shape.quadraticCurveTo(-width*.43,length*.24,-width*.50,length*.58);shape.quadraticCurveTo(-width*.62,length*.73,0,length);shape.quadraticCurveTo(width*.62,length*.73,width*.50,length*.58);shape.quadraticCurveTo(width*.43,length*.24,width*.2,-.22);shape.closePath();part(g,new T.ExtrudeGeometry(shape,{depth:.038,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:3,curveSegments:24}),mat);oval(g,0,length*.66,.054,width*.15,width*.15,.013,steel,20);return g}
 const hour=hand(.95,.16,ink,0),minute=hand(1.46,.105,ink,.09),second=group(hub,0,0,.20);rod(second,[0,-.35,0],[0,1.67,0],.009,steel);oval(hub,0,0,.28,.075,.075,.046,steel,24);
 // Restrained time marks give the hands context without a solid clock face.
 for(let i=0;i<12;i++){const a=i*Math.PI/6;rod(hub,[Math.sin(a)*1.61,Math.cos(a)*1.61,-.12],[Math.sin(a)*1.66,Math.cos(a)*1.66,-.12],.008,sage)}
 const branch=createBranch(r);branch.root.position.set(-1.43,-.97,.1);branch.root.scale.setScalar(.66);branch.root.rotation.z=-.24;
 let paused=reduced.matches,last=0;const pause=document.querySelector('#clock-pause'),bloom=document.querySelector('.clock-bloom');
 function state(){bloom.setAttribute('aria-pressed',String(branch.target===1));bloom.setAttribute('aria-label',branch.target===1?'收起花朵':'让花盛开');bloom.innerHTML='<span>'+(branch.target===1?'收起花朵':'让花盛开')+'</span>';pause.textContent=paused?'播放动效 ▷':'暂停动效 Ⅱ';pause.setAttribute('aria-pressed',String(paused))}
 bloom.onclick=()=>{branch.move(branch.target===1?0:1,performance.now(),reduced.matches);s.animating=branch.moving;s.request();state();s.draw()};
 pause.onclick=()=>{paused=!paused;s.paused=paused;s.request();state()};
 reduced.addEventListener('change',()=>{paused=reduced.matches;s.paused=paused;if(reduced.matches)branch.set(branch.target);state();s.request()});
 s.paused=paused;s.update=now=>{const date=new Date(),sec=date.getUTCSeconds()+date.getUTCMilliseconds()/1000,min=date.getUTCMinutes()+sec/60,hr=(date.getUTCHours()+8)%12+min/60;if(!paused||!last){hour.rotation.z=-hr*Math.PI/6;minute.rotation.z=-min*Math.PI/30;second.rotation.z=-sec*Math.PI/30;last=now}document.querySelector('#clock-time').textContent='SHANGHAI / '+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit'}).format(date);s.animating=branch.update(now)};
 state();s.request();return {stage:s,branch};
}
