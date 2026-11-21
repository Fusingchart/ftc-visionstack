# Validation and remaining work

Validation date is November 20, 2026 in Washington State. This is a public educational release.

| Area | Evidence |
| --- | --- |
| Documentation build | Node 22 production build generated 156 static routes. Automated checks cover all 12 modules, four lessons per module, 18 projects, 30 recipes, 21 symptoms, seven labs, and seven outreach pages. |
| Links and search index | All generated local page, anchor and asset links resolved in the build check. The local search index includes full paragraph text and has one entry for each public route except search itself. External source review covered the season manual and principal SDK, Limelight, OpenCV and pathing references. |
| Browser interactions | A Chromium run at 390 CSS pixels exercised the keyboard skip link, persistence of theme preference, keyword search, combined project filters, clipboard, all seven labs, local HSV upload, and the team report draft. Axe reported zero WCAG A/AA violations on the homepage, one lesson, the PID lab and the feedback page in the tested configuration. This was a targeted automated check. |
| Models | Six automated cases cover nominal and edge camera projection, rigid transform inversion, bounded PID, outlier rejection, latency extrapolation and HSV wrap/region boundaries. |
| FTC Java | All source files compiled with javac in Java 8 compatibility mode against the published Hardware, RobotCore, Vision and FtcCommon 12.0.0 class archives and Android API 34. This verifies symbol and source compatibility. An Android APK build and Robot Controller installation were outside this verification. |
| SnapScript | Desktop OpenCV 4.10 and NumPy ran the empty-frame and synthetic yellow-disk cases and verified validity, centroid and output length. Limelight firmware execution remains unverified. |
| Deployment | GitHub Actions builds and publishes the static artifact to GitHub Pages. The live site is linked from the repository README. |
| Current season | FIRST's BIOBUZZ Competition Manual TU10 and Arena section TU06 were reviewed, along with FIRST's SDK 12.0 cluster detection documentation. The season page includes a compile-checked VisionPortal cluster viewer. |

## Reproduce the FTC compile check

Download the Hardware, RobotCore, Vision and FtcCommon 12.0.0 AARs from Maven Central under `org.firstinspires.ftc`. Put each AAR's `classes.jar` in a scratch directory under a distinct name such as `Hardware.jar`. With your Android SDK and JDK installed, run:

```sh
scripts/check-ftc.sh /path/to/android-34/android.jar /path/to/scratch-sdk-jars
```

## Remaining work

- Run each project on its specified camera and robot fixture. Verify polarity, stopping, repeatability, firmware and timing on hardware. The proposed thresholds in the guides are acceptance goals and no measured performance claims are published.
- Collect a licensed BIOBUZZ image dataset, train and test a camera-compatible detector, and verify the camera-specific pipeline settings on representative field pieces. The repository includes the training workflow, Java detector consumer and a color script. It contains no deployed model weights or fixed HIVE field map.
- Validate the full autonomous sequence and robot rules on field hardware before match use. The standalone example is a practice approach. Scoring, obstacle avoidance, actual team path follower wiring and full match strategy depend on the team's robot.
- Implement or validate a full 2D delayed-state estimator and version-specific Pedro Pathing/Road Runner adapters if needed. The shipped fusion example and simulation exercise scalar filtering and the course teaches the integration steps.
- Obtain deeper educator and accessibility review of the curriculum and the interactive graphs. Some lessons rely on linked lab and example pages for code and diagrams. The team report is a browser-local draft with optional public GitHub submission.
- Configure the team's analytics provider and verify events and the reporting export. Public views, unique visitors and verified adoption remain unmeasured.
