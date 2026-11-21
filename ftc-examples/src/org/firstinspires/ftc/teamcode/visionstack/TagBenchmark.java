package org.firstinspires.ftc.teamcode.visionstack;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "TagBenchmark", group = "VisionStack")
public final class TagBenchmark extends LimelightLab {
    @Override protected Mode mode() {
        return Mode.BENCHMARK;
    }
}
