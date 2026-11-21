package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import org.firstinspires.ftc.robotcore.external.hardware.camera.WebcamName;
import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import org.firstinspires.ftc.vision.VisionPortal;
import org.firstinspires.ftc.vision.apriltag.AprilTagDetection;
import org.firstinspires.ftc.vision.apriltag.AprilTagGameDatabase;
import org.firstinspires.ftc.vision.apriltag.AprilTagProcessor;
import org.firstinspires.ftc.vision.apriltag.AprilTagSingleDetection;
import java.util.List;
import java.util.Locale;

@TeleOp(name = "WebcamBenchmark", group = "VisionStack")
public final class WebcamBenchmark extends LinearOpMode {
    @Override public void runOpMode() {
        AprilTagProcessor processor = new AprilTagProcessor.Builder()
                .setTagLibrary(AprilTagGameDatabase.getCurrentGameTagLibrary())
                .setOutputUnits(DistanceUnit.METER, AngleUnit.DEGREES)
                .build();
        VisionPortal portal = new VisionPortal.Builder()
                .setCamera(hardwareMap.get(WebcamName.class,"Webcam 1"))
                .addProcessor(processor)
                .build();
        int frames = 0, detections = 0;
        try {
            waitForStart();
            while (opModeIsActive()) {
                List<AprilTagDetection> frame = processor.getFreshDetections();
                if (frame != null) {
                    frames++;
                    boolean usable = false;
                    for (AprilTagDetection observation : frame) {
                        if (observation.ftcPose == null || !(observation instanceof AprilTagSingleDetection)) continue;
                        AprilTagSingleDetection tag = (AprilTagSingleDetection) observation;
                        long age = System.nanoTime() - tag.frameAcquisitionNanoTime;
                        if (age < 0 || age > 120_000_000L) continue;
                        usable = true;
                        telemetry.addData("Bearing deg / range m", "%.2f / %.3f", tag.ftcPose.bearing, tag.ftcPose.range);
                        android.util.Log.i("VisionStack", String.format(Locale.US,"webcam bearing=%.3f range=%.3f ageMs=%.1f",
                                tag.ftcPose.bearing,tag.ftcPose.range,age/1e6));
                    }
                    if (usable) detections++;
                }
                telemetry.addData("State", portal.getCameraState());
                telemetry.addData("Frames with usable pose / fresh frames", "%d / %d", detections, frames);
                telemetry.update();
                idle();
            }
        } finally {
            portal.close();
        }
    }
}
