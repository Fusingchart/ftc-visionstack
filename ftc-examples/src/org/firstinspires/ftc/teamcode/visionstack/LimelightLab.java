package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.hardware.limelightvision.LLResult;
import com.qualcomm.hardware.limelightvision.LLResultTypes.ColorResult;
import com.qualcomm.hardware.limelightvision.LLResultTypes.DetectorResult;
import com.qualcomm.hardware.limelightvision.LLResultTypes.FiducialResult;
import com.qualcomm.hardware.limelightvision.Limelight3A;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorSimple;
import com.qualcomm.robotcore.hardware.DistanceSensor;
import com.qualcomm.robotcore.util.Range;
import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import org.firstinspires.ftc.robotcore.external.navigation.Pose3D;
import org.firstinspires.ftc.robotcore.external.navigation.Position;
import java.util.Locale;

public abstract class LimelightLab extends LinearOpMode {
    protected enum Mode {
        TELEMETRY, SWITCH, TAG, RANGE, COLOR, COMPARE, ROTATE, STRAFE, TURRET,
        FIELD, BENCHMARK, APPROACH, FUSION, ACQUIRE, TRACK, NEURAL, PYTHON
    }

    // Practice ID and fixture values. Replace with measurements from your bench setup.
    private static final int PRACTICE_ID = 7;
    private static final double HEIGHT_DIFFERENCE_M = 0.40;
    private static final double CAMERA_PITCH_DEG = 0;
    private static final double WHEEL_METERS_PER_TICK = 0.00025;
    private static final double BENCH_TRUTH_BEARING_DEG = 0;
    private static final double BENCH_TRUTH_RANGE_M = 1;
    private final Vision.Pid pid = new Vision.Pid();
    private int requested, armedFrames, count;
    private double previousStamp = Double.NaN, previousAngle, holdStarted = Double.NaN;
    private double bias, squaredError, rangeSquaredError, xEstimate = Double.NaN;
    private int previousEncoder, turretHome;
    // Set to a conservative fraction of known travel and begin each run at center.
    private static final int TURRET_LIMIT_TICKS = 100;
    private boolean enableLocked;
    private long nextTelemetry;
    private DcMotor fl, fr, bl, br, turret, encoder, intake;
    private DistanceSensor stopRange;
    private Limelight3A camera;

    protected abstract Mode mode();

    @Override public final void runOpMode() {
        camera = hardwareMap.get(Limelight3A.class, "limelight");
        configureActuators();
        requested = mode() == Mode.COLOR || mode() == Mode.ACQUIRE ? 1 : mode() == Mode.NEURAL ? 2 : mode() == Mode.PYTHON ? 3 : 0;
        camera.setPollRateHz(50);
        telemetry.setMsTransmissionInterval(100);
        telemetry.addLine("Motion modes: verify directions on blocks. Hold right bumper to enable.");
        telemetry.update();
        waitForStart();
        if (isStopRequested()) return;

        try {
            camera.start();
            boolean switched = commandPipeline(requested);
            boolean down = false;
            while (opModeIsActive()) {
                if (!gamepad1.right_bumper) {
                    holdStarted = Double.NaN;
                    enableLocked = false;
                    pid.reset();
                    armedFrames = 0;
                }
                boolean pressed = gamepad1.a;
                if (pressed && !down && (mode() == Mode.SWITCH || mode() == Mode.COMPARE)) {
                    int next = mode() == Mode.COMPARE ? (requested == 1 ? 2 : 1) : 1 - requested;
                    switched = commandPipeline(next);
                }
                down = pressed;
                if (!switched && pressed && mode() != Mode.SWITCH && mode() != Mode.COMPARE) {
                    switched = commandPipeline(requested);
                }
                LLResult result = camera.getLatestResult();
                if (switched && Vision.fresh(result, requested)) consume(result);
                else {
                    if (mode() == Mode.FUSION) updateFusion(null, false);
                    stopMotion();
                    pid.reset();
                    armedFrames = 0;
                    if (!gamepad1.right_bumper) holdStarted = Double.NaN;
                    telemetry.addData("State", "Waiting for fresh result from slot %d", requested);
                }
                if (System.nanoTime() >= nextTelemetry) {
                    telemetry.update();
                    nextTelemetry = System.nanoTime() + 100_000_000L;
                }
                idle();
            }
        } finally {
            stopMotion();
            camera.stop();
        }
    }

    private boolean commandPipeline(int index) {
        requested = index;
        previousStamp = Double.NaN;
        lastFrameNs = 0;
        armedFrames = 0;
        pid.reset();
        return camera.pipelineSwitch(index);
    }

