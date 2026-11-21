package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.hardware.limelightvision.LLResult;
import com.qualcomm.hardware.limelightvision.LLResultTypes.FiducialResult;
import com.qualcomm.hardware.limelightvision.Limelight3A;
import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorSimple;
import com.qualcomm.robotcore.util.Range;

@Autonomous(name = "Vision Practice Auto", group = "VisionStack")
public final class VisionPracticeAuto extends LinearOpMode {
    private enum State { ACQUIRE, YAW_ALIGN, APPROACH, VERIFY, DONE, ABORT }
    private static final int SLOT = 0, PRACTICE_ID = 7;
    private static final double TARGET_HEIGHT_ABOVE_CAMERA_M = 0.4, CAMERA_PITCH_DEG = 0;
    private static final double STANDOFF_M = 0.80;
    private DcMotor fl, fr, bl, br;

    @Override public void runOpMode() {
        Limelight3A camera = hardwareMap.get(Limelight3A.class, "limelight");
        fl = motor("frontLeft", true);
        fr = motor("frontRight", false);
        bl = motor("backLeft", true);
        br = motor("backRight", false);
        telemetry.addLine("Practice only. Allow clear frontal space, verify motor signs and measure height before testing.");
        telemetry.update();
        waitForStart();
        if (isStopRequested()) return;

        State state = State.ACQUIRE;
        double lastFrame = Double.NaN;
        int accepted = 0;
        camera.setPollRateHz(50);
        long started = System.nanoTime();
        try {
            camera.start();
            if (!camera.pipelineSwitch(SLOT)) state = State.ABORT;
            while (opModeIsActive() && state != State.DONE && state != State.ABORT) {
                double elapsed = (System.nanoTime() - started) / 1e9;
                LLResult result = camera.getLatestResult();
                FiducialResult tag = Vision.fresh(result, SLOT) ? Vision.tag(result, PRACTICE_ID) : null;
                double bearing = tag != null ? tag.getTargetXDegrees() : Double.NaN;
                double range = tag != null ? Vision.groundRange(TARGET_HEIGHT_ABOVE_CAMERA_M, CAMERA_PITCH_DEG + tag.getTargetYDegrees()) : Double.NaN;
                boolean valid = Double.isFinite(bearing) && Double.isFinite(range) && range < 2.5;
                boolean newFrame = valid && Double.isFinite(result.getTimestamp()) && result.getTimestamp() != lastFrame;
                if (newFrame) lastFrame = result.getTimestamp();
                double forward = 0, rightTurn = 0;
                if (elapsed > 4 || gamepad1.b || (!valid && state != State.ACQUIRE)) {
                    state = State.ABORT;
                } else {
                    switch (state) {
                        case ACQUIRE:
                            if (!valid) accepted = 0;
                            if (newFrame && ++accepted == 2) state = State.YAW_ALIGN;
                            break;
                        case YAW_ALIGN:
                            if (Math.abs(bearing) <= 3) state = State.APPROACH;
                            else rightTurn = Vision.effort(bearing,0.02,0.16,2);
                            break;
                        case APPROACH:
                            if (Math.abs(bearing) > 10) state = State.YAW_ALIGN;
                            else if (range <= STANDOFF_M + 0.06) {
                                accepted = 0;
                                state = State.VERIFY;
                            } else {
                                forward = Range.clip(0.35*(range - STANDOFF_M),0,0.16);
                                rightTurn = Vision.effort(bearing,0.018,0.10,2);
                            }
                            break;
                        case VERIFY:
                            if (range < STANDOFF_M - 0.10) state = State.ABORT;
                            else if (Math.abs(bearing) > 4 || range > STANDOFF_M + 0.10) state = State.YAW_ALIGN;
                            else if (newFrame && ++accepted >= 3) state = State.DONE;
                            break;
                        default: break;
                    }
                }
                drive(forward, rightTurn);
                telemetry.addData("State", state);
                telemetry.addData("Bearing deg / range m", "%.2f / %.2f", bearing, range);
                telemetry.update();
                idle();
            }
        } finally {
            drive(0,0);
            camera.stop();
        }
    }

    private DcMotor motor(String name, boolean reversed) {
        DcMotor motor = hardwareMap.get(DcMotor.class, name);
        motor.setDirection(reversed ? DcMotorSimple.Direction.REVERSE : DcMotorSimple.Direction.FORWARD);
        motor.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);
        motor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        motor.setPower(0);
        return motor;
    }

    // Motor output for positive forward / right rotation, after polarity verification on blocks.
    private void drive(double forward, double rightTurn) {
        double left = Range.clip(forward + rightTurn,-0.20,0.20);
        double right = Range.clip(forward - rightTurn,-0.20,0.20);
        fl.setPower(left);
        bl.setPower(left);
        fr.setPower(right);
        br.setPower(right);
    }
}
