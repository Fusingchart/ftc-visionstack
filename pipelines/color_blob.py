"""Limelight SnapScript. Input BGR. User output: valid, cx px, cy px, area px²."""
import cv2
import numpy as np

LOW = np.array([22, 115, 90], dtype=np.uint8)
HIGH = np.array([39, 255, 255], dtype=np.uint8)
KERNEL = np.ones((3, 3), dtype=np.uint8)

def runPipeline(image, llrobot):
    if image is None or image.size == 0:
        return np.empty((0, 1, 2), dtype=np.int32), image, [0] * 8
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    mask = cv2.morphologyEx(cv2.inRange(hsv, LOW, HIGH), cv2.MORPH_OPEN, KERNEL)
    contours = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[-2]
    best = max(contours, key=cv2.contourArea, default=np.empty((0, 1, 2), dtype=np.int32))
    moments = cv2.moments(best) if len(best) else {"m00": 0}
    area = moments["m00"]
    if area < 40:
        return np.empty((0, 1, 2), dtype=np.int32), image, [0] * 8
    cx, cy = moments["m10"] / area, moments["m01"] / area
    cv2.drawContours(image, [best], 0, (255, 255, 255), 2)
    return best, image, [1, cx, cy, area, 0, 0, 0, 0]