    private void configureActuators() {
        Mode m = mode();
        if (m == Mode.ROTATE || m == Mode.STRAFE || m == Mode.APPROACH || m == Mode.ACQUIRE) {
            fl = motor("frontLeft", true);
            fr = motor("frontRight", false);
            bl = motor("backLeft", true);
            br = motor("backRight", false);
        }
        if (m == Mode.TURRET) {
            turret = motor("turret", false);
            turretHome = turret.getCurrentPosition();
        }
        if (m == Mode.ACQUIRE) {
            intake = motor("intake", false);
            stopRange = hardwareMap.get(DistanceSensor.class, "stopRange");
        }
        if (m == Mode.FUSION) {
            encoder = hardwareMap.get(DcMotor.class, "forwardEncoder");
            previousEncoder = encoder.getCurrentPosition();
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

    private void consume(LLResult result) {
        double stamp = result.getTimestamp();
        boolean newFrame = Double.isFinite(stamp) && stamp != previousStamp;
        // Vendor timestamp is used for identity only. Derivatives use hub monotonic time.
        long now = System.nanoTime();
        double t = now * 1e-9;
        double dt = newFrame && lastFrameNs != 0 ? (now - lastFrameNs) * 1e-9 : 0;
        telemetry.addData("Slot and age ms", "%d / %d", requested, result.getStaleness());
        switch (mode()) {
            case TELEMETRY:
            case SWITCH:
                telemetry.addData("Bearing/elevation deg and area", "%.2f / %.2f / %.3f", result.getTx(), result.getTy(), result.getTa());
                telemetry.addData("Capture/targeting ms", "%.1f / %.1f", result.getCaptureLatency(), result.getTargetingLatency());
                break;
            case COLOR:
            case NEURAL:
            case COMPARE:
                logObjects(result, newFrame);
                break;
            case PYTHON:
                double[] data = result.getPythonOutput();
                if (data != null && data.length >= 4 && data[0] == 1
                        && Double.isFinite(data[1]) && Double.isFinite(data[2]) && Double.isFinite(data[3])) {
                    telemetry.addData("Centroid px / area px²", "%.1f, %.1f / %.1f", data[1], data[2], data[3]);
                } else telemetry.addLine("No accepted SnapScript blob.");
                break;
            case FIELD:
                reportField(result);
                break;
            case FUSION:
                updateFusion(result, newFrame);
                break;
            case ACQUIRE:
                acquire(result, t);
                break;
            default:
                FiducialResult tag = Vision.tag(result, PRACTICE_ID);
                if (tag != null) processTag(tag, newFrame, dt, t, result);
                else {
                    stopMotion();
                    pid.reset();
                    armedFrames = 0;
                    telemetry.addData("Waiting for tag", PRACTICE_ID);
                }
        }
        if (newFrame) {
            previousStamp = stamp;
            lastFrameNs = now;
        }
    }

    private long lastFrameNs;

    private ColorResult bestColor(LLResult result) {
        ColorResult best = null;
        for (ColorResult item : result.getColorResults()) {
            double area = item.getTargetArea();
            if (Double.isFinite(area) && area > 0 && (best == null || area > best.getTargetArea())) best = item;
        }
        return best;
    }

    private void logObjects(LLResult result, boolean newFrame) {
        ColorResult color = bestColor(result);
        if (color != null) telemetry.addData("Largest color blob deg / area", "%.2f / %.3f", color.getTargetXDegrees(), color.getTargetArea());
        DetectorResult detector = null;
        for (DetectorResult item : result.getDetectorResults()) {
            if (Double.isFinite(item.getConfidence()) && (detector == null || item.getConfidence() > detector.getConfidence())) detector = item;
        }
        if (detector != null) telemetry.addData("Top neural detection", "%s score %.3f, bearing %.2f°",
                detector.getClassName(), detector.getConfidence(), detector.getTargetXDegrees());
        if (mode() == Mode.COMPARE && newFrame) {
            android.util.Log.i("VisionStack", String.format(Locale.US,"slot=%d stamp=%.3f ageMs=%d color=%b neural=%b",
                    requested, result.getTimestamp(), result.getStaleness(), color != null, detector != null));
        }
    }

    private Position fieldPosition(LLResult result) {
        Pose3D pose = result.getBotpose();
        if (pose == null || result.getBotposeTagCount() < 1) return null;
        Position p = pose.getPosition().toUnit(DistanceUnit.METER);
        return Double.isFinite(p.x) && Double.isFinite(p.y) ? p : null;
    }

    private void reportField(LLResult result) {
        Position p = fieldPosition(result);
        if (p == null) { telemetry.addLine("No mapped field pose."); return; }
        telemetry.addData("Field x/y m, yaw deg", "%.3f / %.3f / %.2f", p.x, p.y, result.getBotpose().getOrientation().getYaw(AngleUnit.DEGREES));
    }

    private void updateFusion(LLResult result, boolean newFrame) {
        int ticks = encoder.getCurrentPosition();
        if (Double.isFinite(xEstimate)) xEstimate += (ticks - previousEncoder) * WHEEL_METERS_PER_TICK;
        previousEncoder = ticks;
        Position p = result == null ? null : fieldPosition(result);
        if (p != null && newFrame) {
            if (!Double.isFinite(xEstimate)) xEstimate = p.x;
            else {
                double innovation = p.x - xEstimate;
                if (Math.abs(innovation) < 0.35) xEstimate += 0.25 * innovation;
                else telemetry.addData("Rejected innovation m", innovation);
            }
        }
        telemetry.addData("Fused field x m", xEstimate);
    }

    private void processTag(FiducialResult tag, boolean newFrame, double dt, double now, LLResult result) {
        double tx = tag.getTargetXDegrees();
        double range = Vision.groundRange(HEIGHT_DIFFERENCE_M, CAMERA_PITCH_DEG + tag.getTargetYDegrees());
        telemetry.addData("Tag, bearing ° and range m", "%d / %.2f / %.3f", tag.getFiducialId(), tx, range);
        if (mode() == Mode.BENCHMARK && newFrame && Double.isFinite(tx) && Double.isFinite(range)) {
            count++;
            double error = tx - BENCH_TRUTH_BEARING_DEG;
            bias += error;
            squaredError += error * error;
            rangeSquaredError += Math.pow(range - BENCH_TRUTH_RANGE_M, 2);
            telemetry.addData("n / bias ° / RMSE ° / RMSE m", "%d / %.3f / %.3f / %.3f", count, bias/count,
                    Math.sqrt(squaredError/count), Math.sqrt(rangeSquaredError/count));
        }
        if (mode() == Mode.TRACK && newFrame && Double.isFinite(tx)) {
            double rate = dt > 0.005 && dt < 0.3 ? AngleUnit.normalizeDegrees(tx - previousAngle) / dt : 0;
            double ageSeconds = Math.min(0.15, (result.getCaptureLatency() + result.getTargetingLatency() + result.getStaleness()) / 1000.0);
            telemetry.addData("Raw / predicted bearing deg", "%.2f / %.2f", tx, tx + Range.clip(rate, -120, 120) * Math.max(0, ageSeconds));
            previousAngle = tx;
        }
        if (mode() != Mode.TURRET && mode() != Mode.ROTATE && mode() != Mode.STRAFE && mode() != Mode.APPROACH) return;
        if (!Double.isFinite(tx) || !enabled(now)) { stopMotion(); return; }
        if (newFrame) armedFrames = Math.min(2,armedFrames+1);
        if (armedFrames < 2) { stopMotion(); return; }
        if (mode() == Mode.TURRET) {
            double command = pid.update(tx, dt, newFrame);
            int travel = turret.getCurrentPosition() - turretHome;
            if ((travel >= TURRET_LIMIT_TICKS && command > 0) || (travel <= -TURRET_LIMIT_TICKS && command < 0)) {
                command = 0;
                pid.reset();
            }
            turret.setPower(command);
        }
        if (mode() == Mode.ROTATE) drive(0,0,Vision.effort(tx,0.021,0.23,1.5));
        if (mode() == Mode.STRAFE) drive(0,Vision.effort(tx,0.019,0.20,2),0);
        if (mode() == Mode.APPROACH && Double.isFinite(range)) {
            drive(Math.abs(tx) < 12 ? Vision.effort(range-0.75,0.4,0.18,0.07) : 0, 0, Vision.effort(tx,0.019,0.18,2));
        } else if (mode() == Mode.APPROACH) stopMotion();
    }

    private void acquire(LLResult result, double now) {
        ColorResult target = bestColor(result);
        double distance = stopRange.getDistance(DistanceUnit.METER);
        if (!enabled(now) || target == null || !Double.isFinite(target.getTargetXDegrees())
                || !Double.isFinite(distance) || distance <= 0.18 || distance > 2) {
            stopMotion();
            return;
        }
        double tx = target.getTargetXDegrees();
        intake.setPower(0.3);
        drive(Math.abs(tx) < 10 ? 0.14 : 0, 0, Vision.effort(tx,0.02,0.16,2));
    }

    private boolean enabled(double now) {
        if (!gamepad1.right_bumper || enableLocked) return false;
        if (Math.abs(gamepad1.left_stick_y) > 0.15 || Math.abs(gamepad1.right_stick_x) > 0.15) {
            enableLocked = true;
            pid.reset();
            armedFrames = 0;
            return false;
        }
        if (Double.isNaN(holdStarted)) holdStarted = now;
        if (now - holdStarted < 2) return true;
        enableLocked = true;
        pid.reset();
        armedFrames = 0;
        return false;
    }

    // Positive yaw turns the chassis right. Positive lateral command strafes right.
    private void drive(double forward, double right, double yaw) {
        fl.setPower(Range.clip(forward + right + yaw,-0.30,0.30));
        fr.setPower(Range.clip(forward - right - yaw,-0.30,0.30));
        bl.setPower(Range.clip(forward - right + yaw,-0.30,0.30));
        br.setPower(Range.clip(forward + right - yaw,-0.30,0.30));
    }

    private void stopMotion() {
        if (fl != null) drive(0,0,0);
        if (turret != null) turret.setPower(0);
        if (intake != null) intake.setPower(0);
    }
}
