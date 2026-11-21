package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "DistanceBearing", group = "VisionStack")
public final class DistanceBearing extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.RANGE;
    }
}
