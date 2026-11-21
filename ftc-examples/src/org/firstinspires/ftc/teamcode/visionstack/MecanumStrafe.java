package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "MecanumStrafe", group = "VisionStack")
public final class MecanumStrafe extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.STRAFE;
    }
}
