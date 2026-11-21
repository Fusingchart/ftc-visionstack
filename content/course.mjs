import { technicalNotes } from './technical-notes.mjs';
import { controlChapter } from './control-chapter.mjs';
import { fieldLessons } from './field-lessons.mjs';
import { robotLessons } from './robot-lessons.mjs';
import { benchLessons } from './bench-lessons.mjs';
import { fundamentals } from './fundamentals.mjs';
import { recipePages } from './cookbook.mjs';
import { issuePages } from './troubleshooting.mjs';
import { refs } from './references.mjs';

const moduleProjects = ['distance-bearing','pipeline-switch','telemetry','tag-benchmark','color','rotate','odometry','tag-approach','moving-target','snapscript','webcam-comparison','webcam-comparison'];
const modules = [
['Computer vision fundamentals','Build a calibrated angle and range estimator.',[
['How computer vision works', 'SDK', 'Separate image acquisition, detection, estimation and decision-making', 'Record frame identifiers alongside control-loop ticks.', 'Explain why counting five polls as five successful detections produces a false stability criterion.'],
['Camera hardware and imaging', 'CAL', 'Choose exposure, resolution and mounting for a moving robot', 'Capture the same moving pattern at two exposures with the same light and compare edge widths.', 'Report exposure, brightness, and estimated blur in pixels for both runs.'],
['FTC vision technologies', 'VP LL', 'Choose an architecture that matches a detection and compute budget', 'List the data and hardware needed for tag-relative alignment and loose object detection.', 'Justify a camera and processor for each task with one measured selection criterion.'],
['Vision geometry', 'CAL', 'Convert centered pixel offsets into ray angles and estimate range', 'Vary pitch and known range in the camera geometry tool, then compare with a tape-measure bench test.', 'Show that range becomes ill-conditioned as the elevation angle approaches zero.'],
]],
['Limelight 3A setup','Configure and verify two independently identifiable pipelines.',[
['Hardware installation', 'LL SDK', 'Install the camera and distinguish USB detection from pipeline output', 'Bench-check streaming first, then gently flex the installed cable and repeat.', 'Log the configured device name, mounting offset, and observed disconnect count.'],
['Limelight dashboard', 'LL', 'Use image preview to separate acquisition and inference faults', 'Save two slots with visibly distinct behavior and restore one from a backup on the bench.', 'Show that each slot produces its expected observation after a restart.'],
['Pipeline configuration', 'LL CV', 'Select a detector and tune its inputs against representative scenes', 'Capture targets near both crop boundaries and record misses while varying crop size.', 'Choose a crop that covers the required robot approach range and document the tradeoff.'],
['Troubleshooting setup', 'LL SDK', 'Locate a fault with one change at a time', 'Introduce a wrong slot, a covered lens, and a swapped configured name one at a time.', 'Use telemetry and preview evidence to distinguish the three faults without changing controller gains.'],
]],
['FTC Java programming','Build a reusable vision snapshot reader and a telemetry OpMode.',[
['Limelight FTC SDK integration', 'LL JNI', 'Map the Limelight lifecycle onto a LinearOpMode', 'Run a telemetry-only OpMode and stop it immediately after start, then restart it.', 'Show the camera returns to producing results and explain which scope owns stop().'],
['Reading vision results', 'LL JNI', 'Interpret validity, offsets, area and time separately', 'Block the camera for a second while logging valid and staleness.', 'Show which telemetry values identify blank, stale and centered states.'],
['Advanced vision data', 'LL TAG JNI', 'Select a consistent detection from multiple observations', 'Put two tags in view and log selected ID, angle, and age as the camera pans.', 'Show your ranking policy preserves the requested ID across frames.'],
['Reusable vision software', 'LL SDK', 'Isolate camera I/O from testable geometry and control', 'Feed a fake source a valid, stale and missing observation in that order.', 'Verify outputs transition to zero on invalid data without waiting for a new frame.'],
]],
['AprilTags','Measure a tag pose against a surveyed bench layout.',[
['Understanding AprilTags', 'TAG', 'Explain the relationship between decoded identity and pose', 'Print a documented tag at two scales and measure the actual side length used by your processor.', 'Predict and measure the direction of range bias with the wrong tag size.'],
['AprilTag pipeline configuration', 'LL TAG', 'Choose camera settings that preserve usable corners', 'Create a distance-by-heading grid and collect 30 observations per cell.', 'Mark the farthest distance that meets your stated detection rate and angular error thresholds.'],
['Relative localization', 'TAG CAL', 'Turn a tag measurement into a robot-relative error', 'Move the camera 0.10 m to one side and measure the same fixed tag again.', 'Confirm both camera placements yield the same robot-relative position after transformation.'],
['Reliable AprilTag processing', 'TAG LL', 'Reject old, occluded or inconsistent tag observations', 'Cover half the tag, then reveal it while recording accepted frames and control output.', 'Confirm movement resumes only after a fresh observation and explain what remains unobservable.'],
]],
['Color and object detection','Pick a target from multiple candidates and benchmark the policy.',[
['Color spaces and segmentation', 'CV', 'Build a wrap-aware color mask', 'Use the HSV explorer to isolate a color, then reduce the saturation floor and inspect the background.', 'Convert a red hue wrap into two OpenCV intervals and explain how the saturation floor changes false accepts.'],
['Contours and object geometry', 'CV', 'Turn a binary mask into filtered object observations', 'Bring two colored disks close together and watch their labels merge.', 'Explain how dilation can join nearby targets and propose a mitigation based on their expected size.'],
['Selecting and tracking targets', 'CV CAL', 'Maintain a target identity across nearby detections', 'Cross two similarly colored targets while logging association distance.', 'Count identity swaps and show when your policy deliberately drops the track.'],
['Color versus neural detection', 'CV LL', 'Compare detectors with equivalent labeled test conditions', 'Capture a balanced held-out set with neutral and confusing backgrounds and run paired trials.', 'Report detector metrics with units and list at least one condition in which each detector fails.'],
]],
['Vision-based robot control','Align to an AprilTag on a low-speed test fixture.',[
['Visual servoing fundamentals', 'FARM LL', 'Translate camera error into a bounded control command', 'Use the PID simulator to explore feedback sign, then verify a brief low-power bench pulse.', 'Show readings before and after the pulse and identify the measured variable and commanded variable.'],
['PID control', 'FARM', 'Tune a bounded time-aware PID controller', 'Run pure P, then try derivative and integral separately at the same initial offset.', 'Compare settling time, steady-state error and saturation duration under one stated disturbance.'],
['Auto-alignment', 'FARM TAG', 'Choose a controlled axis and define completion', 'Define separate lateral and yaw tolerances and test each axis alone.', 'Show why an apparent zero bearing can occur with the wrong chassis heading.'],
['Robust vision control', 'FARM LL', 'Design a loss and override policy', 'Inject a delay and hide the target while running at a limited output.', 'Verify immediate control cancellation on lost target and driver override.'],
]],
['Localization and coordinate systems','Compare vision-corrected pose with an odometry-only run.',[
['Coordinate transformations', 'CAL TAG', 'Compose camera-to-robot and robot-to-field poses', 'Move a simulated camera offset and rotate the robot 90°.', 'Confirm transform composition and its inverse recover the original point within rounding.'],
['Camera calibration', 'CAL TAG', 'Measure intrinsics and mounting extrinsics separately', 'Collect calibration frames across the image and compare reprojection errors on held-out observations.', 'Document resolution, units, calibration model and error at center versus corners.'],
['Field localization using AprilTags', 'TAG LL', 'Recover field pose from surveyed tags and camera extrinsics', 'Compare field estimates for one visible tag and multiple visible tags on a marked grid.', 'Check the sign of x, y and yaw against surveyed motion before feeding a path follower.'],
['Vision and odometry fusion', 'TAG CAL', 'Update a predicted pose with a gated measurement', 'Sweep measurement uncertainty and observation frequency in the fusion tool.', 'Explain why applying a delayed estimate directly to the present pose biases the correction.'],
]],
['Autonomous navigation','Run a vision-assisted state machine with a measured fallback.',[
['Vision-based navigation', 'TAG RR', 'Use vision within a bounded search and approach state machine', 'Replay a trace with two targets, intermittent loss and a timeout.', 'List state transitions and verify no approach command occurs without admissible range.'],
['Path following integration', 'RR PEDRO', 'Adapt a camera observation to the path follower frame', 'Apply a known 90° heading and a one-foot displacement through your coordinate adapter.', 'Verify the plotted pose moves with the robot using the version locked in the build.'],
['Dynamic pose corrections', 'RR PEDRO TAG', 'Decide when to accept, blend or defer a pose correction', 'Inject a false tag pose while following a test route and log both proposals and accepted updates.', 'Confirm the controller avoids unexpected large commands and can resume after a legitimate correction.'],
['Complete vision autonomy', 'RR TAG SDK', 'Connect detection, motion and alignment with explicit time budgets', 'List test cases for no target, wrong ID, low battery, lost target and failure to settle.', 'Demonstrate safe termination in each case and log match-independent cycle time.'],
]],
['Advanced tracking and prediction','Compare raw and compensated measurements on a moving platform.',[
['Temporal tracking', 'CAL CV', 'Associate observations and filter jitter', 'Replay samples 8, 9, 70, 9, 8 with a sliding median and exponential smoothing.', 'Identify spike suppression, response lag and association decisions separately.'],
['Estimating motion', 'CAL TAG', 'Estimate target velocity in a shared frame', 'Walk the robot past a stationary tag and compare relative and field-referenced velocities.', 'Verify the field estimate stays near zero under controlled motion and quantify noise.'],
['Latency compensation', 'LL CAL', 'Predict from measurement time toward actuation time', 'Sweep velocity and delay in the latency tool and compare error under target acceleration.', 'State which clock each timestamp uses and report error versus age.'],
['Predictive aiming', 'FARM CAL', 'Estimate future bearing and bound feedforward', 'Simulate a sudden reversal in target velocity and compare raw and predicted aiming lag.', 'Explain when constant velocity prediction overshoots and specify a prediction-age cutoff.'],
]],
['Neural networks and custom pipelines','Train and evaluate a detector or integrate a custom SnapScript.',[
['Neural vision fundamentals', 'LL', 'Evaluate an object detector independently of geometric accuracy', 'Hand-label ten images, rank predicted boxes by score, and vary two confidence cutoffs.', 'Report precision and recall at a fixed IoU criterion and give one failure example.'],
['Creating datasets', 'LL', 'Build a dataset that represents competition conditions', 'Create a manifest with session, scene, object class, resolution and permissions for each image batch.', 'Audit two images per class and show that no session crosses train and test.'],
['Training and deployment', 'LL SDK', 'Validate a compatible model on the actual inference hardware', 'Archive the model, label map, firmware and calibration metadata. Replay a scene with no target.', 'Report device recall and latency percentiles with versioned inputs and an explicit pass threshold.'],
['Python SnapScripts', 'LL CV', 'Define an explicit custom pipeline output contract', 'Test empty input, one large foreground contour and multiple small blobs.', 'Verify the result array stays the expected length and validity flips on loss.'],
]],
['Reliability and performance','Publish a repeatable benchmark protocol and raw measurements.',[
['Measuring vision accuracy', 'TAG CAL', 'Separate systematic bias, scatter and detection probability', 'Collect stationary observations at three ranges and two headings.', 'Report bias, RMSE, sample counts and a detection fraction for each cell.'],
['Environmental robustness', 'CV TAG', 'Stress the optical setup under repeatable field changes', 'Run a fixed target grid with direct light, side light, and a moving shadow.', 'Identify your worst condition using measured misses or pose error and rerun after one change.'],
['Timing and performance', 'LL VP', 'Measure processing time, polling and frame age independently', 'Compare logging enabled and disabled on the same pipeline and camera settings.', 'Report distinct-frame rate, p50 and p95 age and loop jitter.'],
['Competition readiness', 'GAME SDK LL', 'Turn regression tests into a pre-match camera check', 'Rehearse reconnect, opaque lens and wrong-pipeline failures before a practice match.', 'Document recovery time and behavior for each fault without calling a bench result competition validation.'],
]],
['Vision beyond Limelight','Benchmark the same task on Limelight and a USB webcam.',[
['FTC VisionPortal', 'VP TAG SDK CLUSTER', 'Use a webcam and an SDK processor within an OpMode', 'Run a webcam tag preview and toggle a processor while logging streaming status.', 'Show the expected no-detection state, then recover on a known visible tag.'],
['OpenCV', 'CV CAL', 'Implement an image-space filter and control memory churn', 'Compare mask and connected shapes with and without one morphology step on a captured image.', 'Report elapsed processing time and explain a case in which the morphology step removes a real target.'],
['Custom hardware and architectures', 'GAME VP SDK', 'Evaluate a camera topology against current robot rules', 'Draw a compute and USB wiring map for each proposed architecture and mark the current applicable rules.', 'Explain which parts are bench-only until the applicable rule and hardware are verified.'],
['Comparing architectures', 'VP LL CV', 'Make a measurable platform choice from paired trials', 'Run a paired trial with fixed mount locations or compensate extrinsics and alternate run order.', 'Use a scorecard to justify your choice with raw measurements and uncertainty.'],
]],
];

