// @ts-ignore
import { posedetection, PoseDetector } from '../../libs/posedetection-bundle.js';
import '../../../libs/tensorflow-bundle.js';

let detector: PoseDetector;

export const load = async function() {
    const model = posedetection.SupportedModels.BlazePose;
    detector = await posedetection.createDetector(model, {
        runtime: 'mediapipe',
        modelType: 'BlazePose',
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1630009814`
    });
}

export const processFrame = async (source: HTMLImageElement) => {
    if (detector) {
        const poses = await detector.estimatePoses(source);
        return poses[0]
    }
}
