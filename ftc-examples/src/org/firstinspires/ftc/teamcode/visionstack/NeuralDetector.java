package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "NeuralDetector", group = "VisionStack")
public final class NeuralDetector extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.NEURAL;
    }
}
