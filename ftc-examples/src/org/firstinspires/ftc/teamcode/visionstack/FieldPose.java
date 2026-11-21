package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "FieldPose", group = "VisionStack")
public final class FieldPose extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.FIELD;
    }
}
