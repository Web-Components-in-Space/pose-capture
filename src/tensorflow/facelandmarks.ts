// @ts-ignore
import { facelandmarks } from '../libs/facelandmarks-bundle.js';
import '../libs/tensorflow-bundle.js';
import { FaceLandmarksDetector } from "@tensorflow-models/face-landmarks-detection/dist/types";
import {
    AnnotatedPrediction,
} from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';
import { Keyframe, Point, VideoPoseBase } from '../videopose-element';

let model: FaceLandmarksDetector;

export interface FacelandmarksOptions {
    maximumFaces: number;
    minConfidence: number;
    includeMeshPoints?: boolean;
}

export const load = async function() {
    model = await facelandmarks.load(
        facelandmarks.SupportedPackages.mediapipeFacemesh);
}

export const processFrame = async (source: VideoPoseBase | ImageBitmap | HTMLImageElement | ImageData, recordingStartTime: number, options: FacelandmarksOptions) => {
    const keyframes: Keyframe[] = [];
    const width = ((source as VideoPoseBase).naturalSize?.width || (source as HTMLImageElement).naturalWidth );
    const height = ((source as VideoPoseBase).naturalSize?.height || (source as HTMLImageElement).naturalHeight );
    const aspectRatio  = ((source as VideoPoseBase).aspectRatio || width / height );
    if (model) {
        const predictions: AnnotatedPrediction[] = await model.estimateFaces({
            input: (source as VideoPoseBase).videoElement || source,
        });

        const numPredictions = Math.min(predictions.length, options.maximumFaces || 1);
        for (let p = 0; p < numPredictions; p++) {
            const prediction = predictions[p];
            if (options.minConfidence <= prediction.faceInViewConfidence) {
                const mesh: number[][] = (prediction.scaledMesh as number[][]).slice();
                const keyframe: Keyframe = {
                    time: Date.now() - recordingStartTime,
                    pose: p,
                    points: [],
                    score: prediction.faceInViewConfidence,
                    aspectRatio: aspectRatio
                }

                Object.keys((prediction as any).annotations).forEach((name: string) => {
                    const cluster = (prediction as any).annotations[name];
                    const pt: Point = {
                        name,
                        positions: []
                    }
                    for (let c = 0; c < cluster.length; c++) {
                        const point = cluster[c];
                        pt.positions?.push([
                            point[0] / width,
                            point[1] / width,
                            point[2]
                        ]);

                        if (options.includeMeshPoints) {
                            // prune any found and annotated points from the mesh list
                            const found = mesh.findIndex(meshcoord => {
                                return point[0] === meshcoord[0] &&
                                    point[1] === meshcoord[1] &&
                                    point[2] === meshcoord[2];
                            });
                            if (found !== -1) {
                                mesh.splice(found, 1);
                            }
                        }
                    }
                    if (pt.positions && pt.positions.length > 0) {
                        keyframe.points.push(pt);
                    }
                });

                // add rest of un-named mesh points
                if (options.includeMeshPoints) {
                    const pt: Point = {
                        positions: []
                    }
                    for (let d = 0; d < mesh.length; d++) {
                        const point = mesh[d];
                        pt.positions?.push([
                            point[0] / width,
                            point[1] / height,
                            point[2]
                        ]);
                    }
                    if (pt.positions && pt.positions.length > 0) {
                        keyframe.points.push(pt);
                    }
                }
                keyframes.push(keyframe);
            }
        }
    }
    return keyframes;
}
