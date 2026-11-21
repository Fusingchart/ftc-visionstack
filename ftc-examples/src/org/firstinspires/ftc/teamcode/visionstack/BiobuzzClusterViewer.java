package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import org.firstinspires.ftc.robotcore.external.hardware.camera.WebcamName;
import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import org.firstinspires.ftc.vision.VisionPortal;
import org.firstinspires.ftc.vision.apriltag.AprilTagClusterDetection;
import org.firstinspires.ftc.vision.apriltag.AprilTagDetection;
import org.firstinspires.ftc.vision.apriltag.AprilTagGameDatabase;
import org.firstinspires.ftc.vision.apriltag.AprilTagProcessor;

@TeleOp(name = "BIOBUZZ Cluster Viewer", group = "VisionStack")
public final class BiobuzzClusterViewer extends LinearOpMode {
    @Override public void runOpMode() {
        AprilTagProcessor processor = new AprilTagProcessor.Builder()
                .setTagLibrary(AprilTagGameDatabase.getBioBuzzTagLibrary())
                .setOutputUnits(DistanceUnit.METER, AngleUnit.DEGREES)
                .build();
        VisionPortal portal = new VisionPortal.Builder()
                .setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))
                .addProcessor(processor)
                .build();
        try {
            waitForStart();
            while (opModeIsActive()) {
                int fresh = 0;
                for (AprilTagDetection detection : processor.getDetections()) {
                    if (!(detection instanceof AprilTagClusterDetection) || detection.ftcPose == null) continue;
                    long age = System.nanoTime() - detection.frameAcquisitionNanoTime;
                    if (age < 0 || age > 120_000_000L) continue;
                    AprilTagClusterDetection cluster = (AprilTagClusterDetection) detection;
                    // Camera-relative CELL opening reference. This is not a static field landmark.
                    telemetry.addData(cluster.metadata.name, "range %.2f m, bearing %.1f°, elevation %.1f°, visible %d%%",
                            cluster.ftcPose.range, cluster.ftcPose.bearing, cluster.ftcPose.elevation,
                            cluster.percentClusterFound);
                    fresh++;
                }
                telemetry.addData("Camera", portal.getCameraState());
                if (fresh == 0) telemetry.addLine("Waiting for fresh CELL clusters");
                telemetry.update();
                idle();
            }
        } finally {
            portal.close();
        }
    }
}
