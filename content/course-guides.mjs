import { refs } from './references.mjs';

const figure = (figure, alt, caption) => ({figure, alt, caption});
const visuals = {
  capture: figure('pipeline','Four stages show image capture, detection, estimation, and the robot decision.','A camera preview and a robot decision sit at different points in the data path.'),
  range: figure('elevation-range','Two rays from the same lens meet the same target height at different ranges.','Range from elevation becomes sensitive as the viewing ray approaches horizontal.'),
  image: figure('camera-image-plane','The pixel origin is at the upper left. The optical axis reaches the center and the sample target lies to its right.','Image coordinates are measured from the frame’s origin. Subtract the principal point to get an offset.'),
  lens: figure('camera-focal-triangle','A right triangle joins the lens, the center of the image, and its horizontal edge.','Focal length in pixels relates a ray angle to distance from the optical center in the image.'),
  view: figure('camera-fov','Top and side views show separate horizontal and vertical angles around the optical axis.','A wide horizontal view does not tell you how far up or down a camera can see.'),
  tag: figure('tag-corners','A square tag is paired with its four detected image corners in perspective.','The decoder identifies a pattern. The pose solver uses the corner geometry and camera calibration.'),
  axes: figure('frames','Field, robot and camera axes appear at different origins with a tag ahead.','Write the coordinate frame next to every pose before combining it with another measurement.'),
  mask: figure('hsv-mask','A source image with a disk and distractors has a binary mask containing only the disk.','A mask reports which pixels meet a rule. A detector or selector decides which region to use.'),
  region: figure('mask-connectivity','Edge-sharing pixels form one region. Two diagonally touching pixels form two regions.','A connectivity rule determines when neighboring mask pixels form one reported object.'),
  loop: figure('pid-loop','Command flows from controller to chassis, and delayed camera observations return to the controller.','A control loop contains both mechanical response time and the time needed to observe its effect.'),
  effort: figure('pid-terms','Proportional and derivative terms point in opposite directions, giving a small positive sum.','The command can be much smaller than the proportional term when the error is falling quickly.'),
  time: figure('latency','A timeline places capture before result-ready time, hub read and command.','Keep the time of exposure separate from delivery and use.'),
  gate: figure('innovation-gate','A position estimate is centered in an acceptance band. A near observation passes while a far one is rejected.','Use the difference from the expected state to gate a new observation.'),
  replay: figure('pose-replay','An estimator corrects an older position and then replays the distance traveled since capture.','A delayed camera result can update past state while the robot is already farther along.'),
  weight: figure('fusion-gain','Along a number line a weighted result lies closer to the camera than the equal-weight average does.','A correction depends on the size of the discrepancy and the relative uncertainty.'),
  predict: figure('latency-distance','A ruler shows the old camera position behind the true position and two different corrections.','Extrapolation depends on the relative motion during the delay.'),
};

const assignments = [
  ['capture','view','capture','range'],
  ['capture','capture','view','time'],
  ['capture','time','tag','capture'],
  ['tag','tag','axes','gate'],
  ['mask','region','region','mask'],
  ['loop','effort','axes','loop'],
  ['axes','lens','tag','replay'],
  ['loop','axes','gate','capture'],
  ['time','axes','predict','predict'],
  ['mask','region','capture','mask'],
  ['gate','view','time','capture'],
  ['capture','mask','time','weight'],
];

export function courseFigure(moduleIndex, lessonIndex) {
  return visuals[assignments[moduleIndex][lessonIndex]];
}

export function relatedFigure(lesson) {
  const [module, position] = lesson.split('-').map(Number);
  return courseFigure(module - 1, position - 1);
}

