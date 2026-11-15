(() => {
  const $ = (selector) => document.querySelector(selector);
  const selected = (selector) => [...document.querySelectorAll(selector)]
    .findIndex(button => button.getAttribute('aria-pressed') === 'true');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const models = window.courtModels;
  class Stage {
    constructor(id, options) {
      this.host = document.getElementById(id);
      this.options = options;
      this.angle = options.angle;
      this.target = this.angle;
      this.pitch = options.pitch;
      this.visible = false;
      this.host.addEventListener('pointerdown', event => {
        if(event.button !== 0 || !this.renderer)return;
        this.drag = {x:event.clientX, y:event.clientY,angle:this.target,pitch:this.pitch};
        this.host.setPointerCapture(event.pointerId);
      });
      this.host.addEventListener('pointermove',event=>{
        if(!this.drag)return;
        const dx=event.clientX-this.drag.x,dy=event.clientY-this.drag.y;
        this.target=this.drag.angle+dx*6/Math.max(260,this.host.clientWidth);
        this.pitch=Math.max(-1.3,Math.min(1.3,this.drag.pitch+dy*.006));
        this.request();
      });
      const release=event=>{
        const start=this.drag;
        this.drag=null;
        if(event.type==='pointerup' && start && Math.hypot(event.clientX-start.x,event.clientY-start.y)<6){
          this.options.tap?.();
        }
      };
      this.host.addEventListener('pointerup',release);
      this.host.addEventListener('lostpointercapture',release);
      this.host.addEventListener('pointercancel',release);
      this.host.addEventListener('keydown',event=>{
        if(!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;
        event.preventDefault();
        this.target=event.key==='Home'?options.angle:this.target+(event.key==='ArrowRight'?.3:-.3);
        if(event.key==='Home')this.pitch=options.pitch;
        this.request();
      });
      new ResizeObserver(()=>this.resize()).observe(this.host);
    }
    show(builder, description) {
      this.builder=builder;
      this.host.setAttribute('aria-label',description+'。左右拖动或按方向键旋转。');
      this.host.dataset.description=description;
      if(this.renderer)this.populate();
    }
    build(){
      if(!models || this.renderer || this.failed || !this.builder)return;
      try{this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})}
      catch{this.failed=true;this.host.classList.add('no-gl');$('#card-zoom').hidden=true;return}
      this.renderer.setPixelRatio(Math.min(1.5,devicePixelRatio));
      this.renderer.outputEncoding=THREE.sRGBEncoding;
      this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;
      this.host.appendChild(this.renderer.domElement);
      this.host.classList.add('rendered');
      this.scene=new THREE.Scene();
      this.camera=new THREE.OrthographicCamera(-3,3,2,-2,.1,50);
      this.camera.position.z=10;
      this.pivot=new THREE.Group();this.scene.add(this.pivot);
      this.scene.add(new THREE.HemisphereLight(0xf4f6ff,0x858978,.76));
      const sun=new THREE.DirectionalLight(0xfffbf1,1.18);sun.position.set(-3,6,5);this.scene.add(sun);this.sun=sun;sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-3.8,right:3.8,top:3.8,bottom:-3.8,near:.1,far:16});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=.021;sun.shadow.bias=-.00045;
      const fill=new THREE.DirectionalLight(0xd2e1ff,.54);fill.position.set(4,3,-5);this.scene.add(fill);
      this.populate();
    }
    populate(){
      if(this.model){
        const materials=new Set();
        this.model.traverse(child=>{child.geometry?.dispose();if(child.material)materials.add(child.material)});
        materials.forEach(material=>{material.map?.dispose();material.dispose()});
        this.pivot.remove(this.model);
      }
      this.model=new THREE.Group();this.pivot.add(this.model);this.builder(models,this.model);this.request();
    }
    resize(){
      if(!this.host.closest('dialog').open||!this.renderer)return;
      const w=this.host.clientWidth,h=this.host.clientHeight;
      if(!w||!h)return;
      const half=Math.max(this.options.height,this.options.width*h/w)/2;
      this.camera.position.y=this.zoom ? .78 : this.options.centerY;
      this.camera.top=half;this.camera.bottom=-half;this.camera.left=-half*w/h;this.camera.right=-this.camera.left;
      this.camera.updateProjectionMatrix();this.renderer.setSize(w,h,false);this.request();
    }
    request(){
      if(this.raf || !this.host.closest('dialog').open || !this.renderer)return;
      this.raf=requestAnimationFrame(()=>{
        this.raf=0;
        const delta=this.target-this.angle;
        this.angle+=motion.matches||Math.abs(delta)<.002?delta:delta*.22;
        this.pivot.rotation.order='YXZ';
        this.pivot.rotation.set(this.pitch,this.angle,0);
        // The grazing key travels across the leaves as the visitor turns the card.
        this.sun.position.set(-3+3.3*Math.sin(this.angle*.81),3.6+1.4*Math.cos(this.pitch),4.5);
        this.sun.color.setHSL(.095+.025*Math.sin(this.angle),.13+.14*(.5+.5*Math.sin(this.angle)),.91);
        const watching=this.zoom && Math.cos(this.angle)>0 && this.host.closest('dialog')?.open;
        if(!this.still && !motion.matches)this.flightTime=performance.now()/1000;
        this.model?.userData.wildlife?.(this.flightTime||1.35,watching);
        if(this.lastShadowAngle!==this.angle||this.lastShadowPitch!==this.pitch||!watching){this.renderer.shadowMap.needsUpdate=true;this.lastShadowAngle=this.angle;this.lastShadowPitch=this.pitch}
        this.renderer.render(this.scene,this.camera);
        this.options.change?.(this.angle);
        if(Math.abs(this.target-this.angle)>.001 || (watching&&!this.still&&!motion.matches&&!document.hidden))this.request();
      });
    }
  }

  const modal=$('#calling-card'), cardButton=$('#turn-card');
  let back=null;
  function face(angle){
    const showingBack=Math.cos(angle)<0;
    if(back===showingBack)return;
    back=showingBack;
    $('#card-front-info').hidden=back;
    $('#card-back-info').hidden=!back;
    cardButton.textContent=back?'翻回庭院 ↻':'翻到背面 ↻';
    modal.dataset.face=back?'back':'front';
  }
  const card=new Stage('card-object',{width:6.42,height:4.15,centerY:.73,angle:-.20,pitch:-.96,change:face});
  card.show((m,g)=>m.gardenCard(g,()=>card.request()),'张楉晗的双面庭院名片');
  function openCard(){
    card.options.width=6.42;card.options.height=4.15;card.zoom=false;
    zoom.setAttribute("aria-pressed","false");zoom.textContent="放大";modal.showModal();card.build();card.resize();card.target=-.20;card.angle=-.20;card.pitch=-.96;face(card.angle);
    card.request();
  }
  $('.take-card').onclick=openCard;
  const contactButton=document.createElement('button');
  contactButton.textContent='拿起我的名片 ↗';contactButton.className='end-card';
  contactButton.onclick=openCard;$('#contact .end').before(contactButton);
  const zoom=$('#card-zoom');
  const still=$('#still-flight');
  still.hidden=motion.matches;
  still.onclick=()=>{card.still=!card.still;still.setAttribute('aria-pressed',String(card.still));still.textContent=card.still?'播放动效':'暂停动效';card.request()};
  zoom.onclick=()=>{
    card.zoom=!card.zoom;
    card.options.width=card.zoom?3.55:6.42;card.options.height=card.zoom?2.68:4.15;
    if(card.zoom){card.target=-.14;card.pitch=-1.03}
    zoom.setAttribute('aria-pressed',String(card.zoom));
    zoom.textContent=card.zoom?'缩小':'放大';
    $('#wildlife-hint').hidden=!card.zoom;card.resize();
  };
  modal.addEventListener('close',()=>{card.zoom=false;$('#wildlife-hint').hidden=true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden && modal.open)card.request()});
  cardButton.onclick=()=>{
    if(card.zoom)zoom.click();
    const turn=Math.PI*2,base=Math.round(card.angle/turn)*turn;
    card.target=back?base:base+(card.angle>=base?Math.PI:-Math.PI);
    card.pitch=back?-.96:-.10;
    if(card.renderer)card.request();else face(card.target);
  };
  modal.addEventListener('click',event=>{
    if(event.target===modal || event.target.closest('a[href="#seoul"]'))modal.close();
  });
  $('#card-copy').onclick=async()=>{
    try{await navigator.clipboard.writeText('zrh2026rhz@163.com');$('#card-copy').textContent='已复制'}
    catch{const range=document.createRange();range.selectNodeContents($('#card-back-info a'));getSelection().removeAllRanges();getSelection().addRange(range);$('#card-copy').textContent='已选中邮箱'}
  };

  const scenes = ['produce','hospital','battery','books'];
  function updateJob(){
    const index=selected('#jobs button');
    $('#experience').dataset.work=scenes[index];
    const evidence=[...document.querySelectorAll('#pane fieldset button')];
    const button=$('#inspect-job');button.hidden=!evidence.length;
    if(evidence.length){
      const next=(selected('#pane fieldset button')+1)%evidence.length;
      button.textContent=evidence[next].querySelector('span').textContent+' ↗';
      button.onclick=()=>evidence[next].click();
    }
  }
  $('#jobs').addEventListener('click',updateJob);
  $('#pane').addEventListener('click',event=>{if(event.target.closest('fieldset button'))updateJob()});
  updateJob();

  const sourceViews=[
    ['尺码表','100 斤','50 公斤','买家输入','换算后'],
    ['营业时间','15:32','17:00','预计到店','开始营业'],
    ['数据覆盖','2018.09.03','上个月？','订单截止','提问中的时间'],
    ['单人用餐','一个人旅行','独自用餐？','帖子已写明','仍待查证'],
    ['跑鞋详情页','防水性能','未说明','买家询问','资料记录']
  ];
  function source(){
    const i=selected('#filmstrip button'),el=$('#lab-source');
    el.closest('details').hidden=i<0;el.closest('details').open=false;if(i<0)return;
    const [title,a,b,l,r]=sourceViews[i];
    el.innerHTML='<small>'+title+'</small><div><span>'+l+'<b>'+a+'</b></span><span>'+r+'<b>'+b+'</b></span></div>';
  }
  $('#filmstrip').addEventListener('casechange',source);source();

  let route=[];
  function drawRoute(names) {
    const preview=$('#route-preview');preview.replaceChildren();
    names.slice(0,9).forEach((name,i)=>{
      const stop=document.createElement('span');stop.textContent=name;stop.title=(i+1)+'. '+name;preview.append(stop);
    });
  }
  function refreshRoute(){
    if(!$('#live-phone').hidden){drawRoute(route);return}
    const stops=[...document.querySelectorAll('#phbody .stops button span')].map(el=>el.textContent);
    drawRoute(stops);
  }
  window.addEventListener('message',e=>{
    if(e.source!==$('#live-phone').contentWindow||e.data?.kind!=='seoul-ticket'||!Array.isArray(e.data.route))return;
    route=e.data.route.filter(name=>typeof name==='string');refreshRoute();
  });
  $('#seoul').addEventListener('click',()=>queueMicrotask(refreshRoute));
  $('#live-phone').contentWindow.postMessage({kind:'seoul-depart'},'*');
})();
