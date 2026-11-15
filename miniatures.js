/* Small working models. Coordinates use the top of the base as floor level. */
(() => {
  if (!window.THREE) return;
  const T = THREE, ink='#223b42', cream='#f3eee0', spruce='#426f66', brass='#bc965e', lilac='#a999bc';
  const materialCache=new Map(), geometryCache=new Map();
  function finish(color, metal=0) {
    const key=color+':'+metal;
    if(!materialCache.has(key))materialCache.set(key,new T.MeshStandardMaterial({
      color:new T.Color(color).convertSRGBToLinear(),metalness:metal,roughness:metal?.43:.77
    }));
    return materialCache.get(key);
  }
  function geometry(key,build){
    if(!geometryCache.has(key))geometryCache.set(key,build());
    return geometryCache.get(key);
  }
  function part(parent, geo, m, x,y,z){
    const object=new T.Mesh(geo,typeof m==='string'?finish(m):m);
    object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
  }
  function group(parent,x=0,y=0,z=0){
    const g=new T.Group();parent.add(g);g.position.set(x,y,z);return g;
  }
  function block(g,x,y,z,w,h,d,color){
    const b=part(g,geometry('box',()=>new T.BoxGeometry()),color,x,y,z);b.scale.set(w,h,d);return b;
  }
  function round(g,x,y,z,w,h,d,r,color){
    const key=[w,h,d,r].join('/');
    const geo=geometry(key,()=>{
      const shape=new T.Shape(),a=-w/2,b=-d/2;
      shape.moveTo(a+r,b);shape.lineTo(-a-r,b);shape.quadraticCurveTo(-a,b,-a,b+r);
      shape.lineTo(-a,-b-r);shape.quadraticCurveTo(-a,-b,-a-r,-b);
      shape.lineTo(a+r,-b);shape.quadraticCurveTo(a,-b,a,-b-r);
      shape.lineTo(a,b+r);shape.quadraticCurveTo(a,b,a+r,b);
      const geo=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:6});
      geo.rotateX(-Math.PI/2);return geo;
    });
    return part(g,geo,color,x,y,z);
  }
  function disk(g,x,y,z,r,h,color){
    const item=part(g,geometry('cylinder',()=>new T.CylinderGeometry(1,1,1,24)),color,x,y,z);
    item.scale.set(r,h,r);return item;
  }
  function oval(g,x,y,z,w,h,d,color){
    const item=part(g,geometry('oval',()=>new T.SphereGeometry(1,12,8)),color,x,y,z);
    item.scale.set(w,h,d);return item;
  }
  function wire(g,points,r,color){
    const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    return part(g,new T.TubeGeometry(path,Math.max(8,points.length*5),r,7,false),color,0,0,0);
  }
  function beam(g,a,b,r,color){
    const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
    const mid=start.clone().lerp(end,.5);
    const mesh=disk(g,mid.x,mid.y,mid.z,r,delta.length(),color);
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return mesh;
  }
  function panel(g,x,y,z,w,h,paint,floor=false){
    const c=document.createElement('canvas');c.width=640;c.height=Math.max(96,Math.round(640*h/w));
    const ctx=c.getContext('2d');paint(ctx,c.width,c.height);
    const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;tex.anisotropy=4;
    const mat=new T.MeshStandardMaterial({map:tex,roughness:.85,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2});
    const face=part(g,new T.PlaneGeometry(w,h),mat,x,y,z);face.castShadow=false;if(floor)face.rotation.x=-Math.PI/2;return face;
  }
  function print(color,headline,sub,mark=false){
    return (c,w,h)=>{
      c.fillStyle=color;c.fillRect(0,0,w,h);c.fillStyle=ink;c.textAlign='left';c.textBaseline='middle';
      c.font='600 '+Math.min(w*.12,h*.36)+'px system-ui';c.fillText(headline,w*.075,h*.31,w*.86);
      c.font=Math.min(w*.065,h*.22)+'px system-ui';c.fillText(sub,w*.075,h*.65,w*.86);
      if(mark){for(let i=0;i<82;i++){const x=w*.076+i*w*.0094;c.fillRect(x,h*.83,1+(i*11%5),h*.09)}}
    };
  }
  function base(g,tint,w=4.6,d=2.65){
    round(g,0,-.19,0,w-.09,.08,d-.09,.18,ink);
    round(g,0,-.115,0,w,.105,d,.19,tint);
  }
  function cargo(g,x,z,s,id){
    const parcel=group(g,x,.015,z);parcel.scale.setScalar(s);
    round(parcel,0,0,0,1.24,.72,.98,.035,'#ba9171');
    block(parcel,0,.733,0,.155,.012,.98,'#e0c79d');block(parcel,0,.36,.499,.155,.72,.012,'#d3b991');
    panel(parcel,-.27,.742,.015,.46,.65,print('#fcf8e9','ORDER',id,true),true);
    panel(parcel,-.27,.36,.504,.47,.28,print('#d8c6a7','OLIST',id));
    return parcel;
  }
  function orders(g,state){
    base(g,'#a6c2c5');const console=group(g,-1.42,.02,-.33);
    round(console,0,0,0,1.04,.34,.99,.12,ink);round(console,0,.34,-.10,.99,.30,.73,.10,'#80a59d');
    block(console,0,.645,-.03,.69,.012,.08,ink);
    const paper=panel(console,0,.89,-.08,.62,.61,print(cream,'OLIST','ORDER LOG',true));paper.rotation.x=-.23;
    disk(console,.31,.36,.36,.065,.045,'#d68d66');
    const frontParcel=cargo(g,.05,.62,.97,'01');frontParcel.rotation.y=.10;
    const rearParcel=cargo(g,.85,-.66,1.10,'02');rearParcel.rotation.y=-.12;
    const track=group(g);for(const z of [1.21,1.27])block(track,.44,.03,z,2.34,.025,.026,brass);
    const flag=group(g,1.38,.02,.79);
    const label=panel(flag,0,.27,0,1.03,.43,print(cream,'A + B','CUSTOMER'));label.rotation.x=-.24;
    return {update(s){
      const separate=s.choice===1;
      // Keep the depth lanes fixed when the two orders move sideways.
      frontParcel.position.x=separate?-.24:.05;
      rearParcel.position.x=separate?1.39:.85;
      flag.visible=s.index===1&&!separate;
      console.rotation.y=s.index===0?.19:0;
    }};
  }
  function cafe(g){
    base(g,'#bdc9b5');const wall='#b88572',mortar='#ca9b86',frame='#364c4a';
    block(g,-.14,.67,-.41,2.63,1.34,1.13,wall);
    for(let y=0;y<8;y++){
      block(g,-.14,.09+y*.16,.159,2.62,.012,.013,mortar);
      for(let k=0;k<9;k++){const x=-1.38+k*.295+(y%2)*.13;if(x<1.14)block(g,x,.16+y*.16,.163,.012,.14,.014,mortar)}
    }
    round(g,-.14,1.35,-.41,2.80,.09,1.29,.06,'#687c73');
    block(g,-.16,.66,.186,2.26,.96,.055,frame);
    for(let i=0;i<4;i++){
      const x=-.981+i*.554;block(g,x,.69,.225,.50,.78,.028,i%2?'#a9c3be':'#809f9e');
      block(g,x,.86,.246,.5,.03,.022,frame);
    }
    const awning=group(g,-.16,1.23,.37);awning.rotation.x=.14;
    for(let i=0;i<13;i++)block(awning,-1.16+i*.192,0,0,.193,.051,.49,i%2?'#eae7d6':'#71988a');
    panel(g,-.17,1.57,-.24,1.19,.31,print(cream,'성수   SEONGSU','서울  /  SEOUL'));
    for(const x of [-1.67,1.63]){
      disk(g,x,.15,.25,.27,.26,'#9b765e');beam(g,[x,.22,.25],[x+.06,.89,.25],.045,'#746454');
      for(let k=0;k<7;k++)oval(g,x+Math.sin(k*2.4)*.18,.86+k%3*.11,.25+Math.cos(k*2.4)*.16,.22,.21,.2,k%2?'#809c7e':'#648474');
    }
    const pins=[];
    for(let i=0;i<3;i++){
      const x=-.85+i*.78;const stop=group(g,x,0,.86);pins.push(stop);
      disk(stop,0,.045,0,.135,.07,brass);disk(stop,0,.09,0,.09,.05,spruce);
      if(i<2)block(g,x+.39,.035,.86,.78,.027,.038,'#698c83');
    }
    return {update(s){pins.forEach((p,i)=>p.scale.y=i===s.index?3.1:1)}};
  }
  function caliper(g){
    const tool=group(g,.55,.12,.33);tool.rotation.y=-.26;
    round(tool,0,0,0,2.65,.075,.26,.035,finish('#b1bdc1',.58));
    for(let k=0;k<36;k++)block(tool,-1.19+k*.068,.08,-.069,.012,.008,k%5===0?.11:.057,ink);
    function jaw(x){block(tool,x,.068,.17,.16,.11,.46,finish('#b0bec1',.55));block(tool,x+.055,.064,.43,.049,.11,.17,ink)}
    jaw(-1.1);jaw(.44);round(tool,.51,.08,-.005,.67,.16,.37,.045,'#334e53');
    panel(tool,.50,.251,0,.48,.22,print('#c5d6bb','265','mm'),true);
    disk(tool,.57,.1,.25,.102,.13,brass);
    return tool;
  }
  function sale(g){
    base(g,'#bccabe');const tread=group(g,-.66,.16,-.31);
    const profile=new T.Shape();profile.moveTo(-1.17,-.12);profile.bezierCurveTo(-1.32,-.40,-.81,-.51,-.46,-.35);
    profile.bezierCurveTo(.14,-.19,.45,-.43,.95,-.35);profile.bezierCurveTo(1.46,-.24,1.41,.17,1.09,.34);
    profile.bezierCurveTo(.67,.61,.03,.32,-.43,.28);profile.bezierCurveTo(-.92,.35,-1.23,.37,-1.17,-.12);
    const sole=new T.ExtrudeGeometry(profile,{depth:.19,bevelEnabled:true,bevelSize:.05,bevelThickness:.043,bevelSegments:3,curveSegments:12});sole.rotateX(-Math.PI/2);
    part(tread,sole,ink,0,0,0);
    for(let i=0;i<15;i++)for(const side of [-1,1]){
      const lug=block(tread,-1.03+i*.149,.215,side*(.137+.032*Math.cos(i*.44)),.096,.07,.23,'#576761');lug.rotation.y=side*(.33+.13*Math.sin(i));
    }
    const device=caliper(g);
    const jacket=group(g,-.28,.08,-.25);
    for(let i=0;i<7;i++){
      const wide=.76+Math.sin(i*.58)*.13;
      oval(jacket,0,.13+i*.065,-.04+i*.068,wide,.135,.18,i%2?'#5a7279':'#667d83');
      for(const side of [-1,1]){const sleeve=oval(jacket,side*(wide+.10),.13+i*.052,.11+i*.07,.24,.123,.18,'#566b72');sleeve.rotation.y=side*.33;}
    }
    wire(jacket,[[0,.25,-.10],[0,.36,.07],[0,.56,.44]],.018,brass);
    return {update(s){jacket.visible=s.index===3;tread.visible=!jacket.visible;device.position.x=s.index===1?.77:.55;device.visible=!jacket.visible}};
  }
  function review(g){
    base(g,'#bdb7c8');const folder=group(g,-.17,.055,0);folder.rotation.y=-.12;
    round(folder,0,0,0,2.87,.09,1.86,.08,'#7e758d');
    for(let i=0;i<5;i++)round(folder,i*.008,.105+i*.025,i*.009,2.55,.019,1.67,.035,cream);
    let face;
    const lens=group(g,.45,.42,.04);
    const rim=part(lens,new T.TorusGeometry(.40,.046,12,48),finish(brass,.52),0,0,0);rim.rotation.x=Math.PI/2;
    disk(lens,0,.005,0,.36,.016,new T.MeshStandardMaterial({color:0xb9dadd,transparent:true,opacity:.22,roughness:.1,depthWrite:false}));
    beam(lens,[.28,0,.27],[.91,.01,.91],.071,ink);
    const pencil=group(g,1.50,.10,-.15);pencil.rotation.y=.27;
    beam(pencil,[0,0,-.68],[0,0,.64],.053,'#a95c55');beam(pencil,[0,0,.64],[0,0,.79],.032,'#c5a27b');
    const records=[['尺码换算','100 斤','100 kg'],['营业时间','15:32','17:00'],['数据范围','订单截止','2018.09.03'],['单人用餐','旅行人数','用餐人数'],['防水性能','买家提问','商品资料']];
    return {update(s){
      if(face){folder.remove(face);face.material.map.dispose();face.material.dispose();face.geometry.dispose()}
      const r=records[s.index]||['复核完成','记录','汇总'];
      face=panel(folder,.02,.249,.018,2.49,1.6,(c,w,h)=>{
        c.fillStyle='#f7f4e9';c.fillRect(0,0,w,h);c.fillStyle=ink;c.font='bold 46px serif';c.fillText(r[0],42,73);
        c.strokeStyle='#b9b8ac';for(let j=0;j<6;j++){const y=98+47*j;c.beginPath();c.moveTo(41,y);c.lineTo(w-44,y);c.stroke()}
        c.fillStyle='#4b605e';c.font='30px system-ui';c.fillText(r[1],43,165);c.fillText(r[2],w*.46,245);
        c.strokeStyle='#a05d65';c.lineWidth=3;c.beginPath();c.ellipse(w*.59,236,100,29,-.06,0,Math.PI*2);c.stroke();
      },true);
      lens.position.x=.24+(s.index%3)*.18;
    }};
  }
  function greenhouse(g){
    base(g,'#b6c4a4');const wood='#b39c75',steel='#78a196';
    round(g,-.5,.01,-.10,2.97,.12,1.75,.04,'#d9ceb1');
    for(const x of [-1.87,-1.18,-.49,.20,.87]){
      for(const side of [-1,1]){
        beam(g,[x,.14,side*.75-.10],[x,1.15,side*.75-.10],.024,steel);
        beam(g,[x,1.15,side*.75-.10],[x,1.66,-.1],.027,steel);
      }
    }
    for(const [y,z] of [[1.66,-.1],[1.15,.65],[1.15,-.85]])beam(g,[-1.88,y,z],[.9,y,z],.024,steel);
    for(const z of [-.50,.28]){
      round(g,-.50,.22,z,2.57,.16,.54,.04,wood);
      for(let i=0;i<10;i++)for(let k=0;k<6;k++){
        const a=k*1.047+i*.37;
        const leaf=oval(g,-1.65+i*.26+.063*Math.cos(a),.46+(k%2)*.054,z+.07*Math.sin(a),.078,.122,.055,['#69956b','#83ab73','#49785d'][k%3]);
        leaf.rotation.z=Math.cos(a)*.62;leaf.rotation.x=Math.sin(a)*.62;
      }
    }
    for(let i=0;i<3;i++){
      const crate=group(g,1.46,.04+i*.19,.18);
      for(const z of [-.34,.34])for(const y of [.06,.149])block(crate,0,y,z,.86,.066,.042,wood);
      for(const x of [-.4,.4])block(crate,x,.091,0,.067,.18,.70,wood);
    }
    for(let i=0;i<10;i++)oval(g,1.19+(i%4)*.16,.55+(i%2)*.035,.05+Math.floor(i/4)*.14,.09,.095,.08,'#b77750');
  }
  function hospital(g){
    base(g,'#b3c8c9');const fac='#ece7d9',glass='#759ca5';
    function wing(x,z,w,d,floors){
      const step=.31;block(g,x,.16+floors*step/2,z,w,floors*step,d,glass);
      for(let i=0;i<=floors;i++)round(g,x,.13+step*i,z,w+.13,.065,d+.14,.042,fac);
      for(let i=0;i<Math.floor(w/.25);i++)block(g,x-w/2+.12+i*.25,.19+floors*step/2,z+d/2+.012,.025,floors*step,.033,fac);
    }
    wing(-.86,-.18,1.74,1.11,4);wing(.96,-.33,1.53,.92,3);
    block(g,.12,.80,-.18,.48,.25,.46,glass);
    round(g,-.24,.43,.68,1.15,.075,.69,.065,finish('#98aaab',.25));
    for(const x of [-.73,.23])beam(g,[x,.03,.95],[x,.44,.95],.029,fac);
    for(let i=0;i<4;i++)round(g,-.20,.023*i,.97-i*.09,1.03,.028,.20,.024,fac);
    for(const x of [-1.74,1.52]){disk(g,x,.07,.76,.24,.11,'#b9ada0');oval(g,x,.29,.76,.20,.30,.20,'#7a957f')}
  }
  function battery(g){
    base(g,'#a4bdba');round(g,0,.035,0,3.65,.14,1.88,.11,ink);
    for(const z of [-.84,.84])round(g,0,.18,z,3.6,.16,.11,.04,'#72878a');
    for(let i=0;i<10;i++)for(let j=0;j<3;j++){
      const x=-1.48+i*.324,z=-.48+j*.48;
      disk(g,x,.55,z,.142,.64,finish(j%2?'#91a8a4':'#9eaaa1',.45));
      disk(g,x,.88,z,.132,.046,'#485c5a');disk(g,x,.919,z,.055,.03,brass);
    }
    for(let i=0;i<9;i++)for(const z of [-.48,.48])block(g,-1.32+i*.324,.926,z,.17,.019,.053,'#bb8658');
    wire(g,[[-1.55,.50,.86],[-1.63,.74,.7],[-1.6,.96,.46],[-1.48,.95,.46]],.041,'#c98453');
    for(const side of [-1,1]){
      const rail=group(g,side*1.77,.19,0);
      for(let k=0;k<15;k++)block(rail,0,.17,-.73+k*.105,.085,.34,.047,'#536d71');
    }
  }
  function reading(g){
    base(g,'#c1becb');
    for(let i=0;i<3;i++){
      const book=group(g,-.68,.02+i*.19,.10);book.rotation.y=-.13+i*.13;
      round(book,0,0,0,1.86,.045,1.17,.05,[lilac,spruce,ink][i]);
      round(book,.02,.05,.01,1.78,.095,1.11,.03,cream);
      round(book,0,.145,0,1.86,.032,1.17,.04,[lilac,spruce,ink][i]);
    }
    const book=group(g,-.67,.58,.06);panel(book,0,.01,0,1.77,1.14,print('#d6d4c4','UCL','DATA   /   POLICY'),true);
    disk(g,1.14,.11,-.14,.36,.13,brass);
    wire(g,[[1.14,.13,-.14],[1.14,.95,-.14],[.94,1.31,-.16],[.67,1.31,-.16]],.035,finish(brass,.42));
    const shade=part(g,new T.ConeGeometry(.39,.35,36,1,true),spruce,.67,1.15,-.16);shade.material.side=T.DoubleSide;
    disk(g,.67,.98,-.16,.366,.018,'#efdeb2');
  }
  window.portfolioModels={cafe,orders,sale,review,greenhouse,hospital,battery,reading};
})();
