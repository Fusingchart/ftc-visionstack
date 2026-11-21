import { refs } from './references.mjs';

const figure = (figure, alt, caption) => ({figure, alt, caption});

export const simulationLessons = {
  pid: [
    ['The alignment problem', [
      'Suppose a tag starts 30° right of the camera centerline. The controller must turn the chassis toward it and slow down before it overshoots. It sees an angle measurement and asks for a normalized motor command between −1 and +1. The motor changes angular velocity. The plot shows the resulting true error, which the simulated controller only observes after the selected delay.',
      {simulator:true},
    ]],
    ['From angle error to motor command', [
      'The proportional gain Kp multiplies the current error. Integral gain Ki multiplies the accumulated degree-seconds of error. Derivative gain Kd multiplies the change in error per second. The terms all produce normalized output and are added before the output limit is applied. The model holds back integral accumulation if it would push a saturated command farther in the same direction.',
      figure('pid-terms','The proportional term points right, the derivative term points left, and the sum is a smaller right turn.','Illustrative PID decomposition. A positive error that is already shrinking can produce a negative derivative term.'),
      'Inertia determines how much the robot resists a change in speed. Damping opposes existing rotation. The simulator integrates velocity from acceleration, then integrates angle from velocity. Real drivetrains also have static friction, backlash and voltage limits that this model omits.',
    ]],
    ['Worked example', [
      'Set Kp = 0.020, Ki = Kd = 0, setpoint = 30°, motor cap = 0.30, damping = 2, inertia = 1, noise and delay = 0, and loop rate = 50 Hz. On the first step the error is 30°, so the raw request is 0.60 and the applied request is 0.30. The model uses a torque scale of 120, so the initial angular acceleration is 36°/s². After 0.02 s the angular velocity is 0.72°/s and the simulated heading has advanced 0.0144°.',
      'Keep the gains and add 200 ms of delay. The controller can continue asking for a turn based on earlier headings, even after the plotted true error approaches zero. Compare the error crossing and overshoot. Settling means the last part of this six-second run stays within ±2°. A run marked “outside run” did not meet that definition during the simulated window.',
      figure('pid-loop','Command passes from controller to chassis. A camera sends an angle measurement back to the controller after a delay.','The robot moves while the camera observation is in transit. The return path determines which angle the controller can use.'),
    ]],
    ['Robot application', [
      'Start with a known motor polarity and a small step on a safe fixture. Log true or independently observed heading, frame identity, age and applied effort. This model updates on a regular tick and rounds delay to whole ticks. On a robot, derive the sample interval from distinct measurements and reset on target loss.',
      {cards:['course/lesson-6-2','projects/turret']},
      {links:[refs.FARM]},
    ]],
  ],
  frames: [
    ['Why the same tag has several coordinates', [
      'A field point has one physical location. Its coordinates change when you describe it from another origin or with another set of axes. The simulator shows four frames: the fixed field, the robot chassis, the camera attached to it, and the tag. All translations use meters and positive yaw is counterclockwise.',
      {simulator:true},
    ]],
    ['Compose the mount, then invert the camera pose', [
      'A planar transform rotates a vector and then adds a translation. To find the camera pose in the field, rotate the camera’s mount offset by the robot heading and add the robot’s field location. Add mount yaw to robot yaw. To express a field point in camera coordinates, subtract the camera’s field location and rotate the remaining vector by the negative camera yaw.',
      figure('frames','The field, robot and camera axes have different origins. The camera is attached to the robot and the tag is ahead.','A mount offset is given in robot axes. Its field direction changes when the chassis rotates.'),
    ]],
    ['Worked example', [
      'Set robot field position to (1, 0), robot yaw to 90°, camera mount to (0.20, 0) with zero yaw, and tag field position to (1, 1) with yaw 0°. The camera mount points along robot forward. At 90° that turns into +0.20 m along field y, so the camera is at (1, 0.20) facing +90°.',
      'The tag is (0, 0.80) m from the camera in field axes. Rotating that vector by −90° gives (0.80, 0.00) m in camera axes, and the relative yaw is −90°. Now vary robot yaw and leave the field tag unchanged. Its reported position in camera axes changes because the camera moved and rotated.',
      {table:{caption:'The same example expressed in three coordinate frames.',headers:['Quantity','Position','Yaw'],rows:[['Robot in field','(1.00, 0.00)','90°'],['Camera in field','(1.00, 0.20)','90°'],['Tag in camera','(0.80, 0.00)','−90°']]}},
    ]],
    ['Robot application', [
      'The teaching convention uses x forward and y left in the robot and camera frames. FTC VisionPortal uses x right, y forward and z up for its upright camera pose output. Convert axes and distance units at the API boundary. For a pitched camera or a tag on a tilted surface, use a 3D transform instead of this planar model.',
      {cards:['course/lesson-4-3','course/lesson-7-1']},
      {links:[refs.AXES]},
    ]],
  ],
  hsv: [
    ['Which pixels belong to the piece?', [
      'An intake camera sees objects, floor tape and reflected lights at once. A color threshold asks which pixels meet a color rule. The explorer shows the original image, the binary mask and the connected regions derived from the mask. Uploaded images are processed in the browser and scaled to a maximum of 440 pixels on the longest side.',
      {simulator:true},
    ]],
    ['Hue, saturation and value', [
      'Hue is an angle around the color wheel. Saturation describes how far the color is from gray relative to its strongest channel. Value is the strongest RGB channel scaled to a percentage. A pixel passes when its hue is inside the interval, saturation meets the floor, and value meets the floor. Red lies across 0°, so an interval from 345° through 25° accepts hues near either end of the numeric scale.',
      figure('hsv-mask','An input image has a yellow disk, a blue strip and a reflection. The mask retains the disk alone.','White mask pixels pass the rule. The contour and bounding box are computed after thresholding.'),
    ]],
    ['Worked example', [
      'Choose the dark practice surface and set hue from 345° to 25°, minimum saturation to 45%, minimum value to 35% and minimum area to 20 px. Hold the hue bounds fixed while raising the value floor to 65%. The darkest red disk should disappear even though its hue is still permitted. Lower the value floor again and raise the minimum region area to 500 px. Compare the mask and the region count: the area filter changes which regions are reported after the pixels have already passed.',
      'The region finder uses four-neighbor connectivity. Pixels touching on a horizontal or vertical edge are neighbors. Pixels meeting only at a corner form separate regions. The minimum size counts pixels at the processing resolution, so the same disk can cross the cutoff if you resize the image.',
      figure('mask-connectivity','Two pairs of pixels are shown. Adjacent cells share an edge and belong to one region. Diagonal cells touch at a corner and are two regions.','Four-neighbor connectivity groups edge-sharing pixels. Region size counts the pixels in each group.'),
    ]],
    ['Robot application', [
      'The explorer uses hue in degrees. Standard 8-bit OpenCV HSV uses hue bins from 0 to 179. A wraparound red range generally needs two masks combined with OR. Sample your own camera under shadows and competition lighting. The resulting color filter is a detector input and still needs a target-selection policy.',
      {cards:['course/lesson-5-1','projects/color']},
      {links:[refs.CV]},
    ]],
  ],
  localization: [
    ['How far has the robot actually traveled?', [
      'Wheel odometry estimates distance by integrating motion. A small speed bias adds up over time. A tag observation can estimate field position directly, but it arrives intermittently and can contain large errors. The plot compares a known simulated path, encoder-only odometry, accepted camera updates and the fused estimate.',
      {simulator:true},
    ]],
    ['Predict, compare, correct', [
      'Between observations, the filter advances position from encoder displacement and increases its predicted variance. When vision arrives, subtract the predicted position from the observation. This difference is the innovation. Reject it if its magnitude exceeds the gate. A valid innovation is multiplied by the filter gain, then added to the prediction.',
      figure('innovation-gate','A predicted position is centered in a shaded acceptance band. A near vision point is inside and a large outlier is beyond the right boundary.','The gate is measured from the predicted state. An observation outside the band leaves the prediction in place.'),
    ]],
    ['Worked example', [
      'Set noise to 0 m, interval to 10 ticks, drift to +0.10 m/s and gate to 0.60 m. Each tick is 0.10 s, so tag observations arrive every second. After 3 s the true position is 1.20 m and encoder-only odometry is 1.50 m. The third scheduled post-start observation contains the injected +1.30 m error, so the reported 2.50 m is rejected. Look for it on the rejected series, then see the estimate recover at the next usable observation.',
      'Raise the gate and watch what happens as the false observation becomes eligible. Lower the gate too far and an observation can be rejected even when it is correct, particularly after long intervals with accumulating drift. A gate is a consistency check with the current estimate, so manage what happens after repeated rejections.',
    ]],
    ['Robot application', [
      'This model follows one axis at 0.4 m/s and corrects observations immediately. Live FTC localization needs a defined field frame, calibrated mount, static or known landmark pose, and time alignment. When camera results arrive late, compare them with the predicted pose at capture and replay subsequent motion.',
      {cards:['course/lesson-7-4','projects/odometry']},
      {links:[refs.TAG]},
    ]],
  ],
  latency: [
    ['What position did the camera actually measure?', [
      'A robot and a target move while the camera frame is processed. The delivered result describes their separation at exposure time. The simulator compares that old separation with the current separation, an extrapolated estimate, and two bounded response traces. Those traces model a controller trying to follow each position estimate.',
      {simulator:true},
    ]],
    ['Extrapolate the relative motion', [
      'Find relative velocity by subtracting robot speed from estimated target speed. Multiply it by the interval from exposure to the present and add that displacement to the measured separation. A timestamp must identify the observation time in a compatible clock. A regular frame rate does not establish the age of a particular result.',
      figure('latency','Exposure, result-ready time, hub read time and command occur in that order.','The frame interval is the spacing between exposures. End-to-end delay follows one frame until its measurement affects a command.'),
    ]],
    ['Worked example', [
      'Set target velocity 1.00 m/s, robot velocity 0.40 m/s, delay 250 ms, acceleration 0, and estimated target velocity 1.00 m/s. Relative velocity is +0.60 m/s. After the initial quarter-second, the camera separation is 0.15 m behind the true one. The predictor adds 0.60 × 0.25 = 0.15 m. The predicted measurement matches position here, while the limited controller response still takes time.',
      'Change the estimated target velocity to 0.60 m/s and leave actual motion alone. The predictor now adds just 0.05 m, leaving −0.10 m residual error. Add acceleration and notice that using an initial velocity estimate increasingly underestimates a target that moves faster over time.',
      figure('latency-distance','On one ruler the raw point is 0.15 m behind truth. A 0.05 m correction leaves 0.10 m error; a 0.15 m correction reaches truth.','At constant speed the distance error scales directly with elapsed capture time.'),
    ]],
    ['Robot application', [
      'Measure which time span the device reports and decide how old a result can be before discarding it. Constant-velocity compensation is approximate during turns and acceleration. Limit the prediction horizon and compare with an independent reference on a fixture.',
      {cards:['course/lesson-9-3','projects/moving-target']},
    ]],
  ],
  fusion: [
    ['What does each sensor contribute?', [
      'Encoders estimate displacement along the robot’s heading. The IMU estimates that heading. A camera supplies intermittent field position observations. The model projects encoder motion onto one route axis using the IMU reading, then compares a fixed half-and-half correction with a correction weighted by predicted and observation uncertainty.',
      {simulator:true},
    ]],
    ['Let uncertainty determine the correction', [
      'Variance measures uncertainty in squared units. If predicted position variance is P and observation variance is R, the scalar gain is K = P / (P + R). Multiply the innovation by K to find the correction. A camera measurement with large R has less influence. The model rejects unusually large innovations before applying its weighted correction. Its simple averaging comparison uses every observation.',
      figure('fusion-gain','A position line has prediction at 1.0 m, naive average at 1.2 m, weighted result at 1.32 m, and camera at 1.4 m.','When camera uncertainty is low, the weighted estimate can move farther toward the observation than a simple average.'),
    ]],
    ['Worked example', [
      'Suppose the predicted position is 1.00 m and vision reads 1.40 m. With P = 0.04 m² and R = 0.01 m², K is 0.8 and the estimate becomes 1.32 m. With R = 0.16 m² it becomes 1.08 m. Both measurements say 1.40 m, but the second carries more uncertainty. The equal-weight result is 1.20 m in both cases.',
      'In the explorer set observation interval to 10 ticks, drift to 0.10 m/s, gate to 0.60 m and IMU noise to 0°. Compare vision noise 0.10 m with 0.40 m. In the simulator that slider changes both the generated observations and the filter’s assumed variance, so compare the full trace and rejected points. Then raise IMU noise and observe how heading affects forward displacement through the cosine projection.',
    ]],
    ['Robot application', [
      'The model’s covariance is scalar and it applies observations at once. A planar robot estimator must account for x, y, yaw, timing, and potentially correlated errors. Log the innovations and compare corrected motion with surveyed positions before using fusion to steer.',
      {cards:['course/lesson-7-4','tools/localization','projects/odometry']},
    ]],
  ],
};