export const modulePages = modules.map(([title, project], i) => ({
  path:'course/module-' + (i+1), title, description:project,
  sections:[['Core lessons',[{cards:modules[i][2].map((_,j)=>'course/lesson-' + (i+1) + '-' + (j+1))}]],['Module project',[project,{cards:['projects/'+moduleProjects[i]]}]]],
}));
const labs = { '1-2':'camera', '1-4':'camera', '4-3':'frames', '5-1':'hsv', '5-2':'hsv', '6-1':'pid', '6-2':'pid', '7-1':'frames', '7-4':'fusion', '8-3':'localization', '9-3':'latency', '9-4':'latency' };
const paths = modules.flatMap((module,i)=>module[2].map((_,j)=>'course/lesson-' + (i+1) + '-' + (j+1)));
export const lessonPages = modules.flatMap(([,,lessons],i)=>lessons.map(([title, sources, objective, exercise, assessment],j)=>{
  const index = i*4+j;
  const path = paths[index];
  const recipes = recipePages.filter(recipe=>recipe.sections.at(-1)[1][0].cards.includes(path));
  const issues = issuePages.filter(issue=>issue.sections.at(-1)[1][1].cards.includes(path));
  const lessonNumber = (i+1)+'-'+(j+1);
  const tool = labs[lessonNumber];
  const deepDive = benchLessons[lessonNumber] ?? robotLessons[lessonNumber] ?? fieldLessons[lessonNumber];
  if (i !== 0 && !deepDive) throw new Error('Missing lesson explanation for ' + lessonNumber);
  const difficulty = i<3 ? 'Beginner' : i<7 ? 'Intermediate' : 'Advanced';
  const authored = i === 0 ? fundamentals[j] : controlChapter[lessonNumber];
  const technicalNote = technicalNotes[lessonNumber];
  return {
    path,title,description:objective + '.',meta:difficulty + ' · Module ' + (i+1),
    lesson:true,
    siblings:[paths[index-1], paths[index+1]],
    sections:[...(authored ?? [
      [deepDive[0], [deepDive[1][0]]],
      ['Worked example',deepDive[1].slice(1)],
      ...(recipes.length ? [['Java application',[recipes[0].description,recipes[0].sections[1][1][0],{cards:recipes.map(page=>page.path)}]]] : []),
      ...(issues.length ? [['Common mistakes',[{cards:issues.map(page=>page.path)}]]] : []),
      ...(tool ? [['Interactive lab',[{cards:['tools/'+tool]}]]] : []),
      ['Try it',[exercise,assessment,{cards:['projects/'+moduleProjects[i]]}]],
    ]), ...(technicalNote ? [technicalNote] : []), ['References',[{links:sources.split(' ').map(key=>refs[key])}]],
    ],
  };
}));
