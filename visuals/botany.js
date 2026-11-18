import {T,group,part,material,tube,clamp,smooth,mix} from './scene.js?v=1118h';
// A single connected tube with a five-lobed, everted lip. Rings retain their
// topology and attachment point through the whole opening motion.
export function corollaPoint(u,a,open){
 const flare=smooth((u-.43)/.57),lip=smooth((u-.77)/.23);
 const lobes=.5+.5*Math.cos(5*a+.11*Math.sin(a));
 const r=mix((.027+.075*Math.sin(Math.PI*u*.86))*(1-.97*smooth((u-.72)/.28)),.027+.070*u+.125*flare,open);
 const tissue=.0018*Math.sin(a*31+u*2)*Math.sin(Math.PI*u);
 const radius=r*(1+open*lip*(.13*lobes+.025*Math.sin(3*a)))+tissue*(.35+.65*open);
 const fold=(1-open)*.012*Math.cos(5*a)*Math.sin(Math.PI*u);
 return [radius*Math.cos(a)+.035*u*u,radius*Math.sin(a),.64*u-.07*open*lip*lip*(.6+.4*lobes)+fold];
}
function corolla(parent,scale,rotation){
 const rows=44,cols=80,g=new T.BufferGeometry(),pos=new Float32Array((rows+1)*(cols+1)*3),uv=[],colors=[],indices=[];
 const throat=new T.Color('#665188'),edge=new T.Color('#a28bc5');
 for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){
  const u=i/rows,a=j/cols*Math.PI*2;uv.push(j/cols,u);
  const c=throat.clone().lerp(edge,smooth(u));const tissue=1+.025*Math.sin(a*31+u*3)+.016*Math.sin(a*57-u*4);colors.push(c.r*tissue,c.g*tissue,c.b*tissue);
  if(i<rows&&j<cols){const n=i*(cols+1)+j,b=n+cols+1;indices.push(n,n+1,b,n+1,b+1,b)}
 }
 g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);
 const m=part(parent,g,material('#ffffff',{vertexColors:true,roughness:.76,metalness:0,side:T.DoubleSide,specularIntensity:.16,transmission:0,sheen:.14,sheenColor:new T.Color('#c4b5da')}));m.scale.setScalar(scale);m.rotation.set(...rotation);
 const cap=part(m,new T.CircleGeometry(.027,32),material('#544366',{roughness:.94,side:T.DoubleSide}),0,0,.002);cap.castShadow=false;
 let previous=-1;const set=amount=>{if(amount===previous)return;previous=amount;for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){const p=corollaPoint(i/rows,j/cols*Math.PI*2,amount),k=(i*(cols+1)+j)*3;pos[k]=p[0];pos[k+1]=p[1];pos[k+2]=p[2]}g.attributes.position.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere()};set(0);return {mesh:m,set};
}
function leaflet(parent,start,end,width,mat){
 const a=new T.Vector3(...start),b=new T.Vector3(...end),d=b.clone().sub(a),side=new T.Vector3(-d.y,d.x,.02).normalize(),p=[],ix=[];
 for(let i=0;i<=8;i++){const u=i/8,c=a.clone().lerp(b,u);c.z+=.018*Math.sin(Math.PI*u);const w=width*Math.pow(Math.sin(Math.PI*u),.8);for(const s of [-1,0,1])p.push(c.x+side.x*w*s,c.y+side.y*w*s,c.z-Math.abs(s)*.01*Math.sin(Math.PI*u));if(i<8){const n=i*3;ix.push(n,n+3,n+1,n+1,n+3,n+4,n+1,n+4,n+2,n+2,n+4,n+5)}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();part(parent,g,mat);
}
export function createBranch(parent){
 const root=group(parent),wood=material('#756c59',{roughness:.94}),leaf=material('#61745b',{roughness:.86,side:T.DoubleSide,specularIntensity:.12}),fine=material('#85927a',{roughness:.92});
 tube(root,[[-.54,-.96,-.14],[-.22,-.4,-.13],[.04,.18,-.12],[.20,.75,-.13]],.014,wood);
 // Bipinnate foliage: rachis, pinnae, paired leaflets.
 for(const [x,y,dir] of [[-.29,-.53,-1],[-.08,-.02,1],[.13,.42,-1]]){
  const leafRoot=group(root,x,y,-.13);leafRoot.rotation.z=dir*.56;
  tube(leafRoot,[[0,0,0],[dir*.28,.14,0],[dir*.68,.30,-.01]],.005,wood);
  for(let k=1;k<=6;k++)for(const s of [-1,1]){
   const px=dir*k*.09,py=k*.04,tip=[px+dir*.055,py+s*(.17-k*.01),.012];
   tube(leafRoot,[[px,py,0],tip],.0025,fine,8,5);
   for(let j=1;j<=5;j++){const t=j/6,c=[mix(px,tip[0],t),mix(py,tip[1],t),.015];for(const sign of [-1,1])leaflet(leafRoot,c,[c[0]+sign*.053,c[1]+s*.025,c[2]+.009],.013,j%2?leaf:fine)}
  }
 }
 const blooms=[];
 for(const [x,y,z,scale,rx,ry,rz] of [[-.30,-.25,.02,1.12,-.30,-.72,-.3],[.22,.04,.06,1.05,.12,.24,.15],[-.05,.42,.05,.94,-.35,-.60,-.3],[.23,.70,-.02,.79,.18,.70,.3],[.47,.30,-.08,.73,-.2,.90,-.2]]){
  tube(root,[[x*.25,y-.13,-.13],[x*.8,y-.02,-.07],[x,y,z]],.007,wood,18,7);
  const anchor=group(root,x,y,z),flower=corolla(anchor,scale,[rx,ry,rz]);blooms.push(flower);
 }
 let values=blooms.map(()=>0),target=0,last=0,start=0,from=[...values];
 const set=value=>{values=values.map(()=>clamp(value));blooms.forEach((f,i)=>f.set(values[i]));target=clamp(value);from=[...values];start=0};
 const move=(value,now,instant=false)=>{if(instant){set(value);return}from=[...values];target=value;start=now;last=now};
 const update=now=>{if(!start)return false;last=now;let moving=false;blooms.forEach((f,i)=>{const t=clamp((now-start-i*150)/2000);values[i]=mix(from[i],target,smooth(t));f.set(values[i]);if(t<1)moving=true});if(!moving)start=0;return moving};
 return {root,blooms,set,move,update,get target(){return target},get values(){return [...values]},get moving(){return !!start}};
}
