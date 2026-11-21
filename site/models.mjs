export const rad = degrees => degrees * Math.PI / 180;
export const deg = radians => radians * 180 / Math.PI;
export const clamp = (value,lo,hi) => Math.min(hi,Math.max(lo,value));

export function pixelFocalLength(sizePx, fieldOfViewDeg) {
  return (sizePx / 2) / Math.tan(rad(fieldOfViewDeg / 2));
}

export function project({hfov,vfov,width,height,cameraHeight,pitch,distance,lateral,targetHeight}) {
  const angle = rad(pitch), up = targetHeight-cameraHeight;
  const z = distance*Math.cos(angle)+up*Math.sin(angle);
  const y = distance*Math.sin(angle)-up*Math.cos(angle);
  if (z <= 0) return null;
  return {
    x: width/2 + pixelFocalLength(width,hfov) * lateral/z,
    y: height/2 + pixelFocalLength(height,vfov) * y/z,
    bearing: deg(Math.atan2(lateral,z)), elevation: deg(Math.atan2(-y,z)),
  };
}

export function compose(a,b) {
  const c = Math.cos(rad(a.yaw)), s = Math.sin(rad(a.yaw));
  return {x:a.x+c*b.x-s*b.y,y:a.y+s*b.x+c*b.y,yaw:a.yaw+b.yaw};
}

export function inverse({x,y,yaw}) {
  return compose({x:0,y:0,yaw:-yaw},{x:-x,y:-y,yaw:0});
}

export function pid({kp,ki,kd,offset,limit,damping,inertia,noise,delay,hz}) {
  const step = 1/hz, history=[], errors=[], commands=[];
  let angle=0, velocity=0, integral=0, last=offset, previousMeasurement=offset;
  for (let i=0;i<=6*hz;i++) {
    const t=i*step;
    history.push(angle);
    const measurement=offset-history[Math.max(0,i-Math.round(delay*hz/1000))]+noise*Math.sin(i*2.37);
    const derivative=i ? (measurement-previousMeasurement)/step : 0;
    const proposal=integral+measurement*step;
    const candidate=kp*measurement+ki*proposal+kd*derivative;
    if (Math.abs(candidate)<=limit || Math.sign(candidate)!==Math.sign(measurement)) integral=proposal;
    const command=clamp(kp*measurement+ki*integral+kd*derivative,-limit,limit);
    last=offset-angle;
    errors.push([t,last]); commands.push([t,command]);
    velocity+=(120*command-damping*velocity)/inertia*step;
    angle+=velocity*step;
    previousMeasurement=measurement;
  }
  const outside=errors.findLastIndex(([,e])=>Math.abs(e)>2);
  return {errors,commands,overshoot:Math.max(0,...errors.map(([,e])=>-Math.sign(offset)*e)),settle:errors[outside+1]?.[0],steady:last};
}

export function localization({noise,interval,drift,gate,imu=2}) {
  const truth=[],odometry=[],vision=[],rejected=[],fused=[],average=[],heading=[],errors=[];
  let predicted=0, variance=0.04, mean=0, raw=0;
  for (let step=0;step<=120;step++) {
    const t=step/10, x=t*0.4;
    if(step) {
      const compass=imu*Math.sin(step*1.3);
      raw+=0.04+drift/10;
      const displacement=(0.04+drift/10)*Math.cos(rad(compass));
      predicted+=displacement;
      mean+=displacement;
      variance+=0.0008;
      heading.push([t,compass]);
    }
    if (step%interval===0) {
      const observation=x+noise*Math.sin(step*1.78)+(step===interval*3 ? 1.3 : 0);
      const innovation=observation-predicted;
      if (Math.abs(innovation)<=gate) {
        vision.push([t,observation]);
        const r=Math.max(0.0001,noise**2), gain=variance/(variance+r);
        predicted+=gain*innovation;
        variance*=1-gain;
      } else rejected.push([t,observation]);
      mean=(mean+observation)/2;
    }
    truth.push([t,x]); odometry.push([t,raw]); fused.push([t,predicted]);
    average.push([t,mean]); errors.push([t,predicted-x]);
  }
  return {truth,odometry,vision,rejected,fused,average,heading,errors};
}

export function latency({target,robot,delay,accel,estimate,gain}) {
  const truth=[],camera=[],compensated=[],rawControl=[],compensatedControl=[];
  const position=t=>target*t+0.5*accel*t*t;
  let raw=0, corrected=0;
  for(let i=0;i<=120;i++){
    const t=i/20, captured=Math.max(0,t-delay/1000);
    const actual=position(t)-robot*t, observed=position(captured)-robot*captured;
    const extrapolated=observed+(estimate-robot)*(t-captured);
    raw+=clamp(gain*(observed-raw),-2,2)/20;
    corrected+=clamp(gain*(extrapolated-corrected),-2,2)/20;
    truth.push([t,actual]); camera.push([t,observed]); compensated.push([t,extrapolated]);
    rawControl.push([t,raw]); compensatedControl.push([t,corrected]);
  }
  return {truth,camera,compensated,rawControl,compensatedControl};
}

export function hsv(r,g,b) {
  const max=Math.max(r,g,b), min=Math.min(r,g,b), span=max-min;
  let h=0;
  if(span) h=max===r ? (g-b)/span : max===g ? (b-r)/span+2 : (r-g)/span+4;
  return [(60*h+360)%360,max ? 100*span/max : 0,100*max/255];
}
export const inHue = (value,low,high) => low <= high ? value>=low && value<=high : value>=low || value<=high;

export function components(mask,width,height,minArea=8) {
  const unseen=mask.slice(), regions=[];
  for(let start=0;start<unseen.length;start++) {
    if(!unseen[start]) continue;
    const queue=[start], edge=[];
    const box={left:width,right:0,top:height,bottom:0};
    unseen[start]=0;
    for(let k=0;k<queue.length;k++){
      const i=queue[k], x=i%width, y=Math.floor(i/width);
      box.left=Math.min(box.left,x); box.right=Math.max(box.right,x);
      box.top=Math.min(box.top,y); box.bottom=Math.max(box.bottom,y);
      const neighbors=[x>0?i-1:-1,x<width-1?i+1:-1,y>0?i-width:-1,y<height-1?i+width:-1];
      if(neighbors.some(n=>n<0 || !mask[n])) edge.push(i);
      for(const n of neighbors) if(n>=0 && unseen[n]) {unseen[n]=0; queue.push(n);}
    }
    if(queue.length>=minArea) regions.push({...box,area:queue.length,edge});
  }
  return regions;
}
