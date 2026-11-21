package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "GamePieceApproach", group = "VisionStack")
public final class GamePieceApproach extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.ACQUIRE;
    }
}
