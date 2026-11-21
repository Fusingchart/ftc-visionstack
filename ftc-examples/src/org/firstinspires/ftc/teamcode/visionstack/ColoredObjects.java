package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "ColoredObjects", group = "VisionStack")
public final class ColoredObjects extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.COLOR;
    }
}
