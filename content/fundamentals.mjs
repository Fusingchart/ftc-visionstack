export const fundamentals = [
[
  ['Start with the robot’s question',[
    'Suppose your drive team wants a button that turns the robot toward a particular AprilTag. Before choosing a camera, write down what the drivetrain needs: the horizontal angle to that tag, the age of that measurement, and a way to tell when the measurement is unusable. A photo alone answers none of those questions for the control loop.',
    'Start with the robot stationary. Point the camera at the tag and move the tag from the center to the right. Write down what you expect to happen to the angle, then look at the reported value. Repeat on the left. Which number should the drivetrain receive when someone puts a hand in front of the lens? In a first bench test, have the robot report a requested turn in telemetry and leave the motors disconnected from that decision.',
  ]],
  ['From one image to one observation',[
    'During exposure, the sensor collects light. The result is an array of pixel values, each describing a small region of the image. The picture already has limits: if the tag is blurred or only a few pixels wide, the later stages cannot reliably recover the corners you need. Look at the live preview before making a detector change.',
    'A tag detector searches for a recognizable pattern in those pixels. It may report an ID and four image corners. At that point you know which marker was seen and where its corners fell on the image. With camera calibration and the known printed side length, a pose estimator can use those corner correspondences to infer the tag’s position and orientation relative to the camera. For a simple turning assist, an angle to the tag center can be enough.',
    'The robot then selects an observation and applies its own rules. Two tags in the frame can both be genuine while only one is relevant to the task. Likewise, 0° is a perfectly usable measurement for a centered tag. Represent loss explicitly so it cannot masquerade as a zero-error reading.',
  ]],
  ['Worked example',[
    'Consider a camera that publishes one result every 50 ms and a robot loop that reads the latest result every 10 ms. The alignment rule requires three distinct centered observations. Assume zero processing delay here so we can see what the polling loop does on its own.',
    {table:{caption:'Illustrative trace. The robot sees the same camera result on several reads.',headers:['Robot time','Camera frame','Bearing','Centered frames'],rows:[
      ['0 ms','41','+1°','1'],['10 ms','41','+1°','1'],['20–40 ms','41','+1°','1'],['50 ms','42','+1°','2'],['100 ms','43','+6°','0'],
    ]}},
    'A counter that increments on every robot tick would announce alignment at 20 ms, even though only one image supported it. A frame-aware counter waits. Frame 43 turns out to be outside tolerance and resets the count. Real cameras add processing and delivery delay, so a result arriving now can still describe where the tag was several control iterations ago.',
    'Use a vendor-documented timestamp or frame identity to recognize repeats. Use a separate freshness check to decide whether the last observation is still recent enough to control with. Log both once and you can tell the difference between a slow camera, repeated reads, and a tag that genuinely vanished.',
  ]],
  ['Try it on a stationary robot',[
    {steps:['Open the telemetry viewer with a known target and keep motor output disabled. Record a centered angle and then move the target to either side.','Log the robot’s loop time, the available result identity, validity, and reported age. Collect a short trace with a visible target, then cover the lens.','Mark the rows when the camera actually supplied new evidence. Explain which reading you would send to the drivetrain, and when you would stop sending it.']},
    {cards:['projects/telemetry','course/lesson-3-2']},
  ]],
],
[
  ['Pick a camera setting you can test',[
    'Imagine the tag looks sharp on the cart and turns into a streak during a turn. Spend a run changing exposure before buying a higher-resolution camera. Lock the mount, light level and target position. Run the same turn at a long and short exposure, saving one stationary image and one moving image at each setting. That gives you a way to separate focus from motion blur.',
    'Exposure is the time the sensor spends collecting light for a frame or row. Frame rate tells you how often a frame is produced. You can get thirty blurred frames per second if each frame collects too much motion, or thirty darker, sharper frames per second after shortening exposure. Gain can brighten the signal, but it also amplifies noise. Check whether your detector still sees the dark border after reducing exposure.',
    'Rolling-shutter sensors read different rows at different times. A spinning robot can make a rectangular marker appear skewed even if each row looks sharp. A global shutter exposes the rows together, although a long exposure still permits motion blur. Compare frozen and moving shots before blaming lens distortion, which is visible at rest and often most obvious near the edges.',
  ]],
  ['Worked example',[
    'Say a vertical tag edge travels 250 pixels per second across the image. During a 20 ms exposure it moves 250 × 0.020 = 5 pixels. At 4 ms the motion covers 1 pixel. If the distant tag is only 24 pixels wide, the difference matters because the corner detector has comparatively little crisp edge to work with.',
    'Now stand twice as far away. At the same focal length, a flat frontal marker occupies roughly half as many pixels per side. A wider lens also puts fewer pixels on it at the same distance and resolution. Use a wide view if you first need to find a target that can be far from center. Check the narrower view when the task depends on reading distant corners.',
  ]],
  ['Where to bolt it down',[
    'Watch the camera preview with the arm or intake in every position used during the routine. Check cable travel and confirm the camera cannot twist when the cable pulls. Pick an easy-to-measure reference on the chassis and record the camera’s position and orientation there. Otherwise even a good target pose can become a bad robot pose.',
    {cards:['tools/camera','course/lesson-7-2']},
  ]],
],
[
  ['Follow the image, then follow the result',[
    'With a webcam and VisionPortal, the Robot Controller manages the stream and runs the processors attached to the portal. With a Limelight 3A, the camera runs the selected pipeline and the robot reads its results. Draw those two paths before comparing features. It helps explain which device you need to configure and what you can inspect when the robot stops receiving measurements.',
    'AprilTag detection and color-based detection address different scenes. A tag gives you a known pattern and correspondence points, which makes pose estimation possible once the camera and marker geometry are known. A yellow game piece on a gray mat might only need a color mask and a contour. If tape and reflections produce similar regions, give the detector a better test set before deciding it needs a neural model.',
    'OpenCV is a library for implementing operations such as conversion to HSV, contour extraction, and camera calibration. A neural detector gives you class scores and image boxes. Decide where the code will run and what it returns. Then decide whether the returned observations are enough to control with.',
  ]],
  ['Worked example',[
    'For a tag-alignment task, record the fraction of intended poses where the correct tag is visible, the 95th-percentile observation age, and the angle error near the final pose. For a loose object, add lookalikes and record false positives as well as misses. A 30 Hz stream gives a nominal frame interval of 33 ms, but an overloaded processor or delayed delivery can make the age at use much larger.',
    'Try reading the two systems against the same stationary tag and use the same coordinate sign in your log. Then introduce motion. If you choose an architecture, write down which actual failure drove the decision, such as loss of distant corners or unstable age under loop load.',
    {cards:['projects/webcam-comparison','course/lesson-12-4']},
  ]],
],
[
  ['A pixel gives you a direction',[
    'Put the lens center at the origin. Let camera X point right, Y point down, and Z point forward. In the ideal pinhole model, the image x coordinate is cx + fx·X/Z, where cx is the horizontal principal point and fx is the focal length measured in pixels. A point twice as far right and twice as far forward gives the same X/Z and lands on the same pixel. One pixel alone cannot tell those two points apart.',
    'To recover bearing, subtract the principal point first. The rightward bearing is atan2(x − cx, fx). If x = 480 px, cx = 320 px and fx = 320 px, the pixel is 160 px right of the principal point and the ray points about 26.6° right. With an image width of 640 px, that same focal length would place the image edges near ±45° in the ideal centered model.',
    'The image y axis points down, so an image point above the principal point gives a positive elevation when you use cy − y. Keep units explicit. Java’s trigonometric functions use radians. Vendor telemetry may report degrees or use a configurable crosshair as the zero reference.',
  ]],
  ['Worked example',[
    'Suppose the target is 0.40 m above the camera and the target ray is 15° above horizontal. In the vertical center plane, tan(15°) = rise / horizontal range, so range is 0.40 / tan(15°) ≈ 1.49 m. If the camera is pitched up 10° and the ray points 5° up from its optical axis, add them in this plane to get the same 15°. For a general off-axis pixel, rotate its 3D ray and intersect the known height plane.',
    {table:{caption:'The same target height with different measured elevations.',headers:['Elevation','Horizontal range'],rows:[['5°','4.57 m'],['6°','3.81 m'],['15°','1.49 m'],['16°','1.40 m']]}},
    'One degree changes the estimate by 0.76 m near 5° and only 0.09 m near 15°. A near-horizontal ray is a poor range cue. If the measurement flips sign or produces an implausible range, report it as unusable and keep that result out of the approach controller.',
  ]],
  ['Check the geometry with a tape measure',[
    'Mark three horizontal distances measured from the camera, then place a target at a known height. Use a level or inclinometer to measure camera pitch. Compare estimated and measured distances first on the centerline, then off to one side. Record where the simplified model starts to break down. Repeat after tilting the camera by a few degrees to see what a loose mount does to the estimate.',
    {cards:['tools/camera','projects/distance-bearing']},
  ]],
],
];