const modules = [
  ['Separate the jobs in the pipeline','Begin with a target you can move and measure. Follow one image from capture to a robot decision. By the end, predict a bearing from a pixel offset and describe what extra information a range estimate needs.','Measure a fixed target twice at different depths. Verify that the same image location can come from two different positions if the two rays point in the same direction.','tools/camera','image'],
  ['Bring up a camera one stage at a time','Start with hub configuration, then confirm live capture, then verify the requested pipeline and a known target. Save a working configuration before changing exposure or crop.','Use a valid target, a covered lens and the wrong slot. Your log should make each of those cases distinguishable without plugging in the drivetrain.','projects/pipeline-switch','capture'],
  ['Turn device output into an observation contract','A camera result is a snapshot with identity, timing and validity. Pick which fields your robot needs, convert them at one boundary and keep the control loop independent from the camera’s update rate.','Replay a valid centered sample, a repeated frame and a stale frame. Verify that only the fresh sample advances your acceptance logic.','projects/telemetry','time'],
  ['Get identity first, then test pose','Start with a known tag family and measured size. Compare decode success with the quality of the estimated angle and position at different distances and headings.','Move one known tag through three distances and two headings. Report accepted frames alongside the residuals at each pose.','projects/tag-benchmark','tag'],
  ['Evaluate every stage of object selection','Begin by inspecting the pixels that survive a threshold. Then examine how grouping and candidate ranking change the target that the robot receives.','Place two pieces and a lookalike in one frame. Explain which pixels pass, how many regions you report and why the chosen region is a suitable target.','tools/hsv','mask'],
  ['Close the loop on one axis','Verify signs and use fresh angle measurements with limited effort. Compare a proportional response with a PID response before adding simultaneous motion on other axes.','Repeat a small angle step with the same initial setup. Then obscure the target while effort is still requested and verify that the command becomes zero.','tools/pid','loop'],
  ['Give every measurement a frame and a time','Measure the camera mount relative to the chassis. Convert tags and robot poses to a shared coordinate convention, then consider how far the robot has moved since exposure.','Check three surveyed locations and one physical quarter turn. Replay a delayed observation and verify the correction direction against the predicted pose at capture.','tools/frames','axes'],
  ['Give an autonomous routine explicit exits','Route the robot through acquisition, alignment, approach and verification. Decide up front how each stage handles an invalid measurement or a missed deadline.','Remove the target during forward travel and observe the transition. Check the neutral drive command before judging whether a recovery is possible.','projects/tag-approach','gate'],
  ['Track the same object across time','Compare the latest sample with past samples only after checking identity and timing. Use the simplest prediction that fits an independently measured motion.','Compare a constant-speed pass with a reversal. Report the point at which prediction helps and the point at which it adds error.','tools/latency','predict'],
  ['Evaluate the detector in the conditions that matter','Treat score, box location and downstream control as separate measurements. Split recording sessions before exporting a model and capture realistic hard negatives.','Run a fixed held-out batch and record misses, duplicate detections and delayed results. Inspect one failure before changing any setting.','projects/neural','mask'],
  ['Measure reliability separately from error','A result can be accurate on the few frames when it appears. Use a known fixture and count both usable observations and missed frames by test condition.','Record a baseline and a lighting or motion change. Report accepted fraction, error for accepted samples and observation age.','projects/tag-benchmark','time'],
  ['Follow the frame through the architecture','Compare where processing runs, how outputs are polled and what can be recovered after a failure. Choose a camera topology and evaluate it with a paired trial.','Run the same scene with each setup in turn. Normalize coordinate and timing definitions before comparing throughput and error.','projects/webcam-comparison','capture'],
];
export const moduleGuide = modules.map(([heading, context, exercise, route, id]) => [
  [heading,[context,visuals[id]]],
  ['What to verify',[exercise,{cards:[route]}]],
]);

export const glossary = [
  ['Image and lens',[{table:{caption:'Distinguish the camera’s geometry from the numbers used to describe a pixel.',headers:['Term','Meaning'],rows:[
    ['Field of view','Angle between the outer rays the camera can image.'],
    ['Principal point','Where the optical axis intersects the image.'],
    ['Pixel focal length','Projection scale in pixels for each image axis.'],
    ['Extrinsics','The rotation and translation between coordinate frames.'],
  ]}},visuals.lens,{cards:['tools/camera','course/lesson-7-2']}]],
  ['Observation and control',[{table:{caption:'Keep the measurement and the action separate in a robot log.',headers:['Term','Meaning'],rows:[
    ['Frame identity','The identifier used to recognize two reads of the same observation.'],
    ['Age','Elapsed time since a defined source event, such as capture.'],
    ['Innovation','A measurement minus the predicted value at the same time.'],
    ['Command','The bounded output a controller asks the drivetrain to apply.'],
  ]}},visuals.time,{cards:['tools/latency','tools/fusion']},{links:[refs.CAL,refs.TAG]}]],
];
