package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "SpecificTag", group = "VisionStack")
public final class SpecificTag extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.TAG;
    }
}
