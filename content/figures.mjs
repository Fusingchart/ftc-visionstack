export const fieldView = {
  figure:'field-view',
  alt:'Top-down practice robot with a front camera. The tag is to one side of the optical centerline, with the bearing shown between the centerline and the sight line.',
};

const placements = {
  '1-1': {'from-one-image-to-one-observation':[
    ['pipeline','Four stages run left to right: capture pixels, detect the ID and corners, estimate a bearing or pose, and decide what the motors should receive.','Keep the frame identity and timing with the observation as it passes from vision software to the controller.'],
  ]},
  '1-4': {'a-pixel-gives-you-a-direction':[
    ['bearing','A ray from the lens to a target right of the optical axis forms the bearing angle with the centerline.','Top-down view. The offset tells you which direction to look. Distance needs another constraint.'],
  ],'worked-example':[
    ['elevation-range','Two rays leave the same camera and intersect a horizontal line at the target height. The shallower ray intersects farther away.','Side view. For the same rise, a shallower ray gives a longer range and is more sensitive to angle error.'],
  ]},
  '4-1': {'how-corners-become-a-pose':[
    ['tag-corners','A known square marker is paired with four image corners forming an oblique quadrilateral.','The pose solver matches known points on the marker to observed image corners. The marker drawing is schematic.'],
  ]},
  '5-1': {'tune-the-mask-against-your-hardest-background':[
    ['hsv-mask','An image with a yellow disk, blue strip and bright reflection produces a mask containing only the disk.','Inspect which pixels survive the threshold before deciding which connected region is the target.'],
  ]},
  '6-2': {'worked-example':[
    ['pid-terms','From a zero baseline, the proportional term extends right by 0.140, the derivative term extends left by 0.120, and the resulting request extends right by 0.020. Integral is zero.','The error is still positive, but the falling error produces a negative D term that reduces the turn request.'],
  ]},
  '7-1': {'write-the-direction-above-every-transform':[
    ['frames','Plan view with axes at three distinct origins: field, robot, and camera. The target is ahead of the camera.','Start with the camera measurement, apply the measured camera mount, then apply the robot’s field pose.'],
  ]},
  '7-4': {'follow-one-delayed-correction-through-a-pose-history':[
    ['pose-replay','Predicted position goes from 1.00 m at capture to 1.20 m now. Correcting capture to 1.12 m and replaying 0.20 m of travel gives 1.32 m now.','The 1.15 m observation belongs at capture time. The current position includes the travel since then.'],
  ]},
  '9-3': {'put-the-clocks-on-a-timeline':[
    ['latency','Timeline in order: exposure, result ready, hub reads, command applied. A span from exposure to command shows end-to-end delay.','Frame cadence measures the gap between exposures. Capture-to-command delay follows one observation.'],
  ]},
};

export function illustrateLesson(path, sections, anchor, fallback) {
  const figures = placements[path];
  if (!figures) {
    return sections.map(([heading, blocks], index) =>
      [heading, index === 0 ? [blocks[0], fallback, ...blocks.slice(1)] : blocks]);
  }
  return sections.map(([heading, blocks]) => {
    const illustrations = figures[anchor(heading)] ?? [];
    if (!illustrations.length) return [heading, blocks];
    const table = blocks.findIndex(block => typeof block === 'object' && block.table);
    const insertAt = table < 0 ? 1 : table + 1;
    const images = illustrations.map(([figure, alt, caption]) => ({figure, alt, caption}));
    return [heading, [...blocks.slice(0, insertAt), ...images, ...blocks.slice(insertAt)]];

  });
}
