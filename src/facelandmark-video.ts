import { VideoPoseBase } from './videopose-element';
import {load, processFrame} from './tensorflow/facelandmarks';

export class FaceLandmarkVideo extends VideoPoseBase {
    override get poseType() { return 'facelandmark'; }

    override get parts() {
        return [
            'silhouette',
            'lipsUpperOuter',
            'lipsLowerOuter',
            'lipsUpperInner',
            'lipsLowerInner',
            'rightEyeUpper0',
            'rightEyeLower0',
            'rightEyeUpper1',
            'rightEyeLower1',
            'rightEyeUpper2',
            'rightEyeLower2',
            'rightEyeLower3',
            'rightEyebrowUpper',
            'rightEyebrowLower',
            'rightEyeIris',
            'leftEyeUpper0',
            'leftEyeLower0',
            'leftEyeUpper1',
            'leftEyeLower1',
            'leftEyeUpper2',
            'leftEyeLower2',
            'leftEyeLower3',
            'leftEyebrowUpper',
            'leftEyebrowLower',
            'leftEyeIris',
            'midwayBetweenEyes',
            'noseTip',
            'noseBottom',
            'noseRightCorner',
            'noseLeftCorner',
            'rightCheek',
            'leftCheek'];
    }

    static override get observedAttributes() {
        return super.observedAttributes.concat('maximumFaces', 'includeMeshPoints');
    }

    override async onMetadata() {
        super.onMetadata();
        await load();
        this.poseDetectionFrame();
    }

    async poseDetectionFrame() {
        const maximumFaces: number = this.hasAttribute('maximumFaces') ? Number(this.getAttribute('maximumFaces')) : 1;
        if (this.isImage) {
            const result = await processFrame(this.imageEl, this.recordingStartTime as number, {
                maximumFaces,
                minConfidence: this.minConfidence /100,
                includeMeshPoints: this.hasAttribute('includeMeshPoints') });
            this.onPoseFrame(result);
            this.forceOneTimePoseProcess = false;
            return;
        }
        if ((this.isPlaying || this.forceOneTimePoseProcess) && this.videoEl.readyState > 1) {
            const result = await processFrame(this, this.recordingStartTime as number, {
                maximumFaces,
                minConfidence: this.minConfidence /100,
                includeMeshPoints: this.hasAttribute('includeMeshPoints') });
            this.onPoseFrame(result);
            this.forceOneTimePoseProcess = false;
        }
        requestAnimationFrame( () => this.poseDetectionFrame());
    }
}

customElements.define('facelandmark-video', FaceLandmarkVideo);
