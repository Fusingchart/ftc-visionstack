# FTC VisionStack

Computer vision education by FTC Team 21229 Quality Control, Washington State. [Open the website](https://fusingchart.github.io/ftc-visionstack/).

- 12 curriculum modules and 48 lessons, from camera geometry through autonomous integration.
- 18 project guides with FTC SDK 12.0 Java examples, 30 Java recipes, 21 troubleshooting articles, and 7 interactive labs.
- BIOBUZZ practice applications, role-specific learning paths, and an optional team trial report.

## Run locally

Install Node.js 22 or later and Python 3. Then run:

```sh
npm ci
npm run lint
npm test
npm run dev
```

Open http://127.0.0.1:4173/. `npm run build` writes static files to `dist/`. Change `site/config.mjs` to rename or rehost the website. Java OpMode display names and the Java package can be migrated independently so existing teams can keep their code imports.

## Run the robot examples

Use [FTC Robot Controller v12.0](https://github.com/FIRST-Tech-Challenge/FtcRobotController/releases/tag/v12.0). Copy the `org` directory from `ftc-examples/src` into `TeamCode/src/main/java`. Follow the project guide for hardware names, fixture constants and camera slot configuration. Start with telemetry-only OpModes. Test actuator examples on a limited-motion fixture with direct stop access.

See [deployment](docs/deployment.md), [architecture](docs/architecture.md), [analytics](docs/analytics.md), [benchmark protocol](benchmarks/README.md), and [validation and limitations](docs/validation.md).

[Contributions](CONTRIBUTING.md) are welcome under the [MIT license](LICENSE). This is an unofficial community project. FIRST and Limelight are referenced for interoperability and education.
