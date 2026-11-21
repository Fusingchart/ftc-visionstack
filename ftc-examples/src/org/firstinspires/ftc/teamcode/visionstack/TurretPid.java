package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "TurretPid", group = "VisionStack")
public final class TurretPid extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.TURRET;
    }
}
