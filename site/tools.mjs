import { project, compose, inverse, pid, localization, latency, hsv, inHue, components, rad } from './models.mjs';

const mount=document.querySelector('#simulator');
const create=(name,props={})=>Object.assign(document.createElement(name),props);
const controls=create('div',{className:'controls'});
const results=create('div');
const legends=['#27a984','#e07427','#4389e4','#d14b78','#9266e7'];
const config={
  camera:[['hfov','Horizontal FOV (°)',20,150,70],['vfov','Vertical FOV (°)',20,140,52],['width','Width (px)',160,1920,640,16],['height','Height (px)',120,1080,480,8],['cameraHeight','Camera height (m)',0,2,0.45,.01],['pitch','Pitch up (°)',-60,60,5],['distance','Forward distance (m)',.1,6,2,.05],['lateral','Right offset (m)',-3,3,.5,.05],['targetHeight','Target height (m)',0,2,.35,.01]],
  pid:[['kp','Kp',0,.1,.025,.001],['ki','Ki',0,.1,0,.001],['kd','Kd',0,.1,.005,.001],['offset','Setpoint (°)',-90,90,30],['limit','Motor output cap',.05,1,.65,.05],['damping','Damping',0,6,2,.1],['inertia','Inertia',.4,4,1,.1],['noise','Noise amplitude (°)',0,5,0,.1],['delay','Vision delay (ms)',0,500,50,10],['hz','Control loop (Hz)',15,100,50]],
  frames:[['rx','Robot field x (m)',-3,3,.6,.05],['ry','Robot field y (m)',-3,3,-.8,.05],['rYaw','Robot yaw (°)',-180,180,20],['cx','Camera forward (m)',-.5,.5,.2,.01],['cy','Camera left (m)',-.5,.5,.1,.01],['cYaw','Camera yaw (°)',-180,180,0],['tx','Tag field x (m)',-3,3,1.6,.05],['ty','Tag field y (m)',-3,3,1.2,.05],['tYaw','Tag yaw (°)',-180,180,90]],
  hsv:[['low','Hue start (°)',0,359,345],['high','Hue end (°)',0,359,25],['sat','Minimum saturation (%)',0,100,45],['val','Minimum value (%)',0,100,35],['area','Minimum region (px)',1,500,20]],
  localization:[['noise','Vision noise amplitude (m)',0,1,.15,.01],['interval','Observation interval (0.1 s ticks)',1,25,8],['drift','Encoder drift (m/s)',-.2,.2,.09,.01],['gate','Outlier gate (m)',.05,2,.6,.05]],
  latency:[['target','Target velocity (m/s)',-2,2,1,.05],['robot','Robot velocity (m/s)',-2,2,.4,.05],['delay','Delay (ms)',0,650,240,10],['accel','Target acceleration (m/s²)',-.5,.5,0,.01],['estimate','Estimated target velocity (m/s)',-2,2,1,.05],['gain','Response gain',.1,6,2,.1]],
};
config.fusion=[...config.localization,['imu','IMU heading noise (°)',0,180,10]];
const params={};
const svgNS='http://www.w3.org/2000/svg';
function svg(tag,attrs={}) {
  const node=document.createElementNS(svgNS,tag);
  for(const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
  return node;
}
function graphic(label) {
  const node=svg('svg',{viewBox:'0 0 650 300',class:'visual',role:'img','aria-label':label});
  results.append(node);
  return node;
}
function readout(text) {
  results.append(create('p',{className:'readout',textContent:text}));
}
function chart(label,series) {
  const node=graphic(label);
  const pts=series.flatMap(([,v])=>v);
  const min=Math.min(0,...pts.map(([,y])=>y)), max=Math.max(min+0.01,...pts.map(([,y])=>y));
  const end=Math.max(1,...pts.map(([x])=>x));
  const scale=([x,y])=>[65+540*x/end,245-220*(y-min)/(max-min)];
  const line=(x1,y1,x2,y2)=>node.append(svg('line',{x1,y1,x2,y2,stroke:'currentColor',opacity:.25}));
  const labelAt=(x,y,text)=>{const el=svg('text',{x,y,fill:'currentColor','font-size':12});el.textContent=text;node.append(el);};
  for(let i=0;i<5;i++) {
    const y=min+(max-min)*i/4, [xPos,yPos]=scale([0,y]);
    line(xPos,yPos,605,yPos);
    labelAt(7,yPos+4,y.toFixed(2));
    labelAt(65+540*i/4,270,(end*i/4).toFixed(1)+' s');
  }
  series.forEach(([name,points,scatter],i)=>{
    const color=legends[i%legends.length];
    if(scatter) for(const point of points){const [cx,cy]=scale(point); node.append(svg('circle',{cx,cy,r:4,fill:color}));}
    else node.append(svg('polyline',{points:points.map(pt=>scale(pt).join(',')).join(' '),fill:'none',stroke:color,'stroke-width':3}));
  });
  const caption=create('ul');
  series.forEach(([name,points],i)=>{
    const item=create('li',{textContent:name + (points.length ? ' · latest ' + points.at(-1)[1].toFixed(3) : ' · no samples')});
    item.style.borderInlineStart='0.35rem solid '+legends[i%legends.length];
    item.style.paddingInlineStart='0.5rem';
    caption.append(item);
  });
  results.append(caption);
}
const fixed=n=>n.toFixed(2);
function redraw() {
  results.replaceChildren();
  switch(mount.dataset.tool) {
    case 'camera': {
      const value=project(params);
      const frame=graphic('Camera image bounds, optical axis and projected target');
      frame.append(svg('rect',{x:35,y:25,width:580,height:250,fill:'none',stroke:'currentColor'}));
      frame.append(svg('path',{d:'M315 150h20 M325 140v20',stroke:'currentColor'}));
      if (!value) {readout('Target is behind the image plane.');break;}
      const inside=value.x>=0 && value.x<=params.width && value.y>=0 && value.y<=params.height;
      if(inside) frame.append(svg('circle',{cx:35+580*value.x/params.width,cy:25+250*value.y/params.height,r:8,fill:legends[1]}));
      readout('Pixel ('+fixed(value.x)+', '+fixed(value.y)+') · '+(inside?'inside':'outside')+' FOV\nBearing right '+fixed(value.bearing)+'° · elevation up '+fixed(value.elevation)+'°');
      break;
    }
    case 'pid': {
      const model=pid(params);
      chart('Heading error in degrees',[['Heading error',model.errors]]);
      chart('Normalized motor command',[['Motor command',model.commands]]);
      readout('Overshoot '+fixed(model.overshoot)+'° · Settling (±2°) '+(model.settle===undefined?'outside run':fixed(model.settle)+' s')+' · Final error '+fixed(model.steady)+'°');
      break;
    }
    case 'frames': {
      const robot={x:params.rx,y:params.ry,yaw:params.rYaw};
      const extrinsics={x:params.cx,y:params.cy,yaw:params.cYaw};
      const tag={x:params.tx,y:params.ty,yaw:params.tYaw};
      const camera=compose(robot,extrinsics), relative=compose(inverse(camera),tag);
      const view=graphic('Top-down field showing robot, camera and tag axes');
      const point=({x,y})=>[325+42*x,150-42*y];
      const frame=(name,pose,i)=>{
        const [x,y]=point(pose), angle=rad(pose.yaw), color=legends[i];
        view.append(svg('circle',{cx:x,cy:y,r:5,fill:color}),svg('path',{d:'M'+x+' '+y+' l'+24*Math.cos(angle)+' '+(-24*Math.sin(angle))+' M'+x+' '+y+' l'+(-15*Math.sin(angle))+' '+(-15*Math.cos(angle)),stroke:color,'stroke-width':3,fill:'none'}));
        const text=svg('text',{x:x+9,y:y+(i%2?16:-8),fill:'currentColor','font-size':14});
        text.textContent=name;view.append(text);
      };
      frame('Field',{x:0,y:0,yaw:0},0);frame('Robot',robot,1);frame('Camera',camera,2);frame('Tag',tag,3);
      readout('Camera in field ('+fixed(camera.x)+', '+fixed(camera.y)+') m at '+fixed(camera.yaw)+'°\nTag in camera ('+fixed(relative.x)+', '+fixed(relative.y)+') m at '+fixed(relative.yaw)+'°');
      break;
    }
    case 'hsv': renderHSV(); break;
    case 'localization':
    case 'fusion': {
      const m=localization(params);
      chart('Field position in meters',[['Ground truth',m.truth],['Encoder-only',m.odometry],['Fused',m.fused],['AprilTag',m.vision,true],['Rejected',m.rejected,true]]);
      chart('Fused position error (m)',[['Position error',m.errors]]);
      if(mount.dataset.tool==='fusion') {
        chart('Position by estimator (m)',[['Ground truth',m.truth],['Naive averaging',m.average],['Uncertainty-weighted',m.fused]]);
        chart('IMU heading observation (degrees)',[['IMU heading',m.heading]]);
      }
      readout(m.vision.length+' observations accepted · '+m.rejected.length+' rejected · Final fused error '+fixed(m.errors.at(-1)[1])+' m');
      break;
    }
    case 'latency': {
      const m=latency(params);
      chart('Positions relative to the moving observation platform, in meters',[['Truth',m.truth],['Delayed',m.camera],['Predicted',m.compensated],['Raw controller',m.rawControl],['Predictive controller',m.compensatedControl]]);
      readout('Final raw measurement error '+fixed(m.camera.at(-1)[1]-m.truth.at(-1)[1])+' m · Predicted error '+fixed(m.compensated.at(-1)[1]-m.truth.at(-1)[1])+' m');
      break;
    }
  }
}
let source;
let imageRequest=0;
function sample(scene=0) {
  const canvas=create('canvas',{width:320,height:200});
  const ctx=canvas.getContext('2d');
  ctx.fillStyle=scene?'#b8a185':'#284049';ctx.fillRect(0,0,320,200);
  [[78,69,30,'#ec3628'],[191,128,34,'#bb3a29'],[250,54,26,'#eda626'],[61,155,19,'#7a291c'],[149,41,15,'#2ba38e']].forEach(([x,y,r,c])=>{
    ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();
  });
  return canvas;
}
function renderHSV() {
  const width=source.width, height=source.height;
  const row=create('div',{className:'image-grid'});
  const makeCanvas=title=>{
    const canvas=create('canvas',{width,height});
    canvas.setAttribute('aria-label',title);
    const figure=create('figure');
    figure.append(canvas,create('figcaption',{textContent:title}));
    row.append(figure);
    return canvas.getContext('2d');
  };
  const original=makeCanvas('Input'), filtered=makeCanvas('Segmentation mask'), boxes=makeCanvas('Region boundaries and boxes');
  original.drawImage(source,0,0);boxes.drawImage(source,0,0);
  const data=original.getImageData(0,0,width,height).data;
  const mask=new Uint8Array(width*height), image=filtered.createImageData(width,height);
  for(let i=0;i<mask.length;i++) {
    const [h,s,v]=hsv(data[4*i],data[4*i+1],data[4*i+2]);
    mask[i]=Number(data[4*i+3]>0 && inHue(h,params.low,params.high) && s>=params.sat && v>=params.val);
    image.data.fill(mask[i]*255,4*i,4*i+3); image.data[4*i+3]=255;
  }
  filtered.putImageData(image,0,0);
  const regions=components(mask,width,height,params.area);
  for(const r of regions) {
    boxes.fillStyle='#30ffbf';
    for(const index of r.edge) boxes.fillRect(index%width,Math.floor(index/width),1,1);
    boxes.strokeStyle='white';boxes.strokeRect(r.left-.5,r.top-.5,r.right-r.left+1,r.bottom-r.top+1);
  }
  results.append(row);
  readout(regions.length+' regions · OpenCV hue bins approximately '+Math.floor(params.low/2)+' to '+Math.floor(params.high/2)+' (0–179); use two ranges when hue wraps.');
}
for(const [key,text,min,max,value,step=1] of config[mount.dataset.tool]) {
  params[key]=value;
  const input=create('input',{type:'range',min,max,value,step});
  const span=create('span',{textContent:text+' · '+value});
  const label=create('label');label.append(span,input);controls.append(label);
  input.addEventListener('input',()=>{
    params[key]=Number(input.value);
    span.textContent=text+' · '+input.value;
    redraw();
  });
}
if(mount.dataset.tool==='hsv') {
  source=sample();
  const picker=create('select');
  for(const [index,name] of ['Dark practice surface','Bright practice surface'].entries()) picker.append(new Option(name,index));
  const sampleLabel=create('label',{textContent:'Synthetic sample'});sampleLabel.append(picker); controls.append(sampleLabel);
  picker.addEventListener('change',()=>{imageRequest++;source=sample(Number(picker.value));redraw();});
  const file=create('input',{type:'file',accept:'image/png,image/jpeg,image/webp'});
  const fileLabel=create('label',{textContent:'Local image'});fileLabel.append(file);controls.append(fileLabel);
  const fileStatus=create('p'); fileStatus.setAttribute('role','status');
  controls.append(fileStatus);
  file.addEventListener('change',async()=>{
    const selected=file.files[0], request=++imageRequest;
    if(!selected) return;
    try {
      const image=await createImageBitmap(selected);
      if(request!==imageRequest) {image.close();return;}
      const scale=Math.min(1,440/Math.max(image.width,image.height));
      source=create('canvas',{width:Math.max(1,Math.round(scale*image.width)),height:Math.max(1,Math.round(scale*image.height))});
      source.getContext('2d').drawImage(image,0,0,source.width,source.height);
      image.close();fileStatus.textContent='Image processed locally.';redraw();
    } catch {if(request===imageRequest) fileStatus.textContent='Choose a readable PNG, JPEG or WebP image.';}
  });
}
mount.append(controls,results);
redraw();
