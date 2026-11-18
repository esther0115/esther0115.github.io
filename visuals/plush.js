import {T,group,part,oval,material,tube,label,seeded,clamp} from './scene.js?v=1118e';
// Share the loaded image with the linear bump texture only after decoding.
const pileBump=new T.Texture();
const furTexture=new T.TextureLoader().load(new URL('../assets/textiles/ivory-short-pile.png',import.meta.url).href,tex=>{pileBump.image=tex.image;pileBump.needsUpdate=true;});furTexture.colorSpace=T.SRGBColorSpace;furTexture.wrapS=furTexture.wrapT=T.RepeatWrapping;furTexture.repeat.set(2.7,2.7);furTexture.anisotropy=8;
pileBump.colorSpace=T.NoColorSpace;pileBump.wrapS=pileBump.wrapT=T.RepeatWrapping;pileBump.repeat.set(2.7,2.7);pileBump.anisotropy=8;
const eyeMat=material('#151a17',{roughness:.2,specularIntensity:.7});const stitchMat=material('#795f53',{roughness:.98,specularIntensity:.05});
function fabric(color,short=false){return material(color,{roughness:.98,metalness:0,map:furTexture,bumpMap:pileBump,bumpScale:short?.003:.007,sheen:1,sheenColor:new T.Color(color).lerp(new T.Color('#fff8e9'),.3),sheenRoughness:.8,specularIntensity:.06,envMapIntensity:.18})}
function stuffedGeometry({pear=0,flat=0,segments=64}={}){const geo=new T.SphereGeometry(1,segments,Math.floor(segments*.7)),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),width=1-pear*y;p.setXYZ(i,x*width,y<-.8?y+flat*Math.pow(-y-.8,1.3):y,z*(1-pear*.25*y));}geo.computeVertexNormals();return geo}
// Sculpt the muzzle into the head surface, with a soft cheek transition.
// This removes the old separate oval cheek pads and their hard intersection.
function headGeometry(){const geo=stuffedGeometry(),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const front=clamp(z*4),cheek=.22*Math.exp(-Math.pow((Math.abs(x)-.28)/.42,2)-Math.pow((y+.28)/.33,2));p.setZ(i,z+cheek*front)}geo.computeVertexNormals();return geo}
// Weighted surface sampling attaches each tapered fibre to a real surface.
function fibres(mesh,{count=3000,length=.017,color='#d5c3aa',seed=1}={}){
 const g=mesh.geometry,index=g.index?.array,p=g.attributes.position,n=g.attributes.normal,triangles=index?index.length/3:p.count/3,cdf=new Float32Array(triangles);let total=0;const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),ab=new T.Vector3(),ac=new T.Vector3();
 for(let t=0;t<triangles;t++){const i=t*3;a.fromBufferAttribute(p,index?index[i]:i);b.fromBufferAttribute(p,index?index[i+1]:i+1);c.fromBufferAttribute(p,index?index[i+2]:i+2);ab.subVectors(b,a);ac.subVectors(c,a);total+=ab.cross(ac).length()/2;cdf[t]=total;}
 mesh.updateMatrix();const transform=mesh.matrix.clone(),normalMatrix=new T.Matrix3().getNormalMatrix(transform),rand=seeded(seed),vs=[],ns=[],colors=[],ix=[],base=new T.Color(color),root=new T.Vector3(),normal=new T.Vector3(),groom=new T.Vector3(),side=new T.Vector3(),offset=new T.Vector3(),na=new T.Vector3(),nb=new T.Vector3(),nc=new T.Vector3();
 for(let k=0;k<count;k++){
  const pick=rand()*total;let low=0,high=triangles-1;while(low<high){const mid=(low+high)>>1;if(cdf[mid]<pick)low=mid+1;else high=mid;}const i=low*3,ia=index?index[i]:i,ib=index?index[i+1]:i+1,ic=index?index[i+2]:i+2;let u=Math.sqrt(rand()),v=rand(),wa=1-u,wb=u*(1-v),wc=u*v;
  a.fromBufferAttribute(p,ia);b.fromBufferAttribute(p,ib);c.fromBufferAttribute(p,ic);root.copy(a).multiplyScalar(wa).addScaledVector(b,wb).addScaledVector(c,wc).applyMatrix4(transform);na.fromBufferAttribute(n,ia);nb.fromBufferAttribute(n,ib);nc.fromBufferAttribute(n,ic);normal.copy(na).multiplyScalar(wa).addScaledVector(nb,wb).addScaledVector(nc,wc).applyNormalMatrix(normalMatrix);
  groom.set(.12,-1,.16).addScaledVector(normal,-normal.dot(new T.Vector3(.12,-1,.16)));if(groom.lengthSq()<.001)groom.set(1,0,0);groom.normalize();side.crossVectors(normal,groom).normalize();const angle=rand()*Math.PI*2;side.applyAxisAngle(normal,angle);const len=length*(.68+rand()*.44),width=.00072*(.7+rand()*.5),tone=.97+rand()*.10,start=vs.length/3;
  for(let s=0;s<4;s++){const t=s/3,w=width*(1-t*t);offset.copy(root).addScaledVector(normal,.0008+len*.58*t).addScaledVector(groom,len*.9*t*t);const shade=tone*(.95+.07*t);for(const sign of [-1,1]){vs.push(offset.x+side.x*w*sign,offset.y+side.y*w*sign,offset.z+side.z*w*sign);ns.push(normal.x,normal.y,normal.z);colors.push(base.r*shade,base.g*shade,base.b*shade)}}
  for(let s=0;s<3;s++){const j=start+s*2;ix.push(j,j+1,j+2,j+1,j+3,j+2)}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vs,3));geo.setAttribute('normal',new T.Float32BufferAttribute(ns,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(ix);const mat=new T.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,vertexColors:true,side:T.DoubleSide,envMapIntensity:.12});const hair=new T.Mesh(geo,mat);mesh.parent.add(hair);hair.castShadow=false;hair.receiveShadow=true;hair.frustumCulled=false;return hair;
}
function earGeometry(side,variant=0,inner=false){
 const path=new T.CatmullRomCurve3([new T.Vector3(side*.22,1.51,-.015),new T.Vector3(side*(.40+variant*.015),1.28,.015),new T.Vector3(side*(.48+variant*.02),.94,.10),new T.Vector3(side*(.43+variant*.02),.66,.16)]),rows=48,cols=32,vs=[],uv=[],ix=[];
 for(let i=0;i<=rows;i++){const u=i/rows,t=inner?.13+u*.77:u,center=path.getPoint(t),tangent=path.getTangent(t),across=new T.Vector3(0,0,1).cross(tangent).normalize(),front=tangent.clone().cross(across).normalize(),rad=Math.pow(Math.max(.00001,Math.sin(Math.PI*t)),.4),width=(.145+variant*.004)*rad,thick=.062*rad;
  for(let j=0;j<=cols;j++){const a=j/cols*Math.PI*2;if(inner){const v=j/cols*2-1;const point=center.clone().addScaledVector(across,v*width*.68).addScaledVector(front,thick*Math.sqrt(Math.max(.0,1-v*v*.46))+.003);vs.push(point.x,point.y,point.z)}else{const point=center.clone().addScaledVector(across,Math.cos(a)*width).addScaledVector(front,Math.sin(a)*thick);vs.push(point.x,point.y,point.z)}uv.push(j/cols,u)}
 }
 for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;if(inner)ix.push(a,b,a+1,a+1,b,b+1);else ix.push(a,a+1,b,a+1,b+1,b)}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vs,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();return geo;
}
export const bunnyPalette=[
 {color:'#d9c8ab',inner:'#e5cbbd',accent:'#8d7b9d'},
 {color:'#9bb2b5',inner:'#c4d2cc',accent:'#4e6b73'},
 {color:'#cba8aa',inner:'#e4c6bb',accent:'#8e6877'},
 {color:'#bd9874',inner:'#dfc4a7',accent:'#866e4e'},
 {color:'#a3b0a0',inner:'#c5cbb9',accent:'#627b5f'},
 {color:'#baa991',inner:'#d9c5af',accent:'#687858'},
 {color:'#b0b4b3',inner:'#d0d2cb',accent:'#687786'},
 {color:'#b9a9c5',inner:'#d6c8d8',accent:'#79648b'},
 {color:'#e5decf',inner:'#ecdbd1',accent:'#8d7b9d'}
];
export function createBunny(parent,{index=0,quality=1,seed=37}={}){
 const root=group(parent),bodyGroup=group(root),palette=bunnyPalette[index%bunnyPalette.length],coat=fabric(palette.color),cream=fabric(new T.Color(palette.color).lerp(new T.Color('#f2e5cf'),.24)),inside=fabric(palette.inner,true),parts=[],ears=[],density=Math.max(.2,quality)*1.65;
 function stuffed(geo,mat,x,y,z,sx,sy,sz,count,len=.017){const m=part(bodyGroup,geo,mat,x,y,z);m.scale.set(sx,sy,sz);parts.push([m,count,len]);return m}
 const body=stuffed(stuffedGeometry({pear:.18,flat:.3}),coat,0,.68,-.02,.33,.48,.275,4300);
 stuffed(headGeometry(),coat,0,1.31,.05,.34,.315,.30,9200,.018);

 for(const side of [-1,1]){
  const arm=stuffed(stuffedGeometry(),coat,side*.343,.70,.08,.108,.32,.12,950);arm.rotation.z=side*.10;
  const foot=stuffed(stuffedGeometry({flat:.5}),coat,side*.225,.255,.25,.168,.245,.22,1400);foot.rotation.x=-.28;foot.rotation.z=-side*.13;
 }
 stuffed(stuffedGeometry(),cream,0,.47,-.295,.14,.14,.13,650,.022);
 for(const side of [-1,1]){
  const pivot=group(bodyGroup,side*.22,1.51,-.015),mesh=part(pivot,earGeometry(side,index%3),coat);mesh.position.set(-side*.22,-1.51,.015);fibres(mesh,{count:Math.round(4200*density),length:.020,color:palette.color,seed:seed+side*17});const patch=part(pivot,earGeometry(side,index%3,true),inside);patch.position.copy(mesh.position);patch.material.side=T.DoubleSide;ears.push(pivot);
 }
 for(let i=0;i<parts.length;i++){const [m,count,len]=parts[i];fibres(m,{count:Math.round(count*density),length:len,color:m.material===cream?'#'+new T.Color(palette.color).lerp(new T.Color('#f2e5cf'),.24).getHexString():palette.color,seed:seed+i*61})}
 for(const side of [-1,1]){oval(bodyGroup,side*.139,1.34,.337,.023,.028,.018,eyeMat,32);}
 const noseShape=new T.Shape();noseShape.moveTo(-.055,.018);noseShape.quadraticCurveTo(0,.038,.055,.018);noseShape.quadraticCurveTo(.047,-.01,0,-.045);noseShape.quadraticCurveTo(-.047,-.01,-.055,.018);const nose=part(bodyGroup,new T.ExtrudeGeometry(noseShape,{depth:.018,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:3,curveSegments:12}),material('#c19b91',{roughness:.95,specularIntensity:.04}),0,1.245,.399);
 tube(bodyGroup,[[0,1.206,.382],[0,1.18,.371],[-.027,1.16,.361]],.0025,stitchMat);tube(bodyGroup,[[0,1.18,.371],[.027,1.16,.361]],.0025,stitchMat);
 // Small fabric loop and woven number tag; no hard metallic badge.
 const tag=group(bodyGroup,.296,.55,.13);tag.rotation.z=-.12;const linen=material('#e9dfc9',{roughness:1,specularIntensity:.04});part(tag,new T.BoxGeometry(.105,.14,.007),linen);label(tag,{z:.005,w:.09,h:.12,draw(c,w,h){c.fillStyle=palette.accent;c.textAlign='center';c.font='500 '+h*.38+'px Georgia';c.fillText(String(index+1).padStart(2,'0'),w/2,h*.64)}});
 if(index===1||index===6){const scarf=material(palette.accent,{roughness:1,sheen:.7,specularIntensity:.03});const collar=part(bodyGroup,new T.TorusGeometry(.217,.033,12,64),scarf,0,1.015,.04);collar.rotation.x=Math.PI/2;const end=part(bodyGroup,new T.BoxGeometry(.095,.26,.018),scarf,.10,.89,.282);end.rotation.z=-.16;}
 root.userData.ears=ears;root.userData.body=body;root.userData.tick=(time,lift=0)=>{for(let i=0;i<ears.length;i++)ears[i].rotation.z=(i?1:-1)*(Math.sin(time*.85+i+index)*.012+lift*.075);body.scale.x=.33*(1-lift*.018)};root.userData.palette=palette;return root;
}
