import * as THREE from '../vendor/three-r180/three.module.js';
import {HDRLoader} from '../vendor/three-r180/HDRLoader.js';
import {RoundedBoxGeometry} from '../vendor/three-r180/RoundedBoxGeometry.js';
export {THREE as T};
export const reduced=matchMedia('(prefers-reduced-motion: reduce)');
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
export const mix=(a,b,t)=>a+(b-a)*t;
export function seeded(seed=1){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
export function group(parent,x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);parent?.add(g);return g}
export function part(parent,geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
export function material(color,{metalness=0,roughness=.7,...options}={}){return new THREE.MeshPhysicalMaterial({color,metalness,roughness,...options})}
const boxes=new Map(),spheres=new Map();
export function box(parent,x,y,z,w,h,d,mat,r=.04){const key=[w,h,d,r].join();if(!boxes.has(key))boxes.set(key,r?new RoundedBoxGeometry(w,h,d,5,Math.min(r,w/2,h/2,d/2)):new THREE.BoxGeometry(w,h,d));return part(parent,boxes.get(key),mat,x,y,z)}
export function oval(parent,x,y,z,sx,sy,sz,mat,segments=48){if(!spheres.has(segments))spheres.set(segments,new THREE.SphereGeometry(1,segments,Math.floor(segments*.7)));const m=part(parent,spheres.get(segments),mat,x,y,z);m.scale.set(sx,sy,sz);return m}
export function rod(parent,a,b,r,mat){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start),g=new THREE.CylinderGeometry(r,r,delta.length(),16);const m=part(parent,g,mat);m.position.copy(start.lerp(end,.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m}
export function tube(parent,points,r,mat,segments=32,radial=7){const p=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return part(parent,new THREE.TubeGeometry(p,segments,r,radial,false),mat)}
export function label(parent,{x=0,y=0,z=0,w=1,h=.2,draw}){const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));draw(c.getContext('2d'),c.width,c.height);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;const m=part(parent,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,toneMapped:false}),x,y,z);m.castShadow=m.receiveShadow=false;return m}
export function contactShadow(parent,x,y,z,w,d,opacity=.20){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(128,128,4,128,128,124);g.addColorStop(0,`rgba(38,48,35,${opacity})`);g.addColorStop(.5,`rgba(38,48,35,${opacity*.45})`);g.addColorStop(1,'rgba(38,48,35,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);const m=part(parent,new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}),x,y,z);m.rotation.x=-Math.PI/2;m.castShadow=m.receiveShadow=false;return m}
let hdrPromise;
function environment(renderer){if(!hdrPromise)hdrPromise=new HDRLoader().loadAsync(new URL('../assets/studio-small-08.hdr',import.meta.url).href);return hdrPromise.then(tex=>{const pm=new THREE.PMREMGenerator(renderer);const env=pm.fromEquirectangular(tex).texture;pm.dispose();return env})}
export class Stage{
 constructor(el,{span=3,width=0,target=[0,0,0],camera=[4,2.4,13],exposure=1,shadows=true}={}){
  this.el=el;this.span=span;this.fitWidth=width;this.visible=false;this.frame=0;this.target=new THREE.Vector3(...target);this.paused=reduced.matches;
  this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.AgXToneMapping;this.renderer.toneMappingExposure=exposure;this.renderer.shadowMap.enabled=shadows;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.setClearColor(0,0);this.renderer.domElement.setAttribute('aria-hidden','true');el.append(this.renderer.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-span,span,span,-span,.1,100);this.camera.position.set(...camera);this.camera.lookAt(this.target);this.root=group(this.scene);
  const hemi=new THREE.HemisphereLight('#fffdf4','#809080',1.4);this.scene.add(hemi);this.key=new THREE.DirectionalLight('#fff4df',3.2);this.key.position.set(-4,7,6);this.key.castShadow=shadows;this.key.shadow.mapSize.set(2048,2048);Object.assign(this.key.shadow.camera,{left:-5,right:5,top:6,bottom:-4,near:.1,far:22});this.key.shadow.radius=4;this.key.shadow.normalBias=.012;this.key.shadow.bias=-.00008;this.scene.add(this.key);const fill=new THREE.DirectionalLight('#dce6ff',.65);fill.position.set(5,2,-3);this.scene.add(fill);
  environment(this.renderer).then(env=>{this.scene.environment=env;this.scene.environmentIntensity=.45;this.request()}).catch(e=>console.warn('Environment lighting unavailable',e));
  new ResizeObserver(()=>this.size()).observe(el);new IntersectionObserver(([entry])=>{this.visible=entry.isIntersecting;if(this.visible)this.request()},{rootMargin:'120px'}).observe(el);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.request()});this.size();
 }
 size(){const w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);const half=Math.max(this.span,this.fitWidth*h/w/2);this.camera.left=-half*w/h;this.camera.right=-this.camera.left;this.camera.top=half;this.camera.bottom=-half;this.camera.updateProjectionMatrix();this.draw()}
 draw(){this.renderer.render(this.scene,this.camera)}
 request(){if(this.frame||document.hidden||(!this.visible&&!this.animating))return;this.frame=requestAnimationFrame(now=>{this.frame=0;this.update?.(now);this.draw();if(!this.paused||this.animating)this.request()})}
 setAngle(yaw=0,pitch=0){this.root.rotation.y=yaw;this.root.rotation.x=pitch;this.draw()}
 drag({limit=.65}={}){let start;this.el.addEventListener('pointerdown',e=>{if(e.button!==0)return;start={x:e.clientX,y:e.clientY,a:this.root.rotation.y,b:this.root.rotation.x};this.el.setPointerCapture(e.pointerId)});this.el.addEventListener('pointermove',e=>{if(!start)return;this.root.rotation.y=clamp(start.a+(e.clientX-start.x)*.004,-limit,limit);this.root.rotation.x=clamp(start.b+(e.clientY-start.y)*.003,-.28,.28);this.draw()});this.el.addEventListener('lostpointercapture',()=>start=null)}
}
