import { test } from 'node:test';
import assert from 'node:assert/strict';
import { project,compose,inverse,pid,localization,latency,hsv,inHue,components } from '../site/models.mjs';
const near=(value,expected)=>assert.ok(Math.abs(value-expected)<1e-9,`${value} ≠ ${expected}`);

test('camera geometry projects center and half-FOV edge',()=>{
  const input={hfov:90,vfov:90,width:640,height:480,cameraHeight:0.5,pitch:0,distance:2,lateral:0,targetHeight:0.5};
  assert.deepEqual(project(input),{x:320,y:240,bearing:0,elevation:-0});
  near(project({...input,lateral:2}).x,640);
  assert.equal(project({...input,distance:-2}),null);
});

test('rotation composition and rigid inverse are consistent',()=>{
  const robot={x:2,y:1,yaw:90}, offset={x:1,y:0,yaw:0};
  const camera=compose(robot,offset);
  near(camera.x,2);near(camera.y,2);
  const roundtrip=compose(inverse(robot),camera);
  near(roundtrip.x,1);near(roundtrip.y,0);near(roundtrip.yaw,0);
});

test('PID bounds effort and converges under nominal dynamics',()=>{
  const outcome=pid({kp:.025,ki:0,kd:.005,offset:30,limit:.65,damping:2,inertia:1,noise:0,delay:30,hz:50});
  assert.ok(outcome.commands.every(([,u])=>Math.abs(u)<=.65));
  assert.ok(Math.abs(outcome.steady)<2);
  assert.ok(outcome.settle<6);
});

test('localization rejects injected outlier and reduces final drift',()=>{
  const output=localization({noise:0.10,interval:8,drift:.09,gate:.6});
  assert.equal(output.rejected.length,1);
  assert.ok(Math.abs(output.errors.at(-1)[1])<.2);
  assert.ok(output.odometry.at(-1)[1]-output.truth.at(-1)[1]>.9);
});

test('constant-velocity compensation removes steady age error',()=>{
  const output=latency({target:1,robot:.4,delay:200,accel:0,estimate:1,gain:2});
  near(output.compensated.at(-1)[1],output.truth.at(-1)[1]);
  near(output.truth.at(-1)[1]-output.camera.at(-1)[1],.12);
});

test('HSV conversion, hue wrap, and component boundary respect image rows',()=>{
  assert.deepEqual(hsv(255,0,0),[0,100,100]);
  assert.deepEqual(hsv(0,255,0),[120,100,100]);
  assert.ok(inHue(355,345,25));
  assert.ok(inHue(5,345,25));
  assert.ok(!inHue(120,345,25));
  const regions=components(Uint8Array.from([0,0,1,1,0,0]),3,2,1);
  assert.equal(regions.length,2);
  assert.deepEqual(regions.map(region=>region.edge),[[2],[3]]);
});
