export const fieldLessons = {
  '8-1':['Give every autonomous state an exit',[
    'Start acquisition with the drive stopped. An allowed ID, usable range and two distinct observations can qualify a target. Turn at limited power until bearing is close enough to drive forward. In approach, check the same target and a credible standoff each loop. Send zero as soon as the observation expires or the overall timer runs out.',
    'Walk through a trace where the robot sees the tag twice, loses it during alignment and sees it again just before the deadline. Write the command on each line. Decide whether the reappearance should restart acquisition or whether this run should abort. If the logic can skip directly from loss to full approach, add a clear transition that rebuilds evidence.',
    'Keep a fallback that you can verify on the same test fixture. On a first practice run, a stopped robot is a valid fallback. More ambitious fallback paths need independent clearance and timing assumptions.',
  ]],
  '8-2':['Check the localizer contract before moving the robot',[
    'A path follower compares a desired trajectory with a pose supplied by its localizer. Find the installed library version’s units, axes and pose update entry point. Keep vision corrections inside the pose-estimation boundary. If multiple parts of the program set the follower pose, the result can depend on loop order.',
    'Put the robot at an arbitrary documented origin and push it one measured foot forward without rotating. Your adapter should produce 0.3048 m if its internal unit is meters. If the follower expects inches, it receives 12 inches after conversion. Then turn exactly a quarter turn and check that the sign and heading units agree.',
    'Replay a vision correction before allowing the follower to command motors. A pose step can create a sudden change in tracking error. Log uncorrected pose, proposed correction and applied pose separately. Test the transition both while stopped and during an easy straight path.',
  ]],
  '8-3':['Separate ordinary drift from a relocalization event',[
    'Compute the difference between a vision observation and the estimated pose at the same capture time. Compare position in the same units and wrap heading deltas around the shortest rotation. A large position difference while moving can come from a timestamp error, an incorrect tag or genuine drift. Record the cause where you can observe it.',
    'If the predicted and observation standard deviations are each 0.10 m and their errors are independent, the residual standard deviation is about 0.14 m. A residual of 1 m is roughly seven standard deviations. Reject it under a normal tracking policy. If surveyed evidence confirms the robot really is a meter off, plan a separate stopped relocalization step.',
    'Replaying a bad pose should leave the live follower state unchanged. If a trusted correction changes the starting point materially, decide whether the remaining route can still be followed or should be regenerated from the new pose. Save a log of the command just before and after the correction.',
  ]],
  '8-4':['Walk the practice run before adding a scoring mechanism',[
    'Treat acquisition, alignment, approach and verification as separate stages. In the practice OpMode, each stage shares one time budget and exits to a neutral command on target loss or cancellation. Verification requires fresh frames near standoff. A match routine can build on that structure, but you need to account for the specific mechanism and route.',
    'Try a starting pose where the tag is initially at the edge of view. Record the stage transition times. Then repeat with the target removed during alignment and again after forward motion starts. Use a camera-disabled run to verify that the robot cannot reach the scoring state solely because a timer expired.',
    'Before enabling any mechanism, give that state its own prerequisites, such as a bounded distance, confirmed alignment and a ready signal. Decide which result proves completion, how long to wait and which command is safe on failure. Budget backward from the time that must remain for fallback.',
  ]],
  '9-1':['Keep a track through noisy frames without inventing evidence',[
    'A track stores the identity, last accepted position, timestamp and a motion estimate. Map the new measurement to a track before filtering it. At a crossing, selecting the closest visible center with no gate may switch identities. Estimate where each track should move, then reject associations that need implausible motion.',
    'Compare the readings 8, 9, 70, 9, 8. A centered three-sample median at the spike is 9. An exponential filter with α = 0.25 starting from 9 rises to 24.25 at the spike and falls gradually afterward. Repeat with a real step from 9 to 20 to see the cost of suppression. Use only present and past samples in a live causal filter.',
    'Track three metrics in a replay: delay on a real step, error on an isolated spike and identity swaps. A missing observation can be predicted for a short interval, but maintain a flag so the controller knows it has stopped receiving direct evidence.',
  ]],
  '9-2':['Subtract robot motion before calling the target moving',[
    'Take two position observations from the same target at their capture times. If both are already in a common frame, divide the displacement by elapsed time to estimate velocity. With a camera on a translating or turning robot, transform each observation using the historical robot pose first. Applying today’s robot pose to both images hides some of the camera motion.',
    'As a simple straight-line example, a fixed tag reads 2.00 m ahead and then 1.94 m ahead 0.12 s later. In the robot frame that is −0.50 m/s of relative velocity. If the robot moved forward 0.06 m over that interval, both field positions agree. If the target also moves, that cancellation is partial.',
    'Compute velocity only from distinct observations of the same target. Set a minimum interval so a tiny timestamp delta cannot amplify pixel jitter. Replay a visible target change to verify that a new identity resets the velocity estimate.',
  ]],
  '9-3':['Put the clocks on a timeline',[
    'Write down when the camera exposed the image, when the software finished processing, when the hub read the result and when the controller applied effort. Identify each clock. Durations measured on one clock can be useful without knowing its offset to another. Subtracting absolute timestamps from different clocks requires synchronization or a documented conversion.',
    'At a relative speed of 0.8 m/s, a 150 ms time gap implies 0.12 m of displacement. A predictor can add that displacement to the old observation if its velocity is accurate. If it assumes 1.2 m/s when the robot is really moving at 0.8, the correction itself adds 0.06 m of error.',
    'Try the simulator with acceleration and with an incorrect velocity estimate. Compare error before and after compensation at several ages. Set a maximum extrapolation horizon and age cutoff from that evidence. A steady straight run is the easiest case for the predictor.',
  ]],
  '9-4':['Predict the target ray, then bound the command',[
    'Estimate the future target and robot positions for the same actuation time. Subtract and rotate into the robot frame, then compute the desired bearing with atan2. If working directly in angles, compute the shortest signed angle difference. A change from +179° to −179° is about +2° under the usual wrap convention.',
    'A target moving sideways at 0.4 m/s across a range of 2 m has instantaneous bearing rate about 0.2 rad/s at the centerline. At a 100 ms horizon it moves about 1.15° in bearing. At 0.5 m range the same lateral speed implies a much larger angular rate. Check both range and velocity before adding feedforward.',
    'Test a stationary target with a moving robot, then a moving target that reverses. Log raw angle, predicted angle, effort, and any cap reached. Prediction can improve a steady sweep while overshooting the reversal. Set limits so an uncertain prediction cannot command a large correction by itself.',
  ]],
  '10-1':['Grade the label and the box separately',[
    'A classifier chooses labels for a whole input or crop. A detector returns one or more boxes and associated scores. A high class score may correctly identify a game piece while the box center is too far off for steering. Evaluate box position or bearing error separately from confidence.',
    'Suppose a predicted and true box overlap by 60 px² and cover a union of 100 px². Their intersection over union is 0.60. At a 0.50 acceptance threshold the detection can match, assuming the class is right and the object has not already been matched. A second overlapping detection for the same object can still count as a false positive.',
    'Sweep a confidence threshold on held-out scenes. For each value report precision, recall and example errors. Choose the threshold based on what the robot does with a false positive and whether an independent safety check can catch it.',
  ]],
  '10-2':['Split by recording session before you train',[
    'If you randomly split frames from a video, nearly identical images can appear in training and test. Put an entire session or location in one split. Give each file a stable source and session ID so you can audit the split later. Collect examples that vary distance, lighting, partial visibility and background on purpose.',
    'Capture the field tape and backdrop without a piece. Those empty scenes are hard negatives when the background looks like the class. For consistency, decide how to label partly hidden objects, tiny objects and overlapping objects before multiple teammates annotate them.',
    'Check that augmentation preserves labels. A rotation may be reasonable if real pieces rotate, while a hue shift that turns one labeled color into another can corrupt the target. Keep usage permissions in the manifest and evaluate on separate real images before trusting the augmented scores.',
  ]],
  '10-3':['Verify the actual exported model on the camera',[
    'Start with the vendor’s supported training and export workflow for your firmware. Write down input shape, channel order, resizing and class order before export. Save the model, labels and firmware version together. A model that loads with the wrong class order can produce reasonable-looking boxes for the wrong names.',
    'Run the same small set of known examples before and after deployment. Include one image per class, a blank frame and a scene with two classes. If predictions change, isolate resize, normalization and quantization before retraining. Rate and latency also need to be measured on the device that will run the model.',
    'Declare an acceptance threshold before testing. Report precision and recall for the held-out session and the result age at use. An otherwise accurate model that returns results too late for the robot’s motion can still be useful if the robot slows or checks only while stopped.',
  ]],
  '10-4':['Define the Python output so Java can reject it',[
    'Start with a clear contract: the supplied example sends validity, centroid x in pixels, centroid y in pixels and area in square pixels. The Limelight entry point receives an image and robot inputs and returns a contour, a display image and the numeric payload. Use the documented BGR input convention before converting to HSV.',
    'Test an empty scene, a large yellow disk and two small flecks. For the empty scene, return the invalid payload and no contour. When a contour survives the minimum area, check its moment before dividing to find the centroid. Reuse simple buffer operations and measure device timing rather than assuming a desktop run reflects the camera.',
    'In the OpMode check the length, validity and finite values before reading the centroid. A pixel offset is not an angle. Pass the centroid through the camera geometry before using it for aiming, and record which image resolution the calculation assumes.',
  ]],
  '11-1':['Count the misses before calculating pose error',[
    'Survey ground truth with a fixture you can reposition. At each marked pose, record the requested number of distinct frames, the number with accepted observations and errors for the accepted subset. Repeat the setup if measuring the fixture itself introduces noticeable error. State how ground truth was checked.',
    'If three signed errors are −2°, 0° and +2°, their mean is 0° but the RMSE is about 1.63°. If seven of ten frames had no pose, that RMSE describes only the three accepted frames. Report the 30% accepted rate alongside it so a selective detector cannot look reliable by dropping difficult observations.',
    'Report statistics for the conditions your robot actually uses. For example, summarize a near frontal view separately from a far oblique view. A pooled mean can hide failures in one part of the approach.',
  ]],
  '11-2':['Change one environmental variable per trial',[
    'Make a small test matrix with fixed target positions and distinct lighting conditions. Reproduce glare by moving the light, reproduce shadow by introducing an occluder, and reproduce motion blur with the same light and a controlled turn. Keep the baseline exposure and mounting fixed across the first pass.',
    'When the far target fails in a moving run, stop the robot without changing light or settings and capture another frame. A crisp stationary result points toward motion or vibration. A washed-out stationary frame suggests lighting or exposure. Save the two frames so another teammate can verify the diagnosis.',
    'After changing one setting, rerun the weak condition and a held-out condition. Improving one trial by overfitting the crop or color thresholds can hurt an adjacent lighting condition. Report which condition still limits the usable envelope.',
  ]],
  '11-3':['Report age, throughput and control jitter separately',[
    'Collect a monotonic hub timestamp on each control tick and a frame identity with each camera result. Count unique results in one second for throughput. Compute age with the vendor’s timing definition and record how often the loop runs late. A quick camera and a slow consumer can still produce old observations.',
    'If the robot polls every 20 ms and the camera emits every 50 ms, about five polls occur for every two capture frames. Treating all five as distinct would report 50 Hz for a 20 Hz stream. A useful trace counts both and marks periods when the average hides a long gap.',
    'Run the same fixture with fine-grained logging enabled and disabled. A logging overhead problem shows up as control-loop jitter even when the camera rate remains stable. Use an external synchronized stimulus when the number you need is exposure-to-actuation delay.',
  ]],
  '11-4':['Rehearse the faults you can reproduce in the pit',[
    'Keep a known target, short diagnostics OpMode and configuration revision available. Confirm the preview looks usable, the requested pipeline matches the result, the known target is identified and observations are recent enough for the task. Write down expected signs and units so a replacement camera can be checked the same way.',
    'Test an occluded lens, a wrong pipeline and a disconnected camera separately in practice. In each case record which diagnostic distinguishes it and how the robot falls back. Confirm driver control or neutral output independently. A reliable camera restart matters less if the drivetrain cannot be controlled during the outage.',
    'Record the exact software versions and repeat the small suite after wiring, mount or camera changes. Translate the checks into a short handoff that a teammate can run without the original programmer present.',
  ]],
  '12-1':['Distinguish a fresh empty frame from an idle processor',[
    'Build the processor and VisionPortal with the configured camera, check its streaming state, and release it in finally. A portal can manage more than one processor. Enable only the ones you need for a test and establish a baseline before measuring processor load or changing camera controls.',
    'When using getFreshDetections, null means there is no new detection list for this read. An empty fresh list means a frame was processed with no detections. Count the second in your detection denominator. If you query the latest list repeatedly instead, use the acquisition timestamp when you need distinct observations.',
    'In SDK 12.0 distinguish single detections from named clusters. In both cases check pose availability before using it. Test a known visible tag, an empty scene and an intentionally disabled processor. Those three conditions should be recognizable in the log.',
  ]],
  '12-2':['Make the simplest OpenCV pipeline inspectable',[
    'Make a small synthetic image with red and blue regions to verify the frame channel order before choosing a conversion constant. Convert to HSV, threshold, and display the binary mask. Add contours and geometry once the mask itself is meaningful. Keep one saved image per regression you want to reproduce.',
    'A 640 × 480 RGB8 image contains 921,600 raw image bytes before padding or extra buffers. A mask at the same size needs about 307,200 bytes with one 8-bit channel. Reusing working matrices can matter when several conversions run per frame. Follow the SDK lifetime contract and avoid retaining a reference to a frame the camera thread may reuse.',
    'Compare a known disk before and after a morphology operation. Record pixel area, centroid and processing time. If a distant disk disappears, choose a smaller kernel, use a different test condition, or leave that operation out.',
  ]],
  '12-3':['Account for every device and link in the camera path',[
    'Sketch the camera, processor, Control Hub, data links and power connections. Identify which links are required for control and where results are buffered. Start with a legal, documented topology. Evaluate custom processing for bench use separately until the current manual and official guidance establish what can be carried into competition.',
    'A link can move small messages with ample bandwidth and still delay a measurement behind a queue. Test by changing a target abruptly and recording when each component reports the change. Disconnect the link in a bench test and verify that stale values do not remain eligible for control.',
    'Include field recovery in the topology choice. Ask how you will tell a powered but stalled device from a disconnected one and which parts can be replaced without rebuilding the camera mount or software.',
  ]],
  '12-4':['Choose from paired trials on your robot',[
    'Use the same target, scripted motion, lighting and surveyed fixture for both camera architectures. If mounts differ, transform both results into the same robot frame. Alternate which setup runs first so lighting drift or repeated setup errors do not consistently favor one option.',
    'At 60°/s, 50 ms of delay corresponds to 3° of motion and 200 ms to 12°. Do not add those figures blindly to a mean error. Use them to decide whether delay deserves a separate moving trial. Record static error, robot tracking error, result age and accepted fraction for each setup.',
    'Complete the comparison with installation and recovery time, software dependencies, and availability of spares. The winner can differ for static localization and moving alignment. Keep the trial data so the next team can rerun the comparison when hardware or firmware changes.',
  ]],
};
