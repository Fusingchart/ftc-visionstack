import { guideFor } from './site-guides.mjs';
import { readFileSync } from 'node:fs';
import { config } from '../site/config.mjs';
import { modulePages, lessonPages } from './course.mjs';
import { toolPages } from './labs.mjs';
import { projectPages } from './projects.mjs';
import { recipePages } from './cookbook.mjs';
import { issuePages } from './troubleshooting.mjs';
import { outreachPages } from './outreach.mjs';
import { refs } from './references.mjs';

const clusterCode = 'ftc-examples/src/org/firstinspires/ftc/teamcode/visionstack/BiobuzzClusterViewer.java';

export const pages = [
  { path:'', title:'Computer vision for FTC robots', description:'Learn to detect game pieces, align to AprilTags, and use camera measurements in autonomous. Built by students for FTC teams.', sections:[['Explore FTC vision',[{ cards:['course','projects','cookbook','tools','season'] }]],['Learning paths',[{cards:['start/rookies','start/limelight-auto-aim','start/experienced']}]],['Featured projects',[{cards:['projects/telemetry','projects/rotate','projects/odometry']}]]] },
  { path:'course', title:'Course', description:'Learn vision from the image sensor to autonomous control.', sections:[['Modules',[{cards:modulePages.map(p=>p.path)}]]] },
  { path:'projects', title:'Projects', description:'Bench and robot implementations for practical FTC vision tasks.', listing:projectPages.map(p=>p.path) },
  { path:'cookbook', title:'Code cookbook', description:'Focused Java examples for typical vision integration tasks.', listing:recipePages.map(p=>p.path) },
  { path:'troubleshooting', title:'Troubleshooting', description:'Trace vision faults from camera configuration to robot motion.', listing:issuePages.map(p=>p.path) },
  { path:'tools', title:'Interactive tools', description:'Experiment with camera geometry, image processing, and controls.', sections:[['Labs',[{cards:toolPages.map(p=>p.path)}]]] },
  { path:'season', title:config.season + ' vision', description:'Use current FIRST field references to plan vision experiments.', sections:[
    ['Detect POLLEN and NECTAR',['Section 9.8 of the BIOBUZZ manual lists yellow POLLEN at about 7.1 cm diameter and red and blue NECTAR at about 9.1 cm. Physical pieces vary in shape and size. Use approximate sizes to design test cases and calibrate the actual objects before treating image area as range.', 'Capture field tiles, field tape and partially hidden objects under several light sources. Tune a yellow HSV mask, split red across the hue wrap, and collect blue and red hard negatives. Compare with a detector trained on session-separated images.',{cards:['tools/hsv','projects/color-neural','projects/neural']}]],
    ['Aim at a CELL',[ 'Section 9.9 describes 36h11 AprilTags with an approximately 8.25 cm side. Four tags form a cluster on the bottom of each CELL. The HIVE can tip between two stable positions. Measure in a target-relative frame and allow for changes in visible tags during a match.', 'On a practice fixture, check upward-facing camera clearance and exposure, approach from different bearings, and cancel motion when the chosen cluster is no longer visible. For static field localization, use references whose pose is known at the time of capture.',{cards:['tools/frames','projects/specific-tag','projects/tag-approach']}]],
    ['VisionPortal CELL cluster example',['The SDK 12.0 season library groups member tags by CELL. The cluster has a name and an estimated reference at the CELL opening. Use Webcam 1 and a known official cluster on a representative practice fixture. This telemetry example reads the cluster in camera-relative coordinates and ignores stale detections.',{code:readFileSync(clusterCode,'utf8')},{links:[refs.CLUSTER,['BiobuzzClusterViewer.java',config.repository+'/blob/main/'+clusterCode]]}]],
    ['Rehearse an approach',[ 'Detect a practice POLLEN, center the target at limited speed, and stop at a measured standoff using an independent distance measurement. Introduce a wrong color, a lost target and an invalid range as separate trials. Use the official game details and robot rules to audit the final autonomous behavior. No match thresholds or field poses ship with these examples.',{cards:['projects/game-piece','course/module-8']}]],
    ['Official season references',['Competition Manual TU10. ARENA section revision TU06.',{links:[refs.GAME,refs.ARENA]}]],
  ] },
  { path:'resources', title:'Resources', description:'Primary references for robotics vision and FTC programming.', sections:[['Official documentation',[{links:Object.values(refs)}]]] },
  { path:'about', title:'About', description:config.team + ' builds open-source educational resources for FTC teams.', sections:[['Mission',['Help students understand camera measurements and turn them into reliable robot behaviors. This is an unofficial community project.']],['License',[{links:[['MIT license',config.repository+'/blob/main/LICENSE']]}]]] },
  { path:'contribute', title:'Contribute', description:'Report an issue, fix an explanation, or share a tested FTC example.', sections:[['Changes',['Fork the repository, create a branch, run npm test, and open a pull request. Include the route, steps to reproduce, expected behavior, and relevant SDK, firmware, and camera versions. Mention which checks you ran. Remove identifying student information from logs.'],],[ 'GitHub',[{links:[['Open an issue',config.repository+'/issues/new'],['Contribution guide',config.repository+'/blob/main/CONTRIBUTING.md']]}]]] },
  { path:'start', title:'Learning paths', description:'Find an entry point for your team and the problem you are solving.', listing:outreachPages.map(p=>p.path) },
  { path:'feedback', title:'Share a team trial', description:'Use this optional form to prepare a short implementation report.', feedback:true, sections:[['Privacy',['The form keeps entered text in your browser until you choose to copy it or open a public GitHub issue draft. A draft becomes public if you submit it on GitHub. Share team-level details and leave out student names, emails and contact details.']]] },
  { path:'search', title:'Search', description:'Search lessons, examples, tools, and troubleshooting.' },
];

for (const page of pages) {
  const guide = guideFor(page.path);
  page.sections = page.path === '' || page.path === 'season'
    ? [...(page.sections ?? []), ...guide]
    : [...guide, ...(page.sections ?? [])];
}

pages.push(...modulePages, ...lessonPages, ...toolPages, ...projectPages, ...recipePages, ...issuePages, ...outreachPages);
