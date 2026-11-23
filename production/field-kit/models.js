import * as T from './three.module.min.js';
const wrap=document.querySelector('.viewer'), kind=wrap.dataset.model;
function start(){
 const renderer=new T.WebGLRenderer({canvas:wrap.querySelector('canvas'),alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 const scene=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.1,50),model=new T.Group();
 scene.add(model,new T.HemisphereLight(0xf9fff0,0x617467,2.4));
 const key=new T.DirectionalLight(0xffefd4,3);key.position.set(2,4,5);scene.add(key);
 const rim=new T.DirectionalLight(0xb6e9df,2);rim.position.set(-3,1,-3);scene.add(rim);
 const silver=0x9baaa8,black=0x202925,glass=0x477c79,accent=0xc2dc91;
 function mesh(geometry,color,x,y,z){const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.42,metalness:.28}));m.position.set(x,y,z);model.add(m);return m}
 function box(w,h,d,x,y,z,c){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z)}
 function ball(x,y,z,a,b,c,col){let m=mesh(new T.SphereGeometry(1,32,24),col,x,y,z);m.scale.set(a,b,c);return m}
 function rod(a,b,r,c){let v=new T.Vector3(...a),u=new T.Vector3(...b),delta=u.clone().sub(v),mid=v.clone().add(u).multiplyScalar(.5);let m=mesh(new T.CylinderGeometry(r,r,delta.length(),18),c,mid.x,mid.y,mid.z);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m}
 if(kind.includes('iphone')){box(1.05,2.05,.13,0,0,0,silver);box(.98,1.94,.02,0,0,.08,glass);box(.29,.06,.02,0,.88,.1,black);box(.49,.48,.08,-.23,.71,-.09,silver);for(const [x,y] of [[-.34,.81],[-.12,.70],[-.34,.59]])ball(x,y,-.15,.084,.084,.036,black);if(kind==='old-iphone')model.rotation.z=Math.PI/2}
 if(kind==='laptop'){box(2.35,.1,1.5,0,-.56,.1,silver);box(2.32,1.43,.09,0,.17,-.59,silver);box(2.18,1.28,.025,0,.18,-.53,glass);box(.74,.014,.36,0,-.50,.54,0x778883);for(let row=0;row<4;row++)for(let i=0;i<12;i++)box(.144,.024,.14,(i-5.5)*.171,-.49,-.37+row*.17,black);for(let i=0;i<5;i++)box(1.48-i*.14,.04,.014,-.13,.55-i*.16,-.51,i%2?accent:silver)}
 if(kind==='mouse'){ball(0,0,0,.60,.38,.92,silver);box(.024,.05,.59,0,.31,-.31,black);ball(0,.36,-.27,.065,.09,.16,black)}
 if(kind==='logitech-keypad'){box(1.6,.28,1.6,0,-.1,0,black);for(let i=0;i<9;i++){let x=(i%3-1)*.46,z=(Math.floor(i/3)-1)*.46;box(.37,.12,.37,x,.11,z,silver);box(.30,.018,.29,x,.18,z,[0x72c2b6,0xc7df85,0xdba16a][i%3])}}
 if(kind==='camera-stand'){rod([0,-.78,0],[0,1.15,0],.055,silver);for(let i=0;i<3;i++){let a=i*2*Math.PI/3;rod([0,-.30,0],[Math.sin(a)*.89,-1.12,Math.cos(a)*.89],.05,black)}box(.56,.14,.34,0,1.14,0,black);box(.09,.31,.2,-.24,1.29,0,black);box(.09,.31,.2,.24,1.29,0,black)}
 if(kind==='dji-osmo3'){box(.42,1.28,.36,0,-.32,0,black);box(.43,.55,.04,0,.02,.2,glass);ball(0,-.37,.2,.07,.07,.025,accent);rod([0,.30,0],[.32,.55,0],.095,silver);rod([.32,.55,0],[.32,.89,0],.08,black);box(.52,.42,.37,.06,.87,0,black);ball(.04,.88,.21,.135,.135,.05,glass)}
 const bounds=new T.Box3().setFromObject(model),center=bounds.getCenter(new T.Vector3());const pivot=new T.Group();model.position.sub(center);pivot.add(model);scene.add(pivot);cam.position.set(0,2.1,4.65);cam.lookAt(0,0,0);
 const deck=mesh=>scene.add(mesh);const ring=new T.Mesh(new T.TorusGeometry(1.47,.012,8,88),new T.MeshBasicMaterial({color:0x79947a}));ring.rotation.x=Math.PI/2;ring.position.y=-bounds.getSize(new T.Vector3()).y/2-.12;deck(ring);
 let spin=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=null,angle=.35;
 const spinButton=document.querySelector('#spin');function sync(){spinButton.textContent=spin?'Pause rotation':'Rotate model'}sync();spinButton.onclick=()=>{spin=!spin;sync()};
 for(const [id,dir] of [['turnL',-1],['turnR',1]])document.getElementById(id).onclick=()=>{angle+=dir*Math.PI/6};
 const c=renderer.domElement;c.onpointerdown=e=>{last=e.clientX;c.setPointerCapture(e.pointerId)};c.onpointermove=e=>{if(last!==null){angle+=(e.clientX-last)*.016;last=e.clientX}};c.onlostpointercapture=c.onpointerup=()=>last=null;
 new ResizeObserver(()=>{const {width,height}=wrap.getBoundingClientRect();renderer.setSize(width,height,false);cam.aspect=width/height;cam.updateProjectionMatrix()}).observe(wrap);
 wrap.querySelector('.fallback').hidden=true;wrap.querySelector('.controls').hidden=false;
 let prev=performance.now();renderer.setAnimationLoop(now=>{if(spin&&last===null)angle+=Math.min(now-prev,80)*.00046;prev=now;pivot.rotation.y=angle;renderer.render(scene,cam)});
}
try{start()}catch{wrap.querySelector('canvas').hidden=true}
