// @ts-ignore
import { posedetection, PoseDetector } from '../libs/posedetection-bundle.js';
import '../libs/tensorflow-bundle.js';
import { Keyframe, VideoPoseBase } from '../videopose-element';
import {  Pose, Keypoint } from '@tensorflow-models/pose-detection';

let detector: PoseDetector;

export const load = async function() {
    const model = posedetection.SupportedModels.BlazePose;
    detector = await posedetection.createDetector(model, {
        runtime: 'mediapipe',
        modelType: 'BlazePose',
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1630009814`
    });
}

export const processFrame = async (source: VideoPoseBase | ImageBitmap | HTMLImageElement | ImageData, recordingStartTime = 0, minConfidence = 0) => {
    const keyframes: Keyframe[] = [];
    const width = ((source as VideoPoseBase).naturalSize.width || (source as ImageBitmap | HTMLImageElement | ImageData).width );
    const height = ((source as VideoPoseBase).naturalSize.height || (source as ImageBitmap | HTMLImageElement | ImageData).height );
    const aspectRatio  = ((source as VideoPoseBase).aspectRatio || width / height );

    if (detector) {
        const poses = await detector.estimatePoses((source as VideoPoseBase).videoElement || source);
        if (poses) {
            poses.forEach((pose: Pose, index: number) => {
                const keyframe: Keyframe = {
                    time: Date.now() - recordingStartTime,
                    score: pose.score,
                    pose: index,
                    points: [],
                    aspectRatio
                }
                pose.keypoints?.forEach((keypoint: Keypoint) => {
                    if (keypoint.score && keypoint.score >= minConfidence) {
                        keyframe.points.push({
                            name: keypoint.name,
                            score: keypoint.score,
                            position: [
                                keypoint.x / width,
                                keypoint.y / height,
                                keypoint.z as number
                            ]
                        });
                    }
                });
                if (keyframe.points.length > 0) {
                    keyframes.push(keyframe);
                }
            });
        }
    }
    return keyframes;
}
