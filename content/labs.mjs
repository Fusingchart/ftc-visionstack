import { simulationLessons } from './simulation-lessons.mjs';
import { cameraLab } from './camera-lab.mjs';
const tools = [
  ['camera','Camera geometry','See how field of view, focal length, and camera pitch determine where a target appears in an image'],
  ['pid','PID auto-alignment','Tune feedback against inertia, drag, noise and delay'],
  ['frames','AprilTag coordinate frames','Compose planar robot, camera and tag poses'],
  ['hsv','HSV threshold explorer','Mask local sample images and inspect connected foreground regions'],
  ['localization','Field localization','Compare encoder drift with gated AprilTag observations'],
  ['latency','Vision latency','Compare delayed observations with constant-velocity prediction'],
  ['fusion','Sensor fusion','Compare uncertainty weighting against naive averaging'],
];
export const toolPages = tools.map(([tool,title,description]) => ({
  path:'tools/'+tool, tool, title, description:description+'.',
  sections:tool === 'camera' ? cameraLab : simulationLessons[tool],
  inlineSimulator:true,
}));
