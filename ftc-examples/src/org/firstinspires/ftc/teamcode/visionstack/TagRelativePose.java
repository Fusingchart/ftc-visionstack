package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorSimple;
import com.qualcomm.robotcore.util.Range;
import org.firstinspires.ftc.robotcore.external.hardware.camera.WebcamName;
import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import org.firstinspires.ftc.vision.VisionPortal;
import org.firstinspires.ftc.vision.apriltag.AprilTagDetection;
import org.firstinspires.ftc.vision.apriltag.AprilTagGameDatabase;
import org.firstinspires.ftc.vision.apriltag.AprilTagPoseFtc;
import org.firstinspires.ftc.vision.apriltag.AprilTagProcessor;
import org.firstinspires.ftc.vision.apriltag.AprilTagSingleDetection;

@TeleOp(name = "Tag Relative Pose", group = "VisionStack")
public final class TagRelativePose extends LinearOpMode {
    private static final int PRACTICE_ID = 583; // SDK sample Nemo tag.
    private static final double STANDOFF_M = 0.75;
    private DcMotor fl, fr, bl, br;

    @Override public void runOpMode() {
        fl = motor("frontLeft", true);
        fr = motor("frontRight", false);
        bl = motor("backLeft", true);
        br = motor("backRight", false);
        AprilTagProcessor processor = new AprilTagProcessor.Builder()
                .setTagLibrary(AprilTagGameDatabase.getSampleTagLibrary())
                .setOutputUnits(DistanceUnit.METER, AngleUnit.DEGREES)
                .build();
        VisionPortal portal = new VisionPortal.Builder()
                .setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))
                .addProcessor(processor)
                .build();
        long started = 0, previousFrame = 0;
        boolean locked = false;
        int inTolerance = 0;
        try {
            telemetry.addLine("Center and level the webcam. Verify all axes on blocks before holding right bumper.");
            telemetry.update();
            waitForStart();
            while (opModeIsActive()) {
                long now = System.nanoTime();
                if (!gamepad1.right_bumper) {
                    started = 0;
                    previousFrame = 0;
                    inTolerance = 0;
                    locked = false;
                } else if (started == 0) started = now;
                if (started > 0 && (now - started > 2_000_000_000L
                        || Math.abs(gamepad1.right_stick_x) > .15 || Math.abs(gamepad1.left_stick_y) > .15)) locked = true;
                AprilTagSingleDetection tag = null;
                for (AprilTagDetection detection : processor.getDetections()) {
                    if (!(detection instanceof AprilTagSingleDetection)) continue;
                    AprilTagSingleDetection candidate = (AprilTagSingleDetection) detection;
                    long age = now - detection.frameAcquisitionNanoTime;
                    if (candidate.id == PRACTICE_ID && candidate.ftcPose != null && age >= 0 && age < 120_000_000L) {
                        tag = candidate;
                        break;
                    }
                }
                double forward = 0, right = 0, yawRight = 0;
                if (tag != null && plausible(tag.ftcPose)) {
                    AprilTagPoseFtc pose = tag.ftcPose;
                    // FTC camera x right, y forward, z up. Yaw is counterclockwise.
                    // Rotate (0,-standoff) by tag yaw and add tag center.
                    double theta = Math.toRadians(pose.yaw);
                    double rightM = pose.x + STANDOFF_M * Math.sin(theta);
                    double forwardM = pose.y - STANDOFF_M * Math.cos(theta);
                    telemetry.addData("Right m / forward m / CCW °", "%.3f / %.3f / %.1f", rightM, forwardM, pose.yaw);
                    if (started > 0 && !locked) {
                        if (Math.abs(rightM) < .05 && Math.abs(forwardM) < .05 && Math.abs(pose.yaw) < 4) {
                            if (previousFrame != tag.frameAcquisitionNanoTime && ++inTolerance >= 3) {
                                telemetry.addLine("Settled on three distinct observations");
                                locked = true;
                            }
                        } else {
                            inTolerance = 0;
                            forward = Vision.effort(forwardM, .34, .14, .05);
                            right = Vision.effort(rightM, .38, .14, .05);
                            yawRight = Vision.effort(-pose.yaw, .02, .14, 4);
                        }
                        previousFrame = tag.frameAcquisitionNanoTime;
                    }
                } else {
                    if (previousFrame != 0 && started > 0) locked = true;
                    inTolerance = 0;
                    telemetry.addLine("No usable pose");
                }
                drive(forward,right,yawRight);
                telemetry.update();
                idle();
            }
        } finally {
            drive(0,0,0);
            portal.close();
        }
    }

    private boolean plausible(AprilTagPoseFtc p) {
        return Double.isFinite(p.x) && Math.abs(p.x) < 1 && p.y > .35 && p.y < 2
                && Double.isFinite(p.yaw) && Math.abs(p.yaw) < 40;
    }

    private DcMotor motor(String name, boolean reversed) {
        DcMotor motor = hardwareMap.get(DcMotor.class, name);
        motor.setDirection(reversed ? DcMotorSimple.Direction.REVERSE : DcMotorSimple.Direction.FORWARD);
        motor.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);
        motor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        motor.setPower(0);
        return motor;
    }

    private void drive(double forward, double right, double yaw) {
        fl.setPower(Range.clip(forward+right+yaw,-.25,.25));
        fr.setPower(Range.clip(forward-right-yaw,-.25,.25));
        bl.setPower(Range.clip(forward-right+yaw,-.25,.25));
        br.setPower(Range.clip(forward+right-yaw,-.25,.25));
    }
}
