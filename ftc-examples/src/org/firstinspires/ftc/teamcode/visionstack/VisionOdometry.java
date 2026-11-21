package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "VisionOdometry", group = "VisionStack")
public final class VisionOdometry extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.FUSION;
    }
}
