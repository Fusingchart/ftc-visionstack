import { config } from '../site/config.mjs';
import { modulePages, lessonPages } from './course.mjs';
import { refs } from './references.mjs';

export const pages = [
  { path:'', title:'Computer vision for FTC robots', description:'Learn to detect game pieces, align to AprilTags, and use camera measurements in autonomous. Built by students for FTC teams.', sections:[['Explore FTC vision',[{ cards:['course','projects','cookbook','tools','season'] }]]] },
  { path:'course', title:'Course', description:'Learn vision from the image sensor to autonomous control.', sections:[['Modules',[{cards:modulePages.map(p=>p.path)}]]] },
  { path:'projects', title:'Projects', description:'Bench and robot implementations for practical FTC vision tasks.' },
  { path:'cookbook', title:'Code cookbook', description:'Focused Java examples for typical vision integration tasks.' },
  { path:'troubleshooting', title:'Troubleshooting', description:'Trace vision faults from camera configuration to robot motion.' },
  { path:'tools', title:'Interactive tools', description:'Experiment with camera geometry, image processing, and controls.' },
  { path:'season', title:config.season + ' vision', description:'Use current FIRST field references to plan vision experiments.', sections:[['Official season references',[{links:[refs.GAME,refs.ARENA]}]]] },
  { path:'resources', title:'Resources', description:'Primary references for robotics vision and FTC programming.', sections:[['Official documentation',[{links:Object.values(refs)}]]] },
  { path:'about', title:'About', description:config.team + ' builds open-source educational resources for FTC teams.', sections:[['Mission',['Help students understand camera measurements and turn them into reliable robot behaviors. This is an unofficial community project.']],['License',[{links:[['MIT license',config.repository+'/blob/main/LICENSE']]}]]] },
  { path:'contribute', title:'Contribute', description:'Report an issue, fix an explanation, or share a tested FTC example.', sections:[['Changes',['Fork the repository, create a branch, run npm test, and open a pull request. Include the route, steps to reproduce, expected behavior, and relevant SDK, firmware, and camera versions. Mention which checks you ran. Remove identifying student information from logs.'],],[ 'GitHub',[{links:[['Open an issue',config.repository+'/issues/new'],['Contribution guide',config.repository+'/blob/main/CONTRIBUTING.md']]}]]] },
  { path:'search', title:'Search', description:'Search lessons, examples, tools, and troubleshooting.' },
];

pages.push(...modulePages, ...lessonPages);
