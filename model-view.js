/* All labels are projected from model coordinates and activate the original
   project controls, so the keyboard and model paths always use the same data. */
(() => {
  const models=window.portfolioModels,T=window.THREE;
  const $=selector=>document.querySelector(selector);
  const buttons=selector=>Array.from(document.querySelectorAll(selector));
  const active=selector=>buttons(selector).findIndex(b=>b.getAttribute('aria-pressed')==='true');
  const choose=(selector,index)=>buttons(selector)[index]?.click();
  const link=(name,at,run,pressed=false)=>({name,at,run,pressed});
  const evidence='#pane fieldset button',queries='#qs button',grouping='#metric-lab button';
  const titles=['鱼菜共生温室','多院区医院','储能模组剖面','UCL 学习书桌'];
  const routeNames=['平常出门','刚下飞机','睡过头了'];
  const evidenceNames=[['次周续订','小样本','订单台账'],['指标定义','离职口径','考核副作用'],['企业身份','异常值','产业链缺口']];
  function state(key){
    if(key==='seoul'){
      const selector='#departure button',i=active(selector);
      return {model:'cafe',index:i,title:'圣水街角 · 路线示意',points:routeNames.map((n,k)=>link(n,[-1.55+k*1.55,k===1?1.72:.65,k===1?-.3:.68],()=>choose(selector,k),i===k))};
    }
    if(key==='agent'){
      const index=active(queries),choice=active(grouping);
      function showOrder(k){if(index!==1)choose(queries,1);choose(grouping,k)}
      return {model:'orders',index,choice,title:'订单分拣台',points:[
        link('按顾客合并',[choice===1?-.24:.05,.84,.62],()=>showOrder(0),index===1&&choice===0),
        link('按下单编号拆开',[choice===1?1.39:.85,.94,-.66],()=>showOrder(1),index===1&&choice===1)]};
    }
    if(key==='presale'){
      const index=active('#saleqs button');
      return {model:'sale',index,title:index===3?'羽绒服 · 尺码核对':'鞋底样品 · 尺码核对',points:[
        link(index===3?'尺码资料':'翻看资料',[-.71,.68,-.31],()=>{const b=$('.spec-card');if(b.getAttribute('aria-expanded')!=='true')b.click();b.focus();}),
        link(index===3?'核对单位':'核对尺码',[1,.53,.42],()=>{choose('#saleqs button',index===3?3:1);const b=$('.spec-card');if(b.getAttribute('aria-expanded')!=='true')b.click();b.focus();})]};
    }
    if(key==='lab'){
      const index=active('#filmstrip button');
      return {model:'review',index,title:'回答复核 · 校阅桌',points:index<0?[]:[
        link('核查依据',[.35,.6,.04],()=>{const detail=$('.lab-evidence');detail.open=true;detail.querySelector('summary').focus()}),
        link('审这条回答',[-1,.39,-.47],()=>$('#play button')?.focus())]};
    }
    const index=Math.max(0,active('#jobs button')),point=active(evidence);
    const positions=[[[-1.54,1.13,-.52],[-.15,1.58,-.10],[1.5,.65,.15]],[[-1.12,1.57,-.16],[.34,.76,.53],[1.18,1.27,-.32]],[[-1.57,1.02,.39],[.03,.98,-.43],[1.54,.94,.47]]];
    const points=index===3?[link('学习记录',[-.72,.80,.07],()=>$('#pane').scrollIntoView({block:'center'}))]:
      evidenceNames[index].map((n,k)=>link(n,positions[index][k],()=>choose(evidence,k),k===point));
    return {model:['greenhouse','hospital','battery','reading'][index],index,choice:point,title:titles[index],points};
  }
  class View {
    constructor(figure){
      this.figure=figure;this.key=figure.dataset.scene;this.port=figure.querySelector('.model-port');
      this.labels=figure.querySelector('.model-points');this.angle=-.26;this.pitch=.49;
      this.models=new Map();this.inView=false;
      this.observer=new IntersectionObserver(([entry])=>{this.inView=entry.isIntersecting;if(this.inView)this.refresh()},{rootMargin:'180px'});
      this.observer.observe(this.port);
      window.addEventListener('botanyready',()=>{if(this.inView)this.draw()});
      new ResizeObserver(()=>{if(this.inView)this.draw()}).observe(this.port);
      this.port.addEventListener('pointerdown',event=>{
        if(event.target.closest('button')||event.button!==0)return;
        this.drag={x:event.clientX,y:event.clientY,a:this.angle,p:this.pitch};
        this.port.setPointerCapture(event.pointerId);
      });
      this.port.addEventListener('pointermove',event=>{
        if(!this.drag)return;
        this.angle=this.drag.a+(event.clientX-this.drag.x)*4/this.port.clientWidth;
        this.pitch=Math.max(.21,Math.min(.91,this.drag.p+(event.clientY-this.drag.y)*.004));this.draw();
      });
      this.port.addEventListener('lostpointercapture',()=>this.drag=null);
      this.port.addEventListener('keydown',event=>{
        if(event.target!==this.port||!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;
        event.preventDefault();this.angle=event.key==='Home'?-.26:this.angle+(event.key==='ArrowLeft'?-.25:.25);this.draw();
      });
      // Case controls build or replace their own DOM synchronously.
      const room=figure.closest('.room');
      room.addEventListener('click',()=>queueMicrotask(()=>this.refresh()));
      if(this.key==='seoul')new MutationObserver(()=>this.refresh()).observe($('#departure'),{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
    }
    build(){
      try{this.renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}
      catch{this.figure.classList.add('unavailable');this.observer.disconnect();return false}
      this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
      this.renderer.outputEncoding=T.sRGBEncoding;
      this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
      this.port.prepend(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-hidden','true');
      this.world=new T.Scene();this.camera=new T.OrthographicCamera(-3,3,2,-2,.1,40);
      this.world.add(new T.HemisphereLight(0xfffcf3,0xd1d9de,.92));
      const sun=new T.DirectionalLight(0xfff2dc,1.04);sun.position.set(-3,7,4);sun.castShadow=true;
      sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:18});sun.shadow.normalBias=.019;sun.shadow.bias=-.00032;
      this.world.add(sun);const fill=new T.DirectionalLight(0xd7e2ff,.38);fill.position.set(3,3,-2);this.world.add(fill);
      const floor=new T.Mesh(new T.PlaneGeometry(80,80),new T.ShadowMaterial({opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=-.211;floor.receiveShadow=true;this.world.add(floor);
      return true;
    }
    refresh(){
      if(!this.inView||this.figure.classList.contains('unavailable'))return;
      if(!this.renderer&&!this.build())return;
      const s=state(this.key),signature=[s.model,s.index,s.choice,...s.points.map(p=>p.pressed)].join('/');
      if(signature===this.signature){this.draw();return}
      this.signature=signature;
      if(!this.models.has(s.model)){
        const group=new T.Group(),controls=models[s.model](group,s);
        this.world.add(group);this.models.set(s.model,{group,controls});
      }
      this.models.forEach((item,key)=>item.group.visible=key===s.model);
      this.models.get(s.model).controls?.update(s);
      this.points=s.points;
      this.figure.querySelector('figcaption strong').textContent=s.title;
      const hadFocus=this.labels.contains(document.activeElement);
      const focusIndex=Array.from(this.labels.children).indexOf(document.activeElement);
      this.labels.replaceChildren(...s.points.map(p=>{
        const b=document.createElement('button');b.type='button';b.textContent=p.name;
        b.setAttribute('aria-pressed',String(p.pressed));b.onclick=p.run;return b;
      }));
      if(hadFocus)this.labels.children[focusIndex]?.focus({preventScroll:true});
      this.draw();
    }
    draw(){
      if(!this.renderer||!this.points||!this.inView)return;
      const {clientWidth:w,clientHeight:h}=this.port;if(!w||!h)return;
      if(w!==this.w||h!==this.h){this.renderer.setSize(w,h,false);this.w=w;this.h=h}
      const half=Math.max(1.59,2.73*h/w),camera=this.camera;
      camera.left=-half*w/h;camera.right=-camera.left;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
      const targetY=this.key==='agent'||this.key==='lab'||this.key==='presale'?.37:.63;
      camera.position.set(Math.sin(this.angle)*8,Math.tan(this.pitch)*8+targetY,Math.cos(this.angle)*8);
      camera.lookAt(0,targetY,0);camera.updateMatrixWorld();
      this.renderer.render(this.world,camera);
      const vector=new T.Vector3();
      const placed=[];
      this.points.forEach((p,i)=>{
        vector.set(...p.at).project(camera);
        const b=this.labels.children[i],margin=b.offsetWidth/2+3;
        const x=Math.max(margin,Math.min(w-margin,(vector.x+1)*w/2));
        const anchorY=(1-vector.y)*h/2;
        let y=Math.max(b.offsetHeight+3,Math.min(h-12,anchorY-8));
        for(const prior of placed){
          if(Math.abs(x-prior.x)<margin+prior.margin && Math.abs(y-prior.y)<b.offsetHeight+4){
            const above=prior.y-b.offsetHeight-6;
            y=above>b.offsetHeight?above:Math.min(h-12,prior.y+b.offsetHeight+6);
          }
        }
        b.style.left=x+'px';b.style.top=y+'px';
        b.style.setProperty('--leader',Math.max(4,anchorY-y)+'px');
        placed.push({x,y,margin});
      });
    }
  }
  for(const figure of document.querySelectorAll('.model-figure')){
    if(models)new View(figure);else figure.classList.add('unavailable');
  }
})();
