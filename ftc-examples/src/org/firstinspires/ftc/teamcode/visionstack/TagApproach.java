package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "TagApproach", group = "VisionStack")
public final class TagApproach extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.APPROACH;
    }
}
