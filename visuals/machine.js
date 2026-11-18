import {T,Stage,group,part,box,oval,rod,tube,label,material,contactShadow,smooth,mix,clamp,reduced} from './scene.js?v=1118j';
import {createBunny} from './plush.js?v=1118j';
export function createMachine(el,{onComplete=()=>{},onStatus=()=>{},onSelect=()=>{}}={}){
 const stage=new Stage(el,{span:2.8,width:4.2,target:[0,2.05,0],camera:[4,3.6,15],exposure:.79});
 const r=stage.root,ivory=material('#ddd8c5',{roughness:.74}),sage=material('#718276',{roughness:.72}),dark=material('#354f48',{roughness:.78}),steel=material('#a9b5ae',{metalness:.8,roughness:.29}),rubber=material('#303d37',{roughness:.92}),lining=material('#aaa1b3',{roughness:.95});
 contactShadow(r,0,.025,.1,5.2,3.6,.26);
 box(r,0,.16,0,3.72,.28,2.24,sage,.10);
 // Build around the chute void; the rabbit never passes through a solid base.
 box(r,-1.66,.69,0,.23,.86,2.1,ivory,.035);box(r,.657,.69,0,2.235,.86,2.1,ivory,.06);box(r,0,.69,-.60,3.55,.86,.90,ivory,.045);
 box(r,0,1.16,-.34,3.45,.12,1.26,sage,.03);box(r,.56,1.16,.63,2.23,.12,.68,sage,.03);box(r,-1.61,1.16,.63,.12,.12,.68,sage,.02);
 box(r,0,4.15,0,3.65,.32,2.22,ivory,.10);box(r,0,4.34,0,3.36,.065,1.96,sage,.025);
 // Open display bay, four load-bearing posts and a rear upholstered panel.
 box(r,0,2.63,-1.00,3.38,2.86,.075,lining,.02);
 for(const x of [-1.68,1.68])for(const z of [-.98,.98])box(r,x,2.66,z,.105,2.91,.105,ivory,.025);
 box(r,0,1.24,-.34,3.35,.10,1.26,lining,.03);box(r,.56,1.24,.63,2.23,.10,.68,lining,.03);box(r,-1.61,1.24,.63,.12,.10,.68,lining,.02);
 // Glass at sides: leave the frontal viewing area optically clear.
 const glass=material('#d2e0dc',{transparent:true,opacity:.085,roughness:.12,metalness:0,depthWrite:false,side:T.DoubleSide});
 for(const x of [-1.64,1.64]){const pane=part(r,new T.PlaneGeometry(1.89,2.78),glass,x,2.65,0);pane.rotation.y=Math.PI/2;pane.castShadow=false;}
 for(const z of [-.94,.96]){if(z<0)box(r,0,1.27,z,3.25,.045,.035,steel,.008);else{box(r,.56,1.27,z,2.23,.045,.035,steel,.008);box(r,-1.61,1.27,z,.12,.045,.035,steel,.008)}box(r,0,4.0,z,3.25,.045,.035,steel,.008)}
 // Gantry, movable crossbar, winch cable and three pivoting padded fingers.
 for(const x of [-1.44,1.44])rod(r,[x,3.86,-.82],[x,3.86,.82],.032,steel);
 const carriage=group(r,0,0,0);rod(carriage,[-1.48,3.87,0],[1.48,3.87,0],.033,steel);const winch=box(carriage,0,3.85,0,.36,.16,.32,dark,.045);
 const cable=part(r,new T.CylinderGeometry(.014,.014,1,10),rubber);
 const claw=group(r,0,3.55,0);box(claw,0,.055,0,.26,.15,.26,sage,.045);oval(claw,0,-.055,0,.15,.09,.15,steel,24);
 const fingers=[];for(let k=0;k<3;k++){const radial=group(claw);radial.rotation.y=k*2*Math.PI/3;const pivot=group(radial,.10,-.04,0);tube(pivot,[[0,0,0],[.16,-.15,0],[.22,-.34,0],[.07,-.40,0]],.023,steel,24,8);oval(pivot,.07,-.40,0,.055,.036,.04,rubber,16);fingers.push(pivot)}
 // Genuine outlet: dark opening, frame, tunnel, front shelf and a hinged lip.
 box(r,-1.00,1.00,.24,1.04,1.25,.025,dark,.015);box(r,-1.00,.40,1.43,1.17,.07,.80,sage,.025);
 box(r,-1.56,1.035,1.24,.07,1.27,.41,ivory,.02);box(r,-.44,1.035,1.24,.07,1.27,.41,ivory,.02);box(r,-1.00,1.67,1.23,1.17,.07,.43,ivory,.02);
 const flap=box(r,-1.0,.43,1.47,1.00,.08,.025,steel,.02);flap.rotation.x=.16;
 label(r,{x:.65,y:.77,z:1.061,w:1.16,h:.30,draw(c,w,h){c.fillStyle='#536c60';c.font='500 '+h*.22+'px Georgia';c.textAlign='center';c.fillText('A question, collected.',w/2,h*.42);c.font=h*.13+'px sans-serif';c.fillText('RUOHAN  /  PROJECTS 01–05',w/2,h*.78)}});
 label(r,{y:4.15,z:1.12,w:2.9,h:.21,draw(c,w,h){c.fillStyle='#53675d';c.font='500 '+h*.48+'px Georgia';c.textAlign='center';c.fillText('The collected questions',w/2,h*.66)}});
 const slots=[[-1.02,1.28,.28],[0,1.28,.33],[1.02,1.28,.23],[-.60,1.28,-.53],[.61,1.28,-.53]],toys=[];
 slots.forEach((p,i)=>{const toy=createBunny(r,{index:i,quality:.38,seed:37+i*91});toy.scale.setScalar(.67);toy.position.set(...p);toy.rotation.y=[.12,-.08,-.16,.14,-.2][i];toys.push(toy)});
 // The exit tray is at the left of the display, behind the front opening.
 
 const graspY=2.54,liftY=3.53,lowerY=2.78;
 let selected=0,animation=null,manual=false,lastNow=0;
 const position={x:0,z:0},velocity={x:0,z:0},input={x:0,z:0},sway={x:0,z:0};
 const collected=new Set(JSON.parse(sessionStorage.getItem('portfolio-collected')||'[]'));
 const collectionShelf=box(r,.30,.45,1.92,3.60,.10,.62,sage,.04);collectionShelf.visible=collected.size>0;
 function displayCollected(){collectionShelf.visible=collected.size>0;[...collected].forEach((i,n)=>{toys[i].position.set(-1.05+n*.65,.51,1.92);toys[i].rotation.y=.1})}displayCollected();
 const aim=oval(r,0,1.31,0,.28,.007,.28,material('#abbba0',{transparent:true,opacity:.3,roughness:1}),32);

 function reset(){toys.forEach((t,i)=>{t.position.set(...slots[i]);t.scale.setScalar(.67);t.rotation.z=0;t.visible=true})}
 function select(i){if(animation)return;selected=i;onStatus('已选择第 '+(i+1)+' 份项目手记。');stage.request()}
 function grab(i,done=onComplete,assisted=true){if(animation)return;manual=!assisted;
 if(assisted&&collected.has(i)){onStatus('这只玩偶已在收藏区，可直接阅读或明确重置。');done(i,false);return}
 let miss=false;if(manual){let distance=Infinity;slots.forEach((p,n)=>{if(collected.has(n))return;const d=Math.hypot(position.x-p[0],position.z-p[2]);if(d<distance){distance=d;i=n}});miss=distance>.4}
 selected=i;animation={start:performance.now(),done,miss,fromX:position.x,fromZ:position.z};stage.animating=true;stage.paused=false;stage.request()}
 stage.paused=false;
 stage.update=now=>{
  const dt=Math.min(.04,(now-lastNow)/1000||.016);lastNow=now;
 if(!animation){for(const axis of ['x','z']){const old=velocity[axis];velocity[axis]+=(input[axis]*1.2-velocity[axis])*Math.min(1,dt*7);position[axis]+=velocity[axis]*dt;sway[axis]+=(Math.max(-.09,Math.min(.09,(old-velocity[axis])*1.7))-sway[axis])*dt*8}position.x=clamp(position.x,-1.28,1.28);position.z=clamp(position.z,-.7,.7)}
 let x=position.x,z=position.z,y=liftY,close=0;
 aim.position.set(x,1.31,z);
 toys.forEach((toy,i)=>{if(!animation||i!==selected){toy.userData.tick(now*.001,0);if(!collected.has(i))toy.rotation.z=Math.sin(now*.0004+i*1.9)*.006}});

  if(animation){const t=(now-animation.start)/1000,toy=animation.miss?new T.Group():toys[selected],p=manual?[animation.fromX,slots[selected][1],animation.fromZ]:slots[selected];x=p[0];z=p[2];
   const travel=(a,b,start,duration)=>mix(a,b,smooth((t-start)/duration));
   if(t<.65){x=travel(animation.fromX,p[0],0,.65);z=travel(animation.fromZ,p[2],0,.65);onPhase('抓手移动到选中玩偶上方')}
   else if(t<1.9){y=travel(liftY,graspY,.65,1.25);onPhase('下降，张开抓爪')}
   else if(animation.miss){y=travel(graspY,liftY,1.9,1);onPhase('下方没有接触到玩偶，调整位置后可重试');if(t>2.9){const done=animation.done;animation=null;done(selected,false)}}
   else if(t<2.5){y=graspY;close=smooth((t-1.9)/.6);onPhase('闭爪，握住玩偶身体')}
   else if(t<3.8){close=1;y=travel(graspY,liftY,2.5,1.3);toy.position.y=p[1]+y-graspY;onPhase('提升玩偶')}
   else if(t<5.2){close=1;x=travel(p[0],-1.05,3.8,1.4);z=travel(p[2],.65,3.8,1.4);toy.position.set(x,p[1]+liftY-graspY,z);toy.rotation.z=Math.sin((t-3.8)*4)*.035;onPhase('沿滑轨搬运到取物通道')}
   else if(t<6.0){close=1;x=-1.05;z=.65;y=travel(liftY,lowerY,5.2,.8);toy.position.set(x,p[1]+y-graspY,z);onPhase('放入取物通道')}
   else if(t<6.8){x=-1.05;z=.65;y=lowerY;close=1-smooth((t-6)/.5);toy.position.set(x,travel(p[1]+lowerY-graspY,.51,6,.8),z);toy.scale.setScalar(.67);onPhase('松爪，玩偶落到取物口')}
   else if(t<8.1){x=-1.05;z=.65;y=travel(lowerY,liftY,6.8,1.3);toy.position.set(-1.05,.51,travel(.65,1.92,6.8,1.3));toy.scale.setScalar(.67);onPhase('从机柜取出玩偶')}
   else if(t<9.0){x=-1.05;z=.65;collectionShelf.visible=true;toy.position.set(travel(-1.05,-1.05+collected.size*.65,8.1,.9),.51+.035*Math.sin(clamp((t-8.1)/.9)*Math.PI)*Math.exp(-(t-8.1)*3),1.92);toy.rotation.y=travel(toy.rotation.y,.15,8.1,.9);toy.scale.setScalar(.67);onPhase('玩偶已落稳，标签展开后可主动阅读')}
   else{const done=animation.done;animation=null;stage.animating=false;stage.paused=false;collected.add(selected);sessionStorage.setItem('portfolio-collected',JSON.stringify([...collected]));displayCollected();position.x=-1.05;position.z=.65;done(selected,true)}
   toy.userData.tick?.(now*.001,close);if(!animation?.miss&&t>1.9&&t<8.1){const compression=t<2.5?close*.035:t>6?Math.sin(clamp((t-6)/.8)*Math.PI)*.08:0;toy.scale.set(.67*(1+compression*.5),.67*(1-compression),.67);toy.userData.ears?.forEach((ear,n)=>{ear.rotation.x=Math.sin(t*4-n)*.05*(t>2.5?1:.4)})}stage.animating=!!animation;
  }
  carriage.position.z=z;winch.position.x=x;claw.position.set(x+sway.x,y,z+sway.z);claw.rotation.z=-sway.x;claw.rotation.x=sway.z;fingers.forEach(f=>f.rotation.z=.35-close*.25);
  const top=3.79,bottom=y+.14;cable.position.set(x,(top+bottom)/2,z);cable.scale.y=Math.max(.01,top-bottom);
 };
 let phase='';function onPhase(text){if(phase!==text){phase=text;onStatus(text)}}
 stage.update(performance.now());stage.draw();stage.request();const ray=new T.Raycaster();el.addEventListener('click',e=>{if(animation)return;const b=el.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),stage.camera);const hits=ray.intersectObjects(toys,true);if(hits.length){let obj=hits[0].object;while(obj&&!toys.includes(obj))obj=obj.parent;const i=toys.indexOf(obj);if(i>=0){select(i);onSelect(i)}}});
 return {stage,select,grab,move(x,z){input.x=x;input.z=z;stage.request()},resetCollection(){if(animation)return;collected.clear();collectionShelf.visible=false;sessionStorage.removeItem('portfolio-collected');reset();stage.request()},get collected(){return [...collected]},get position(){return {...position}},get busy(){return !!animation}};
}
