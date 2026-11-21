export const technicalNotes = {
  '1-1': ['What to send across the software boundary', [
    'For the turning assist, a useful observation carries four pieces of information: the selected target ID, the signed bearing, the source frame identity, and the age or timing information needed to judge freshness. The controller can use that small record without knowing how the picture was acquired or how the marker was decoded. The full frame is useful for debugging the sensing side.',
    'A common failure is to pass only a number. Suppose the camera returns 0 when the target is absent, and the drivetrain reads 0 as “aligned.” That code can finish the approach with the lens covered. Represent the absence explicitly and require a usable observation before testing the angle tolerance.',
  ]],
  '1-4': ['Where the geometry is valid', [
    'The pixel equations use an undistorted image and intrinsics for that specific image size. If an image is resized by one half, both the pixel coordinates and the focal length measured in pixels scale by one half. If you crop 100 pixels from the left edge, the new x coordinate and the horizontal principal point both move by 100 px. Subtracting the old principal point after a crop turns a correct observation into an angular bias.',
    'Range from height needs something in the real world to aim at. A contour centroid that shifts up when part of an object is hidden no longer corresponds to the same point at the same height. Test the range calculation using a marked point before substituting the detector’s centroid. Keep a separate log of misses and unusable geometries so the error summary does not hide them.',
  ]],
  '2-3': ['Choose thresholds from scenes, not a single preview', [
    'Label a small set before tuning. Include a near target, a distant target, a partial target, a confusing background and an empty scene. Freeze the exposure and crop first. Then change one matching threshold at a time and write down which scene changes from a miss to a detection or from a clean negative to a false detection.',
    'If the distant tag has only a few useful pixels, a larger minimum area will make that miss more consistent. If a small false blob comes from glare, the same change may help without affecting the near target. Record the intended operating distance with the chosen threshold so a teammate knows where the tradeoff came from.',
  ]],
  '3-2': ['Write down why a reading cannot be used', [
    {table:{caption:'Example sequence from a robot requesting pipeline 1 with a 100 ms age budget.',headers:['SDK observation','Controller decision'],rows:[['No result yet','Wait without commanding motion.'],['Slot 0, valid, 20 ms old','Wait for the requested slot.'],['Slot 1, valid, 130 ms old','Reject the stale frame.'],['Slot 1, invalid, 20 ms old','Report no usable target.'],['Slot 1, valid, 20 ms old, tx = 0°','Accept the angle and check alignment.']]}},
    'Read and classify one snapshot before using any target fields. Log one reason per rejected result so you can tell whether a failure belongs to the connection, a pipeline switch, target recognition or timing. Count repeated frame reads independently of rejection reasons.',
  ]],
  '4-1': ['How corners become a pose', [
    'Start with four corners on a square of known side length. They have known positions on the printed tag and measured positions in the image. The pose solver asks which rotation and translation place those known points close to the measured pixels when projected through the calibrated camera. The disagreement in pixels is called reprojection error.',
    'On an oblique tag, the projected corners are closer together along one direction. Several poses can then place those corners nearly equally well, particularly when the image is small or noisy. See whether heading stays steady while you hold a correctly decoded tag still at different angles. Decoding and pose quality are separate checks.',
  ]],
  '4-3': ['Convert SDK axes before using the measured pose', [
    'For an upright, forward-facing VisionPortal camera, FTC pose x points right, y forward and z up from the lens. The planar teaching frame on this page instead uses x forward and y left. If the SDK reports x = +0.30 m and y = +1.20 m, the planar vector is (+1.20, −0.30) m. The rightward offset becomes a negative leftward coordinate.',
    'For a front camera mounted 0.12 m ahead of the robot origin with no yaw, the robot-relative tag vector becomes (+1.32, −0.30) m. Use that physical example as a unit test, then test a camera with nonzero yaw. Confirm your adapter reads units from the same source as the pose so a software change cannot quietly convert inches as if they were meters.',
  ]],
  '5-1': ['Why the same color passes in one place and fails in another', [
    'Imagine a red piece (RGB 220, 30, 30) next to a bright white reflection (225, 220, 220). Both can register near red in hue because red is the largest channel. The reflection has very little channel separation, so its saturation is much lower. A saturation floor can reject the reflection without cutting the hue interval around the actual piece.',
    'A shaded red piece presents the opposite problem: the hue may still be usable while value falls below your floor. Sample foreground and confusing background pixels before moving a slider. If both occupy the same HSV range, keep the mask reasonable and use shape, size, or the permitted region to resolve the overlap.',
  ]],
  '7-1': ['How to check transform order on paper', [
    'Use the camera’s own origin as a test point. T_R_C should place (0,0) in camera coordinates at the measured location of the lens in the robot frame. Then T_F_R rotates that mount displacement by the robot heading and adds the robot’s field position. Reverse the order and the test will generally fail because you would be adding coordinates expressed in different frames.',
    'Next, use unit forward and unit left as test points. Their differences from the transformed origin reveal where the two axes point. Finally send the result back through the inverse and check you recover the original coordinates. Those three tests catch translation, rotation sign and frame order mistakes before a pose is fed to a follower.',
  ]],
  '7-2': ['Read the residuals instead of trusting one calibration score', [
    'A calibration program can report one summary number even if the fit is good near the center and poor in the corners. For each held-out frame, compare where the model predicts pattern corners with where the image actually contains them. Plot the differences across the image. A pattern that appears only near the edges can reveal poor coverage or a model that does not capture the distortion.',
    'Use two separate checks afterward. A known straight line at different points in the frame checks image geometry. A surveyed chassis pose checks the camera-to-robot mount and the field reference together. If the image check passes but the field estimate shifts when you rotate the chassis in place, revisit the extrinsics before refitting the lens.',
  ]],
  '7-4': ['Follow one delayed correction through a pose history', [
    'A camera frame is captured when the encoder history predicts x = 1.00 m. That frame later gives vision x = 1.15 m, by which time the live encoder estimate is x = 1.20 m. The capture-time innovation is +0.15 m. Comparing vision with the current estimate instead would give −0.05 m and push the estimate the wrong way.',
    'With a gain of 0.8, the corrected capture-time state is 1.00 + 0.8 × 0.15 = 1.12 m. Replay the +0.20 m of recorded motion after capture to get 1.32 m now. That replay is straightforward in one dimension. A real planar estimator needs to preserve ordered motion increments and heading, since the same wheel motion can lead in a different field direction after a heading correction.',
    'The teaching project uses a scalar correction. Treat the calculation above as the design for a history-based extension. Measure the timestamp behavior and confirm what your sensor publishes before adding a capture-time update to a path follower.',
  ]],
  '8-2': ['Check what a pose correction does to a running trajectory', [
    'Suppose the follower wants x = 2.0 m and the old estimated pose is x = 1.8 m. Its position error is +0.2 m. Accepting a sudden update to x = 2.2 m flips that error to −0.2 m without the robot physically moving. The follower can reverse its request in the middle of an otherwise smooth maneuver.',
    'Record proposed camera corrections separately from accepted estimates. Decide whether your library permits a continuous update, whether a large jump should wait for a stop, or whether the route should be rebuilt. Verify this behavior for the installed follower version on a simple straight route before adding curves and mechanism actions.',
  ]],
  '9-3': ['Distinguish camera cadence from the age of a sample', [
    'A camera can publish a steady 20 frames per second and still deliver measurements 120 ms behind real time. The 50 ms frame interval describes spacing between observations. The age describes how long ago the scene was measured. Record both and write down whether a device timestamp describes exposure, publication, or arrival before using it to extrapolate.',
    'For a quick check, put a sharp visual change in the camera view and use a capture method that can also see the robot’s response or diagnostic indicator. Repeat the measurement rather than relying on a single stopwatch reading. Changing the pipeline or resolution can change the age distribution even if the average camera cadence stays similar.',
  ]],
  '10-1': ['Use missed objects and false triggers to choose a threshold', [
    'Suppose a trial contains 20 labeled objects. At a lower score threshold the detector finds 18 and adds 6 false detections. Precision is 18/24 = 75% and recall is 18/20 = 90%. A stricter threshold finds 14 and adds one false detection. Precision rises to about 93% while recall drops to 70%. Both trials used the same matching rule for class and box overlap.',
    'If a false accept can send the robot toward a field obstacle, choose a threshold with a stronger independent confirmation condition. If a miss merely means the driver presses again, a higher threshold may be acceptable. For aiming, check center or bearing error on matched detections as a separate measure. Label confidence cannot establish that the detector is centered well enough to drive.',
  ]],
  '11-1': ['Show the denominator next to the result', [
    'Imagine two passes over 30 sharp frames and 30 blurred frames. Version A reports all 60 with 2° RMSE. Version B reports only the 30 sharp frames with 1° RMSE. A report containing only those two RMSE numbers makes B look like an across-the-board improvement. Record the accepted fraction and calculate pose error on accepted frames for each condition.',
    'Define the unit of a trial. Consecutive frames from one stationary view measure within-run jitter. Repositioning the robot and setting the fixture again tests reproducibility across runs. Use both if possible, and avoid treating thirty repeated polls from a single image as thirty observations.',
  ]],
  '12-1': ['Trace the frame through VisionPortal', [
    'The portal manages the camera stream and hands frames to processors enabled for that stream. A processor produces observations, while the OpMode reads them at its own cadence. When comparing a camera preview with a processor result, match the scene and timing before deciding the processor ignored something.',
    'For a detection-rate experiment, count an empty fresh list in the denominator. A null read contributes no new frame. For instance, four reads returning null, empty, null, and one accepted detection represent two fresh results and one accepted target. That is one of two frames, even though the loop checked four times.',
  ]],
};
