package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.hardware.limelightvision.LLResult;
import com.qualcomm.hardware.limelightvision.LLResultTypes.FiducialResult;
import com.qualcomm.robotcore.util.Range;

public final class Vision {
    public static final long MAX_AGE_MS = 120;
    private Vision() {}

    public static boolean fresh(LLResult result, int pipeline) {
        if (result == null || result.getPipelineIndex() != pipeline || !result.isValid()) return false;
        long age = result.getStaleness();
        return age >= 0 && age <= MAX_AGE_MS;
    }

    public static FiducialResult tag(LLResult result, int id) {
        FiducialResult best = null;
        for (FiducialResult candidate : result.getFiducialResults()) {
            if (candidate.getFiducialId() != id || !Double.isFinite(candidate.getTargetArea())) continue;
            if (best == null || candidate.getTargetArea() > best.getTargetArea()) best = candidate;
        }
        return best;
    }

    public static double groundRange(double heightDifferenceM, double elevationDegrees) {
        double tangent = Math.tan(Math.toRadians(elevationDegrees));
        if (Math.abs(tangent) < 0.08) return Double.NaN;
        double range = heightDifferenceM / tangent;
        return range > 0 && Double.isFinite(range) ? range : Double.NaN;
    }

    public static double effort(double error, double gain, double limit, double deadband) {
        if (!Double.isFinite(error) || Math.abs(error) <= deadband) return 0;
        return Range.clip(error * gain, -limit, limit);
    }

    public static final class Pid {
        private double integral, previous, derivative;
        private boolean initialized;

        public double update(double error, double dt, boolean newFrame) {
            if (!Double.isFinite(error)) {
                reset();
                return 0;
            }
            if (newFrame) {
                if (initialized && dt > 0.005 && dt < 0.3) {
                    derivative = 0.7 * derivative + 0.3 * (error - previous) / dt;
                    double proposed = Range.clip(integral + error * dt, -12, 12);
                    double raw = 0.025 * error + 0.005 * proposed + 0.002 * derivative;
                    if (Math.abs(raw) < 0.22 || Math.signum(raw) != Math.signum(error)) integral = proposed;
                }
                previous = error;
                initialized = true;
            }
            return Math.abs(error) <= 1.5 ? 0 : Range.clip(0.025 * error + 0.005 * integral + 0.002 * derivative, -0.22, 0.22);
        }

        public void reset() {
            integral = previous = derivative = 0;
            initialized = false;
        }
    }
}
