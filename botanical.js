/* Botanical detail library. Photogrammetry: Poly Haven, CC0.
   Jacaranda geometry is original and follows the trumpet corolla and pinnate
   foliage reference recorded in ASSET-SOURCES.md. */
(() => {
 const T=window.THREE;if(!T)return;
 const modelPromises=new Map(),textureCache=new Map();
 const m=(c,r=.65)=>new T.MeshStandardMaterial({color:new T.Color(c).convertSRGBToLinear(),roughness:r,side:T.DoubleSide});
 const wood=m('#786d54'),leaf=m('#688578');
 function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g}
 function mesh(parent,geo,mat){const g=new T.Mesh(geo,mat);g.castShadow=true;g.receiveShadow=true;parent.add(g);return g}
 function curve(parent,ps,r,mat){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(ps.map(p=>new T.Vector3(...p))),14,r,6,false),mat)}
 function instance(parent,geometry,items,mat){const batch=new T.InstancedMesh(geometry,mat,items.length),d=new T.Object3D();items.forEach((it,i)=>{d.position.copy(it.p);d.quaternion.copy(it.q||new T.Quaternion());d.scale.setScalar(it.s||1);d.updateMatrix();batch.setMatrixAt(i,d.matrix);if(it.c)batch.setColorAt(i,new T.Color(it.c).convertSRGBToLinear())});batch.castShadow=true;batch.receiveShadow=true;parent.add(batch);return batch}
 let bellGeo,leafGeo;
 function trumpet(){
  if(bellGeo)return bellGeo;const verts=[],uv=[],idx=[],rows=13,cols=30;
  for(let i=0;i<=rows;i++){const u=i/rows;for(let j=0;j<=cols;j++){const a=j/cols*Math.PI*2,r=.018+.024*u+.068*Math.pow(u,5),edge=.014*Math.cos(a*5)*Math.pow(u,8);verts.push(Math.cos(a)*(r+edge),u*.265+.02*Math.cos(a*5)*Math.pow(u,9),Math.sin(a)*(r+edge));uv.push(j/cols,u)}}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;idx.push(a,b,a+1,a+1,b,b+1)}
  bellGeo=new T.BufferGeometry();bellGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));bellGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));bellGeo.setIndex(idx);bellGeo.computeVertexNormals();return bellGeo;
 }
 function leaflet(){
  if(leafGeo)return leafGeo;const vs=[],uv=[],ix=[];const rows=9,cols=4;
  for(let i=0;i<=rows;i++){const u=i/rows,w=Math.pow(Math.sin(u*Math.PI),.8)*.033;for(let j=0;j<=cols;j++){const v=j/cols*2-1;vs.push(v*w,.14*u,.012*Math.sin(u*Math.PI)+Math.abs(v)*.013);uv.push(j/cols,u)}}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;ix.push(a,b,a+1,a+1,b,b+1)}
  leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute(vs,3));leafGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));leafGeo.setIndex(ix);leafGeo.computeVertexNormals();return leafGeo;
 }
 function jacaranda(parent,{scale=1,seed=21}={}){
  const g=group(parent);g.scale.setScalar(scale);let rng=seed;const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};const flowers=[],leaves=[];
  curve(g,[[0,0,0],[.02,.42,-.03],[-.08,.88,.01],[.06,1.38,-.03]],.018,wood);
  for(let k=0;k<9;k++){
   const angle=k*2.399,y=.38+k*.095,reach=.25+rand()*.18;const end=[Math.cos(angle)*reach,y+.18+rand()*.12,Math.sin(angle)*reach*.6];curve(g,[[0,y,0],[end[0]*.5,y+.13,end[2]*.4],end],.007,wood);
   for(let j=0;j<9;j++){
    const a=j*2.4,at=new T.Vector3(end[0]+Math.cos(a)*(.04+rand()*.11),end[1]+(rand()-.5)*.21,end[2]+Math.sin(a)*.09);
    const down=new T.Vector3(Math.cos(a)*.5,-.5-rand()*.4,.25+Math.sin(a)*.3).normalize();const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),down);
    flowers.push({p:at,q,s:.67+rand()*.32,c:['#a290bf','#8c78b2','#aa99c6','#b4a5d0','#9283b5'][j%5]});
   }
   if(k%2===0)for(let f=0;f<2;f++){
    const start=new T.Vector3(end[0]*.6,y+.09,end[2]*.6);const a=angle+f*1.1;
    for(let l=0;l<7;l++)for(const side of [-1,1]){
     const at=start.clone().add(new T.Vector3(Math.cos(a)*l*.038, l*.011,Math.sin(a)*l*.038));
     const direction=new T.Vector3(Math.cos(a+side*1.0),.38,Math.sin(a+side*1.0)).normalize();
     leaves.push({p:at,q:new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),direction),s:1-l*.08,c:l%2?'#7a957c':'#657f6d'});
    }
   }
  }
  instance(g,trumpet(),flowers,new T.MeshStandardMaterial({roughness:.64,metalness:.02,side:T.DoubleSide}));instance(g,leaflet(),leaves,new T.MeshStandardMaterial({roughness:.7,side:T.DoubleSide}));
  return g;
 }
 function loadModel(name){
  if(!modelPromises.has(name))modelPromises.set(name,new Promise((resolve,reject)=>new T.GLTFLoader().load('assets/'+name+'/'+name+'.gltf',gltf=>resolve(gltf.scene),undefined,reject)));
  return modelPromises.get(name);
 }
 function place(parent,name,{height=.8,x=0,y=0,z=0,rotation=0}={}){
  const anchor=group(parent,x,y,z);anchor.rotation.y=rotation;
  loadModel(name).then(template=>{
   const model=template.clone(true),bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
   const scale=height/size.y;model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
   model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const ms=Array.isArray(o.material)?o.material:[o.material];for(const mat of ms){if(mat.map)mat.map.anisotropy=4;mat.envMapIntensity=.45}}});anchor.add(model);window.dispatchEvent(new Event('botanyready'));
  }).catch(error=>console.warn('Plant asset unavailable:',name,error));return anchor;
 }
 let hdri;
 function light(renderer){
  if(!T.RGBELoader)return Promise.resolve(null);
  if(!hdri)hdri=new Promise((resolve,reject)=>new T.RGBELoader().setDataType(T.UnsignedByteType).load('assets/studio-small-08.hdr',resolve,undefined,reject));
  return hdri.then(tex=>{const pm=new T.PMREMGenerator(renderer);pm.compileEquirectangularShader();const env=pm.fromEquirectangular(tex).texture;pm.dispose();return env});
 }
 window.botanicalAssets={place,jacaranda,light};
 // Small, peripheral specimens, with no plants over data or control hotspots.
 const models=window.portfolioModels;if(!models)return;
 for(const [key,settings] of Object.entries({
  orders:{x:-1.80,y:.01,z:.85,height:.59,rotation:.7},
  sale:{x:1.87,y:.015,z:-.85,height:.55,rotation:1.2},
  review:{x:-1.90,y:.015,z:-.83,height:.52,rotation:.4},
  reading:{x:1.84,y:.015,z:.73,height:.57,rotation:.3}
 })){
  const original=models[key];models[key]=(root,state)=>{const controls=original(root,state);place(root,'potted_plant_02',settings);return controls};
 }
 const cafe=models.cafe;models.cafe=(root,state)=>{const controls=cafe(root,state);const branch=jacaranda(root,{scale:.51});branch.position.set(1.66,.20,.27);branch.rotation.y=.4;return controls};
})();
