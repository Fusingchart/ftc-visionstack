import { refs } from './references.mjs';

export const cameraLab = [
  ['What the simulator measures', [
    'Imagine a robot parked in front of a tag. The tag is half a meter to the right. Will it appear near the center of the image or near the edge? The answer depends on the tag’s direction from the lens and on the camera’s field of view. This simulator treats the tag as a single point so you can see exactly how those two things determine its image position.',
    'Start with the controls below, or read the worked example for a reproducible setup. The crosshair marks the image center. The dot appears when the projected point is in view.',
    {simulator:true},
  ]],
  ['Field of view and focal length', [
    'Field of view (FOV) is the full angle between the two boundaries of the view. Horizontal FOV runs from the left edge of the image to the right. Vertical FOV runs from bottom to top. A 90° horizontal FOV covers 45° on either side of the centerline in this model. Check whether a camera specification gives a horizontal, vertical, or diagonal angle before entering it.',
    {figure:'camera-fov',alt:'Top view shows rays spreading left and right from the lens. Side view shows a separate pair of rays spreading up and down.',caption:'Two slices through the same view. Each field of view is measured between its two outer rays.'},
    'Focal length in pixels sets the scale of the projection. The horizontal scale is fₓ and the vertical scale is fᵧ. These describe how many pixels a given ray slope occupies on the image. They are different units from the focal length printed in millimeters on a lens. For a fixed image width, a narrower field of view gives a larger fₓ, so the same off-center target lands farther from the center in pixels.',
    {figure:'camera-focal-triangle',alt:'A right triangle joins the lens, image center, and image edge. Its legs are focal length fₓ and half of image width W. The angle at the lens is half of horizontal field of view.',caption:'The tangent of the half-angle is the opposite leg (half the image width) divided by the adjacent leg (pixel focal length).'},
    'If the image is W pixels wide and H pixels tall, the centered pinhole model gives fₓ = (W / 2) / tan(horizontal FOV / 2) and fᵧ = (H / 2) / tan(vertical FOV / 2). We vary the angles independently to isolate their effects. Real camera modes have a particular combination of optics, resolution and crop. Use calibration values for the same mode that produces your measurements.',
  ]],
  ['From a point in space to a pixel', [
    'The pinhole model draws a ray from the lens center through the target to a virtual image plane in front of the lens. Set the origin at the lens and use camera coordinates X right, Y down, and Z forward along the optical axis. That last quantity is depth along the axis. The distance to the target along the ray is longer when the target is off-axis.',
    'The horizontal and vertical ray slopes are X / Z and Y / Z. Multiply by the corresponding focal lengths and add the principal point, where the optical axis intersects the image. The simulator centers it at (cₓ, cᵧ) = (W / 2, H / 2). This gives u = cₓ + fₓ × X / Z and v = cᵧ + fᵧ × Y / Z. Pixels increase down the image, so a target above the center has v less than cᵧ.',
    'A point can be in front of the camera and still project outside the image. If Z is zero or negative, there is no forward-facing projection. Pitch changes Y and Z together when you tilt the camera, which is why moving the pitch slider can change both the projected position and whether the point is visible.',
  ]],
  ['Worked example', [
    'Set width to 640 px and height to 480 px, horizontal FOV to 90°, and vertical FOV to 60°. Set pitch to 0° and use the same height for the camera and target. Enter 2.00 m forward and 0.50 m right. The angle is arctan(0.50 / 2.00) ≈ 14.04° right of center. Horizontal focal length is 320 / tan(45°) = 320 px. The target is therefore 320 × (0.50 / 2.00) = 80 px right of center.',
    {figure:'camera-image-plane',alt:'Image with u increasing right and v increasing down. The center is (320, 240) and the projected target is (400, 240), an 80-pixel horizontal displacement.',caption:'The equal heights and level camera keep the point on the center row. The target’s horizontal offset moves it from u = 320 to u = 400.'},
    {table:{caption:'Change one control at a time, starting from the worked example.',headers:['Change','Pixel position','What changed'],rows:[
      ['Forward distance to 4 m','(360, 240)','The ray slope halves.'],
      ['Width to 320 px','(200, 240)','Same ray and relative position. The pixel scale halves.'],
      ['Vertical FOV to 80°','(400, 240)','A point on the center row has zero vertical offset.'],
    ]}},
  ]],
  ['What carries over to a robot', [
    'A single image point determines a ray. It provides no distance along that ray unless you add another constraint, such as a known target height, a measured tag size, or a second view. The simulator assumes one visible point and an ideal rectilinear lens. It omits distortion, occlusion, and rolling-shutter effects. On a robot, calibrate at the resolution and crop you use and verify measurements against a fixture at known positions.',
    {links:[refs.CAL]},
    {cards:['course/lesson-1-4','course/lesson-7-2','projects/distance-bearing']},
  ]],
];
