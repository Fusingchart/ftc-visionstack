package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "SnapScriptOutput", group = "VisionStack")
public final class SnapScriptOutput extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.PYTHON;
    }
}
