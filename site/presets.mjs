const pidBaseline = {kp:0.02,ki:0,kd:0,offset:30,limit:0.30,damping:2,inertia:1,noise:0,delay:0,hz:50};

export const workedPresets = {
  camera: [{
    values:{hfov:90,vfov:60,width:640,height:480,cameraHeight:0.45,pitch:0,distance:2,lateral:0.5,targetHeight:0.45},
    expected:'Look for fₓ = 320 px and image position (400, 240) px, 80 px right of center.',
  }],
  pid: [{
    values:pidBaseline,
    expected:'The first motor command is capped at +0.30. Note when the heading error first crosses zero.',
  },{
    label:'Load 200 ms delay comparison',
    values:{...pidBaseline,delay:200},
    expected:'The first command is still +0.30. Compare the error crossing and overshoot with the zero-delay run.',
  }],
  frames: [{
    values:{rx:1,ry:0,rYaw:90,cx:0.2,cy:0,cYaw:0,tx:1,ty:1,tYaw:0},
    expected:'The camera is at (1.00, 0.20) m in the field. The tag is at (0.80, 0.00) m in camera axes with −90° relative yaw.',
  }],
  hsv: [{
    values:{low:345,high:25,sat:45,val:35,area:20},
    sample:0,
    expected:'Start on the dark practice surface. Raise minimum value to 65% to remove the darkest red disk from the mask.',
  }],
  localization: [{
    values:{noise:0,interval:10,drift:0.10,gate:0.60},
    expected:'At 3 s, find the rejected tag observation at 2.50 m. The simulated robot is at 1.20 m and encoder-only odometry is at 1.50 m.',
  }],
  latency: [{
    values:{target:1,robot:0.4,delay:250,accel:0,estimate:1,gain:2},
    expected:'The raw observation is about 0.15 m behind. With the correct velocity estimate, the predicted measurement error is about 0.00 m.',
  }],
  fusion: [{
    values:{noise:0.10,interval:10,drift:0.10,gate:0.60,imu:0},
    expected:'Compare the uncertainty-weighted and naive averaging traces at the injected outlier. Raise vision noise to 0.40 m for the second trial.',
  }],
};
