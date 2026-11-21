import { relatedFigure } from './course-guides.mjs';

const workshops = {
  rookies: ['1-1','From field object to telemetry','Mark the target at the center and then 0.25 m right at 1.0 m forward. A right-positive angle should be about 14°. Cover the lens to compare a centered observation, a lost observation and an implausible reading.'],
  coaches: ['3-2','A station with a clear handoff','Have one student show the live camera view, another report the frame identity and angle, and a third state the condition that would stop movement. Swap roles and have each student explain why a result can be valid but too old to use.'],
  experienced: ['9-3','An experiment that exposes hidden delay','Use one stationary and one moving trial with the same target. Compare scene time, resulting angle and applied command. If the stationary trial passes while the moving trial lags, investigate timing before changing calibration.'],
  'apriltag-localization': ['7-1','Check the field and camera frames separately','Mark the origin, then move the robot one tape mark forward and rotate it on the spot. Look for a rotation of the camera offset in field axes. If the pose changes in a direction you cannot explain, draw both axis conventions before changing gains.'],
  'limelight-auto-aim': ['6-1','Predict the first motor request','With a known +10° bearing and a proportional gain of 0.02, the controller requests +0.20 before limits. Verify the signs with the drive constrained, and then check that a covered lens produces zero even when the last valid target was far from center.'],
  'object-detection': ['5-1','Make a small, difficult set of scenes','Include an isolated piece, partly hidden piece and a strip of matching tape. Inspect which pixels pass before counting detections. A model that accepts the tape can appear competent on a dataset made only of isolated pieces.'],
  autonomous: ['8-3','Walk one state transition by hand','Choose a held-out test where the target disappears just after forward movement starts. Mark the last usable frame and the first neutral output. Then repeat with a request to cancel. Treat each failure path as a separate behavior.'],
};

export const outreachPages=[
['rookies','Vision for rookie FTC programmers','Start with a single known target and read telemetry before using motors. Bring a webcam or Limelight, a printed tag and a tape measure.','In a first meeting, identify a tag, move it right and record the direction of bearing change. Use a fixed fixture for the first measurements.',['course/module-1','projects/telemetry','tools/camera']],
['coaches','FTC vision workshop for coaches','Run a workshop with separate stations for camera setup, geometry and controller tuning.','At the end, each group should be able to name its camera, demonstrate an accepted measurement and explain one condition that should stop the robot.',['course/module-2','troubleshooting','feedback']],
['experienced','FTC vision for experienced teams','Measure your existing pipeline before migrating. Compare observation age and controlled robot error across repeatable scenes.','Bring a small set of log traces and run one matched camera comparison before changing filters.',['course/module-9','projects/webcam-comparison','tools/fusion']],
['apriltag-localization','FTC AprilTag localization','Set units, map origins and camera orientation before consuming a field pose.','Measure three marked poses and verify a physical quarter turn appears with the expected sign.',['course/lesson-7-3','tools/frames','projects/field-pose']],
['limelight-auto-aim','Limelight auto-aim for FTC','Start with a single yaw axis and measure error before enabling proportional or PID effort.','Use a small initial error, a limited command and a manual enable. Start on a bench fixture and rehearse loss.',['projects/rotate','tools/pid','course/lesson-6-4']],
['object-detection','FTC game-piece object detection','Compare color masks and neural detections using the same held-out scenes.','Include bright and dark scenes, visually similar negatives and partial targets. Track precision, recall and result age.',['tools/hsv','projects/color-neural','season']],
['autonomous','Vision-assisted FTC autonomous','Use detections, approach, alignment and fallback states to make a camera-assisted autonomous routine.','Test no target and lost target before increasing speed or adding a scoring action.',['course/module-8','projects/tag-approach','tools/latency']],
].map(([slug,title,description,activity,paths]) => {
  const [lesson, heading, example] = workshops[slug];
  return {
    path:'start/'+slug,title,description,
    sections:[['First activity',[activity]], [heading,[relatedFigure(lesson),example]], ['Learning resources',[{cards:paths}]]],
  };
});
