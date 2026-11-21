package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "TelemetryViewer", group = "VisionStack")
public final class TelemetryViewer extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.TELEMETRY;
    }
}
