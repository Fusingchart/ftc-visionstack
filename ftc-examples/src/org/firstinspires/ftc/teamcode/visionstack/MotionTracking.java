package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "MotionTracking", group = "VisionStack")
public final class MotionTracking extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.TRACK;
    }
}
