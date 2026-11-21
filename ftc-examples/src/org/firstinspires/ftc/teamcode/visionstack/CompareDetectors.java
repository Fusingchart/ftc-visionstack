package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "CompareDetectors", group = "VisionStack")
public final class CompareDetectors extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.COMPARE;
    }
}
