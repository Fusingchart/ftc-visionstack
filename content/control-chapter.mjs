// These lessons share a bench fixture so readers can carry the same signs and measurements forward.
export const controlChapter = {
  '6-1': [
    ['The job of the controller', [
      'Imagine a tag taped to a wall and a robot that only needs to face it. The camera is fixed to the chassis. The driver holds a button to request assist, and a fresh observation gives the horizontal angle from the camera’s centerline to the tag. The robot can turn left or right. Facing the tag is the entire job here. Driving toward it and squaring up to the wall require more measurements.',
      'Define a positive error as “tag to the right” and a positive command as “rotate the chassis to the right.” If your camera API reports the opposite angle sign, do the conversion in the camera adapter. If a test pulse makes the tag move farther from the center of the image, release the enable and check both signs. This sign check comes before gain tuning.',
      'The camera measures an angle. The controller computes an output request from it. The drivetrain applies that request, and only a later image tells you what happened. This loop explains the word feedback. A scripted pulse can turn the chassis, but it does not check where the tag ended up.',
    ]],
    ['Worked example', [
      'The tag starts 10° to the right. Multiply by a proportional gain of 0.020 output per degree to request 0.20. With a 0.15 output cap, the drivetrain receives 0.15. Once the tag is 3° right, the request is 0.060 and the cap has no effect. These are normalized drivetrain commands. A command of 0.15 does not specify a particular angular speed.',
      'Now cover the tag while the robot is still commanding a turn. The old 3° measurement may still exist in the camera result buffer. Check the acquisition identity and age at the point of use, and allow the command only if the selected observation is still usable. Keep a missing observation distinct from a centered measurement of 0°.',
    ]],
    ['First bench test', [
      {steps:['With drive disabled, move the target left and right and verify the measured sign.','On a fixture, apply a small test pulse and confirm the next image moves the target toward center.','Enable proportional control with a low cap. Log signed angle, frame identity, age and applied command until the motion stops.']},
      {cards:['projects/rotate','course/lesson-6-2','course/lesson-3-2']},
    ]],
  ],
  '6-2': [
    ['Why proportional control can fall short', [
      'Continue the tag-facing test from the previous lesson. The setpoint is zero degrees on the camera centerline. A fresh measurement of +10° means the tag is to the right. The output is a normalized turn command, positive to the right. Keep these definitions with the tuning log, since a gain that works in degrees cannot be copied unchanged into code that works in radians.',
      'Proportional control gives a large request far from the target and a smaller request near it. On a real drivetrain, a small command might be below the power needed to break static friction. A high gain can overcome that but also cause the chassis to overshoot. It takes time to slow down, and a camera can still be reporting where the target was before the turn. Inspect the angle and applied output together before changing the controller.',
      'A PID controller combines three signals. P responds to the current error. I accumulates signed error over time, which can counter a persistent bias. D responds to how fast the error is changing, which can reduce a turn command as the robot approaches center. With error in degrees and time in seconds, the three inputs have units of degrees, degree-seconds, and degrees per second. The corresponding gains convert each term into the same normalized output units.',
    ]],
    ['Worked example', [
      'Suppose two consecutive camera frames report +10° and +7°, 50 ms apart. Use Kp = 0.020 output/degree, Ki = 0, and Kd = 0.002 output per degree/second. The error is still positive, but it is falling by 3° in 0.050 s. That gives a derivative of −60°/s. The negative D term reduces the right-turn request because the robot is already closing the gap.',
      {table:{caption:'Illustrative calculation for the second fresh frame.',headers:['Term','Calculation','Output'],rows:[['P','0.020 × 7','+0.140'],['I','Ki = 0','0'],['D','0.002 × (−3 / 0.050)','−0.120'],['Sum','0.140 − 0.120','+0.020']]}},
      'If the same two readings were 100 ms apart, the derivative would be −30°/s, so the output would be +0.080. If you mistakenly divided by a 10 ms control-loop interval, the derivative would be −300°/s and the sum would be −0.460 before clipping. That would turn the robot left even though the tag is still to the right. Compute the interval between distinct observations in a consistent timebase.',
      'Initialize history on the first usable frame so there is no derivative until a second sample exists. If the loop reads the same image again, keep the last derivative estimate or update a deliberate filter using its own documented timing model. Do not use another poll as a second camera sample. When the target is lost, clear the controller history so the next acquisition does not differentiate across the gap.',
    ]],
    ['When integral helps and when it gets stuck', [
      'Suppose a constant drivetrain bias leaves the tag 2° right for half a second. With a rectangular integration rule, that contributes 1 degree-second to the integral. Ki = 0.010 output per degree-second adds +0.010 output. Integral can help with a steady bias when the mechanism can actually move. If the chassis is blocked or at its power cap, extra stored error can cause a surge or a long overshoot when it can move again.',
      'One anti-windup rule is to skip an integral update when the proposed output is saturated and the new integral would push it farther into saturation. Allow an update that brings the command back toward the permitted range. Log the output before and after clipping to see whether this condition matters. An independent feedforward term is useful when a repeatable bias can be measured directly. For example, characterize the output needed to initiate a slow turn before using integral to compensate for friction.',
    ]],
    ['Read the trace before changing a gain', [
      {table:{caption:'Evidence to collect during the same small step test.',headers:['What you see','What to check next'],rows:[['Error increases on the first turn','Verify the camera and motor signs on a fixture.'],['Command is clipped for most of the turn','Inspect the output cap and whether the actuator is responding.'],['D spikes when an image is repeated','Check the frame identity and the time used in the derivative.'],['Robot hunts near center with a noisy angle','Try less D or filter the measurement, then check how much delay the filter adds.'],['Turn continues after the tag disappears','Inspect the invalid-result branch and reset controller state.']]}},
      'In the simulator start with I and D set to zero. Run a small angle step twice and note overshoot, time to settle, and how often the command clips. Add derivative and repeat with the same conditions. Then increase measurement delay without changing gains. On a robot, repeat at low effort and record frame identity, signed error, elapsed frame time, raw output and clipped output. Judge settling from multiple distinct frames within tolerance.',
      {cards:['tools/pid','projects/turret','course/lesson-6-4']},
    ]],
  ],
  '6-3': [
    ['Facing, centering and squaring up are different jobs', [
      'Stand a meter away from the wall and half a meter to the left of the tag. Turn the chassis until the tag is centered. The camera bearing is now zero, yet the chassis is still half a meter left and its heading is diagonal to the wall. A turn assist succeeded. A docking assist still has two problems to solve.',
      'Choose the measurement that matches each motion axis. Bearing alone is useful for pointing at the camera target. To strafe onto a centerline you need the sideways displacement in a specified frame, or a bearing paired with a held reference heading and a known range. To square up to a flat marker use its orientation, or hold an independently known wall-facing heading.',
    ]],
    ['Worked example', [
      'A tag that is 0.15 m left and 1.0 m forward has bearing atan2(0.15, 1.0) ≈ 8.5° left. Move the same 0.15 m offset out to 2.0 m, and the bearing becomes about 4.3°. A rule that accepts angles within 5° passes the distant pose and rejects the closer one although both are equally far from the centerline.',
      'If the chassis also turns left, the camera may see the target on center even though the lateral offset is unchanged. Use a level forward-facing camera for the initial sign test. Once you move or rotate the camera mount, convert the measured pose to the chassis frame before choosing forward and strafe commands.',
    ]],
    ['Check one axis at a time', [
      'Test rotation from either side, then a pure strafe with heading held, then forward travel with a conservative standoff. Log the measured forward distance, lateral displacement and heading separately. Specify completion tolerances for each, and require several distinct observations to agree. Where possible check that the robot has also slowed enough to stop within the tolerance band.',
      {cards:['projects/strafe','projects/tag-approach','course/lesson-4-3']},
    ]],
  ],
  '6-4': [
    ['Design the stop paths before the tracking path', [
      'Start with five events: the driver enables, a usable target arrives, that observation becomes stale, the driver takes over, and an attempt times out. For each event specify what the motors receive on that loop iteration and what permits a restart. An old camera result and a new observation of a different target both need an explicit decision.',
      'Consider the robot turned halfway toward a tag when another robot crosses the camera. The result can arrive late, become invalid, or switch targets. A display can keep showing “last seen bearing” if it labels it clearly. The actuator command should go to zero as soon as the current observation fails the control gate.',
    ]],
    ['Worked example', [
      'The robot is turning at 90°/s and the most recent observation describes the scene 100 ms earlier. That is up to roughly 9° of intervening rotation even with a stationary tag. For a 2° error budget devoted entirely to age, the corresponding maximum age would be about 22 ms at that speed. In practice part of the error budget is already spent on calibration, noise and motor response, so measure what your robot can sustain and consider slowing it near the target.',
      'Suppose you limit each normal change in power to 0.04 per loop. From a command of 0.20 it would take five updates to reach zero. If the camera goes stale or the driver cancels, set a neutral request directly instead of passing cancellation through that normal ramp. Validate the mechanical stop separately because a zero request does not instantly remove chassis momentum.',
    ]],
    ['Test the handoff', [
      {steps:['With a safe fixture and conservative effort, occlude the target while the motor is commanding a turn. Check the first neutral request in the trace.','Hold enable beyond the timeout and present a new target. Verify the attempt stays disabled until your chosen rearm action occurs.','Repeat with driver override and while the target is already centered. Confirm the diagnostic distinguishes all three stop reasons.']},
      {cards:['course/lesson-9-3','projects/rotate','troubleshooting']},
    ]],
  ],
};
