export * from './bodypix-video';
export * as faceLandmarkVideo from './facelandmark-video';
export * as poseDetectionVideo from './posedetection-video';
export * as handPoseVideo from './handpose-video';
export * as posePlayer from './pose-player';
export * from './keyframeevent';
export * from './ui/playbackcontrols';
export * as visualizationCanvas from './visualization-canvas';
export * from './baseplayer';
export * from './events';

import * as TFPoseDetection from './tensorflow/posedetection.js';
import * as TFBodyPix from './tensorflow/bodypix.js';
import * as TFHandPose from './tensorflow/handpose.js';
import * as TFFaceLandmarks from './tensorflow/facelandmarks.js';

export const TensorflowProcessors = {
    posedetection: TFPoseDetection,
    bodypix: TFBodyPix,
    handpose: TFHandPose,
    facelandmarks: TFFaceLandmarks,
}