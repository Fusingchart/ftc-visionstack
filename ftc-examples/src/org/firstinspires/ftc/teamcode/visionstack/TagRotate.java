package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "TagRotate", group = "VisionStack")
public final class TagRotate extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.ROTATE;
    }
}
