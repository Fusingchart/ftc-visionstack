# Repeatable FTC vision benchmarks

Design a fixed set of scenes before tuning. Survey the range and bearing to each scene, alternate run order across camera configurations, and save exact versions, capture settings and mounting geometry. Record independent trials. Repeated polls from one camera frame count once.

For each run, count every test scene including missed detections. Report detection fraction, signed bias, RMSE, and p50/p95 measurement age. Record observed actuation time from a synchronized external stimulus if end-to-end latency is the target metric. Wrapper timing and person-observed reaction time measure different quantities.

The `TagBenchmark` OpMode calculates accepted-frame bearing bias and bearing/range RMSE. The webcam logger reports captured samples and age. For a common comparison, use the same fixture, match target selection and transform observations into the same coordinate system and units. Use the ground-truth sheet for missed scenes. Save redacted raw samples together with the report.
