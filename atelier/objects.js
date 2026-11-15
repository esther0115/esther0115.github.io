/* Original, locally rendered miniatures. All dimensions are in scene units. */
(() => {
  if (!window.THREE) return;
  const T = window.THREE;
  const v = (x, y, z) => new T.Vector3(x, y, z);
  const mat = (color, metalness = 0, roughness = .62) =>
    new T.MeshStandardMaterial({color:new T.Color(color).convertSRGBToLinear(), metalness, roughness});
  function group(parent, x=0, y=0, z=0) {
    const g = new T.Group();
    g.position.set(x,y,z);
    parent.add(g);
    return g;
  }
  function mesh(parent, geometry, material, x, y, z) {
    const m = new T.Mesh(geometry, material);
    m.position.set(x,y,z);
    parent.add(m);
    return m;
  }
  function box(parent, size, position, material) {
    return mesh(parent,new T.BoxGeometry(...size),material,...position);
  }
  function ellipsoid(parent, position, scale, material) {
    const m=mesh(parent,new T.SphereGeometry(1,20,14),material,...position);
    m.scale.set(...scale);
    return m;
  }
  function cylinder(parent, top, bottom, height, position, material, segments=32) {
    return mesh(parent,new T.CylinderGeometry(top,bottom,height,segments),material,...position);
  }
  function rod(parent,a,b,r,material,tip=r) {
    const start=v(...a), end=v(...b), delta=end.clone().sub(start);
    const m=cylinder(parent,tip,r,delta.length(),start.clone().lerp(end,.5).toArray(),material,10);
    m.quaternion.setFromUnitVectors(v(0,1,0),delta.normalize());
    return m;
  }
  function curve(parent, points, radius, material) {
    return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>v(...p))),24,radius,7,false),material,0,0,0);
  }
  function plaque(parent,w,h,d,r,material) {
    const s = new T.Shape();
    const x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
    s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
    return mesh(parent,new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.018,bevelThickness:.018}),material,0,0,0);
  }
  function print(parent,w,h,paint) {
    const canvas=document.createElement('canvas');
    canvas.width=1200; canvas.height=Math.round(canvas.width*h/w);
    paint(canvas.getContext('2d'),canvas.width,canvas.height);
    const texture=new T.CanvasTexture(canvas);
    texture.encoding=T.sRGBEncoding; texture.anisotropy=4;
    const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});
    return mesh(parent,new T.PlaneGeometry(w,h),material,0,0,0);
  }
  function seeded(seed) {
    return ()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296};
  }
  // Branches split into broad, irregular fans. Each blossom is a flared
  // five-lobed corolla; the leaflets and flowers share instanced geometry.
  function tree(parent, x, z, height, spread, seed) {
    const rand = seeded(seed);
    const origin = group(parent, x, .06, z);
    const wood = mat(0x756457);
    const leaves = [], bells = [];
    function branch(points, start, end) {
      const spline = new T.CatmullRomCurve3(points);
      const path = new T.TubeGeometry(spline, 9, 1, 7, false);
      const pos = path.attributes.position;
      const vertex = new T.Vector3();
      for (let ring = 0; ring <= 9; ring++) {
        const t = ring / 9, center = spline.getPointAt(t);
        const radius = start + (end - start) * t;
        for (let k = 0; k <= 7; k++) {
          const i = ring * 8 + k;
          vertex.fromBufferAttribute(pos, i).sub(center).multiplyScalar(radius).add(center);
          pos.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
      }
      path.computeVertexNormals();
      mesh(origin, path, wood, 0, 0, 0).castShadow = true;
    }
    const fork = v(-.06, height * .53, .02);
    branch([v(0,0,0),v(.035,height*.23,.015),fork], .081, .046);
    const purple = [0x8476af,0x9786be,0xab9bd0,0xb7a8d8,0xc8bcdf,0xa193c6];
    const green = [0x627e73,0x748e7d,0x829980,0x567568];
    function specimen(list, position, scale, rotation, colors) {
      list.push({position,scale,rotation,color:colors[Math.floor(rand()*colors.length)]});
    }
    for(let arm=0;arm<13;arm++){
      const az=arm*2.39996+rand()*.3;
      const inner = arm >= 10;
      const reach = spread * (inner ? .10 + rand()*.21 : .46 + rand()*.46);
      const lift = height * (inner ? .48 + rand()*.11 : .22 + rand()*.26);
      const start=fork.clone().multiplyScalar(.80+.20*rand());
      const elbow=start.clone().add(v(Math.cos(az)*reach*.48,lift*.41,Math.sin(az)*reach*.4));
      const end=start.clone().add(v(Math.cos(az)*reach,lift,Math.sin(az)*reach*.8));
      branch([start,elbow,end],.044,.012);
      for(let twig=0;twig<7;twig++){
        const t=.36+twig*.1,base=elbow.clone().lerp(end,t);
        const turn=az+(twig%2?1:-1)*(.65+.6*rand());
        const tip=base.clone().add(v(Math.cos(turn)*spread*.27,.07+rand()*.15,Math.sin(turn)*spread*.23));
        if(twig%2===0)branch([base,base.clone().lerp(tip,.5).add(v(0,.03,0)),tip],.015,.004);
        for(let tuft=0;tuft<6;tuft++){
          const a=rand()*6.283,r=Math.sqrt(rand())*spread*.24;
          const head=tip.clone().add(v(Math.cos(a)*r,(rand()-.35)*.14,Math.sin(a)*r));
          for(let j=0;j<17;j++){
            const phase=j*2.399,level=j/17,rad=.039+level*.052;
            const at=head.clone().add(v(Math.cos(phase)*rad,level*.14-.075,Math.sin(phase)*rad));
            const s=spread*(.024+rand()*.014);
            specimen(bells,at,[s,s*1.32,s],[(rand()-.45)*1.9,phase,.5+rand()*1.4],purple);
          }
          for(let frond=0;frond<2;frond++){
            const phi=a+frond*2.3;
            for(let j=0;j<7;j++){
              const d=j*.024;
              for(const side of [-1,1]){
                const at=head.clone().add(v(Math.cos(phi)*d+side*.016*Math.sin(phi),-.035-d*.27,Math.sin(phi)*d-side*.016*Math.cos(phi)));
                specimen(leaves,at,[.017,.008,.040*(1-j*.05)],[.24,1.57-phi+side*.65,.13],green);
              }
            }
          }
        }
      }
    }
    function instance(geometry, items) {
      const material=new T.MeshStandardMaterial({roughness:.84,side:T.DoubleSide});
      const batch=new T.InstancedMesh(geometry,material,items.length),dummy=new T.Object3D();
      items.forEach((item,i)=>{
        dummy.position.copy(item.position);dummy.rotation.set(...item.rotation);dummy.scale.set(...item.scale);
        dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);
        batch.setColorAt(i,new T.Color(item.color).convertSRGBToLinear());
      });
      batch.castShadow=true;batch.receiveShadow=true;origin.add(batch);
    }
    const flower=new T.LatheGeometry([[.12,-.7],[.23,-.12],[.47,.44],[.64,.58]].map(p=>new T.Vector2(...p)),10);
    const p=flower.attributes.position;
    for(let i=3;i<p.count;i+=4)p.setY(i,p.getY(i)+((i-3)/4%2===0?.16:-.08));
    flower.computeVertexNormals();instance(flower,bells);
    instance(new T.SphereGeometry(1,5,3),leaves);
  }
  function meadow(lawn,redraw) {
    let turf;
    if (location.protocol === 'file:') {
      const grass = document.createElement('canvas');
      grass.width = grass.height = 192;
      const c = grass.getContext('2d'), random = seeded(46);
      c.fillStyle = '#79956b'; c.fillRect(0, 0, 192, 192);
      for (let i=0; i<4600; i++) {
        const x=random()*192, y=random()*192;
        c.fillStyle = i%2 ? '#637e55' : '#95a777';
        c.fillRect(x,y,1,1+random()*4);
      }
      turf = new T.CanvasTexture(grass);
    } else {
      turf = new T.TextureLoader().load('img/materials/meadow.webp', redraw);
    }
    turf.encoding=T.sRGBEncoding;turf.wrapS=turf.wrapT=T.RepeatWrapping;turf.repeat.set(2.1,1.03);turf.anisotropy=8;
    const ground=new T.MeshStandardMaterial({map:turf,color:0xcecebd,roughness:.95});
    box(lawn,[5.30,.085,2.18],[0,.012,-.29],mat(0x4d6243));
    const patch=mesh(lawn,new T.PlaneGeometry(5.3,2.18),ground,0,.057,-.29);patch.rotation.x=-Math.PI/2;patch.receiveShadow=true;
    const rng=seeded(411),positions=[],colors=[],indices=[];
    const tones=[0x435d3a,0x617b47,0x829554,0x536b42,0x92a86d].map(k=>new T.Color(k).convertSRGBToLinear());
    for(let clump=0;clump<3600;clump++){
      const x=(rng()-.5)*5.20,z=(rng()-.5)*2.09-.29;
      if(Math.hypot(x+.56,(z+.04)*1.05)<.56 || (x>.12 && Math.abs(z-.34+.12*x)<.11))continue;
      const h=.027+.12*rng()*(.64+.36*Math.sin(x*2.1+z*4));
      for(let blade=0;blade<5;blade++){
        const a=rng()*6.28,bx=x+(rng()-.5)*.075,bz=z+(rng()-.5)*.075;
        const lean=.019+rng()*.055,height=h*(.65+.6*rng()),w=.004+rng()*.007;
        const dx=Math.cos(a),dz=Math.sin(a),at=positions.length/3;
        positions.push(bx-dz*w,.061,bz+dx*w,bx+dz*w,.061,bz-dx*w,bx+dx*lean*.36,.06+height*.68,bz+dz*lean*.36,bx+dx*lean,.06+height,bz+dz*lean);
        const tone=tones[Math.floor(rng()*tones.length)];for(const lum of [.62,.65,.95,1.12])colors.push(tone.r*lum,tone.g*lum,tone.b*lum);
        indices.push(at,at+2,at+1,at+1,at+2,at+3);
      }
    }
    const foliage=new T.BufferGeometry();foliage.setIndex(indices);foliage.setAttribute('position',new T.Float32BufferAttribute(positions,3));foliage.setAttribute('color',new T.Float32BufferAttribute(colors,3));foliage.computeVertexNormals();
    mesh(lawn,foliage,new T.MeshLambertMaterial({side:T.DoubleSide,vertexColors:true}),0,0,0).receiveShadow=true;
    // Soft, directed contact shadows include the under-canopy region and plinth.
    function shade(x,z,w,h,strength){
      const shadow=print(lawn,w,h,(c,cw,ch)=>{
        const gradient=c.createRadialGradient(cw*.5,ch*.5,0,cw*.5,ch*.5,cw*.5);
        gradient.addColorStop(0,'rgba(21,39,31,'+strength+')');gradient.addColorStop(1,'rgba(21,39,31,0)');
        c.fillStyle=gradient;c.fillRect(0,0,cw,ch);
      });
      shadow.rotation.x=-Math.PI/2;shadow.position.set(x,.062,z);
    }
    shade(1.28,-.3,2.38,1.75,.58);shade(-1.75,-.52,1.52,1.35,.49);shade(-.53,.02,1.26,1,.68);
  }
  function butterflies(lawn) {
    const swarm=group(lawn,0,0,0);
    const makeWing=(colour)=>{
      const sheet=document.createElement('canvas');
      sheet.width=240;sheet.height=280;
      const c=sheet.getContext('2d');
      c.beginPath();c.moveTo(13,159);c.bezierCurveTo(49,79,115,12,211,17);
      c.bezierCurveTo(237,42,188,119,138,153);
      c.bezierCurveTo(192,165,160,219,109,234);
      c.quadraticCurveTo(87,267,73,261);c.lineTo(80,233);
      c.bezierCurveTo(36,234,18,202,13,159);c.closePath();
      const glow=c.createRadialGradient(78,158,8,107,135,127);
      glow.addColorStop(0,'#e5bd83');glow.addColorStop(.38,colour);glow.addColorStop(.78,'#3d4148');glow.addColorStop(1,'#242b35');
      c.fillStyle=glow;c.fill();c.save();c.clip();
      for(let k=0;k<11;k++){const y=20+k*22;c.strokeStyle='#524638';c.lineWidth=1.7;c.beginPath();c.moveTo(16,162);c.quadraticCurveTo(90,y*.62+63,211-Math.abs(130-y)*.26,y);c.stroke()}
      for(let k=0;k<9;k++){const y=32+k*11;c.fillStyle='#f7ebb4';c.beginPath();c.ellipse(210-k*5,y,3.7,2.5,-.7,0,7);c.fill()}
      c.restore();
      const texture=new T.CanvasTexture(sheet);texture.encoding=T.sRGBEncoding;
      return new T.MeshBasicMaterial({map:texture,side:T.DoubleSide,alphaTest:.35});
    };
    const insects=['#f2a94e','#8ebcc9'].map((color,i)=>{
      const body=group(swarm,0,0,0);
      const scale=i?1.18:1.42;body.scale.setScalar(scale);
      ellipsoid(body,[0,0,0],[.014,.024,.065],mat(0x453d32));
      const material=makeWing(color);
      const wings=[-1,1].map(side=>{
        const hinge=group(body,0,0,0);
        const wing=mesh(hinge,new T.PlaneGeometry(.16,.19),material,side*.075,0,0);
        wing.rotation.x=-Math.PI/2;if(side<0)wing.rotation.z=Math.PI;
        return hinge;
      });
      return {body,wings};
    });
    return (time,visible)=>{
      swarm.visible=visible;
      if(!visible)return;
      insects.forEach(({body,wings},i)=>{
        const t=time*(i?.72:.88)+i*2.1;
        body.position.set(.17+Math.sin(t)*.75,.95+Math.sin(t*1.56)*.21,.73+Math.cos(t*.83)*.27);
        body.rotation.set(.10*Math.cos(t),Math.atan2(Math.cos(t)*.91,-Math.sin(t*.83)*.22),.20*Math.sin(t));
        wings.forEach((wing,k)=>wing.rotation.z=(k?1:-1)*(.25+.69*Math.sin(time*18+i)));
      });
    };
  }
  function gardenCard(root,redraw) {
    const pearl=mat(0xeaf1ed,.18,.43);
    plaque(root,5.55,3.28,.10,.17,pearl);
    const back=print(root,5.49,3.22,(c,w,h)=>{
      c.fillStyle='#f4f8f5';c.fillRect(0,0,w,h);
      c.fillStyle='#273d46';c.font='50px Georgia';c.fillText('Ruohan Zhang',78,115);
      c.font='92px Georgia, "Hiragino Sans GB", serif';c.fillText('张楉晗',75,285);
      c.fillStyle='#456159';c.font='37px sans-serif';c.fillText('AI 产品  /  数据分析',80,370);
      c.fillStyle='#b6c6be';c.fillRect(80,450,w-160,2);
      c.fillStyle='#243a42';c.font='42px Georgia';c.fillText('zrh2026rhz@163.com',80,h-85);
    });
    back.rotation.y=Math.PI;back.position.z=-.022;
    const front=print(root,5.49,3.22,(c,w,h)=>{
      c.fillStyle='#eef5f0';c.fillRect(0,0,w,h);
      const glow=c.createLinearGradient(0,0,w,h);glow.addColorStop(0,'#e3efe4');glow.addColorStop(1,'#f5f7fd');c.fillStyle=glow;c.fillRect(7,7,w-14,h-14);
      c.fillStyle='#22434b';c.font='84px Georgia, "Hiragino Sans GB", serif';c.fillText('张楉晗',56,h-115);
      c.font='34px Georgia';c.fillText('Ruohan Zhang',60,h-55);
      c.textAlign='right';c.font='27px sans-serif';c.fillText('AI 产品 · 数据分析',w-55,h-57);
    });
    front.position.z=.122;
    const lawn=group(root,0,.00,.13); lawn.rotation.x=Math.PI/2;
    const stone=mat(0xb2a796),water=mat(0x4b8c85,.28,.18);
    const wood=mat(0x735746);
    meadow(lawn,redraw);
    for(let i=0;i<13;i++){
      const x=.08+i*.188;
      box(lawn,[.171,.035,.22],[x,.077,.35-.12*x],stone).rotation.y=.14;
    }
    tree(lawn,1.18,-.51,1.62,1.18,29);
    tree(lawn,-1.65,-.59,1.16,.83,89);
    root.userData.wildlife=butterflies(lawn);
    const fountain=group(lawn,-.56,.07,-.04);
    cylinder(fountain,.54,.59,.07,[0,.06,0],stone);
    cylinder(fountain,.50,.50,.02,[0,.106,0],water);
    const profile=[[.15,.11],[.16,.13],[.13,.16],[.105,.175],[.115,.21],[.091,.24],[.077,.29],[.092,.33],[.124,.35],[.139,.375]];
    mesh(fountain,new T.LatheGeometry(profile.map(([r,h])=>new T.Vector2(r,h)),48),stone,0,0,0);
    cylinder(fountain,.32,.12,.10,[0,.42,0],stone);
    cylinder(fountain,.075,.075,.15,[0,.54,0],stone);
    cylinder(fountain,.17,.06,.07,[0,.65,0],stone);
    for(let i=0;i<11;i++){
      const a=i*Math.PI*2/11;
      curve(fountain,[[.29*Math.cos(a),.46,.29*Math.sin(a)],[.32*Math.cos(a),.36,.32*Math.sin(a)],[.33*Math.cos(a),.12,.33*Math.sin(a)]],.007,water);
    }
    for(let i=0;i<36;i++){
      const a=i*Math.PI/18;
      const fluting=ellipsoid(fountain,[.30*Math.cos(a),.421,.30*Math.sin(a)],[.019,.039,.010],stone);
      fluting.rotation.y=Math.PI/2-a;
    }
    for(const [radius,y] of [[.55,.091],[.315,.467],[.167,.69]]){
      const lip=mesh(fountain,new T.TorusGeometry(radius,.025,9,64),stone,0,y,0);lip.rotation.x=Math.PI/2;
    }
    const ripple=mat(0x9db9aa,.31,.28);
    for(const radius of [.23,.37,.44]){
      const ring=mesh(fountain,new T.TorusGeometry(radius,.005,5,64),ripple,0,.12,0);ring.rotation.x=Math.PI/2;
    }
    const bench=group(lawn,1.03,.14,.23);
    for(let i=0;i<3;i++)box(bench,[.68,.045,.047],[0,.08,i*.058],wood);
    for(let i=0;i<2;i++)box(bench,[.68,.053,.045],[0,.20+i*.065,-.022],wood);
    for(const side of [-1,1])box(bench,[.045,.19,.15],[side*.25,0,.04],mat(0x536762));
  }
  window.courtModels={gardenCard};
})();
