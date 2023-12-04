// @ts-ignore
import * as handPoseDetection from '../libs/handpose-bundle.js';
import '../libs/tensorflow-bundle.js';
import { HandDetector, Hand } from '@tensorflow-models/hand-pose-detection';
import {Keyframe, VideoPoseBase} from '../videopose-element';
import { Keypoint } from '@tensorflow-models/hand-pose-detection/dist/types';

const handpose = handPoseDetection.handpose;
export const parts = handPoseDetection.constants.MEDIAPIPE_KEYPOINTS;

let detector: HandDetector;

export const load = async function() {
    const model = handpose.SupportedModels.MediaPipeHands;
    const detectorConfig = {
        runtime: 'tfjs', // mediapipe',
        modelType: 'full'
    };
    detector = await handpose.createDetector(model, detectorConfig);
}

export const processFrame = async (source: VideoPoseBase | ImageBitmap | HTMLImageElement | ImageData, recordingStartTime: number, minConfidence = 0) => {
    const keyframes: Keyframe[] = [];
    const width = ((source as VideoPoseBase).naturalSize.width || (source as ImageBitmap | HTMLImageElement | ImageData).width );
    const height = ((source as VideoPoseBase).naturalSize.height || (source as ImageBitmap | HTMLImageElement | ImageData).height );
    const aspectRatio  = ((source as VideoPoseBase).aspectRatio || width / height );
    if (detector) {
        const hands = await detector.estimateHands((source as VideoPoseBase).videoElement || source);
        hands.forEach( (hand: Hand, index) => {
            if (hand.score > minConfidence) {
                const keyframe: Keyframe = {
                    time: Date.now() - recordingStartTime,
                    score: hand.score,
                    pose: index,
                    points: [],
                    aspectRatio: aspectRatio
                }
                // Todo: keypoints3D are in meters, how best to surface this data?
                // console.log(hand.keypoints3D)
                hand.keypoints?.forEach((keypoint: Keypoint) => {
                    keyframe.points.push({
                        name: keypoint.name,
                        position: [
                            keypoint.x / width,
                            keypoint.y / height]
                    });
                })
                keyframes.push(keyframe);
            }
        });
    }
    return keyframes;
}
