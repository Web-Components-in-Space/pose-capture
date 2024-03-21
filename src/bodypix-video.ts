import { VideoPoseBase } from './videopose-element';
import { load, processFrame, parts } from './tensorflow/bodypix.js';

export class BodyPixVideo extends VideoPoseBase {
    override get poseType() { return 'bodypix'; }

    override get parts() {
        return parts;
    }

    override async onMetadata() {
        super.onMetadata();
        await load();
        this.poseDetectionFrame();
    }

    async poseDetectionFrame() {
        if (this.isImage) {
            const result = await processFrame(this.imageEl, this.recordingStartTime as number, this.minConfidence / 100);
            this.onPoseFrame(result);
            this.forceOneTimePoseProcess = false;
            return;
        } else if ((this.isPlaying || this.forceOneTimePoseProcess) && this.videoEl.readyState > 1) {
            const result = await processFrame(this, this.recordingStartTime as number, this.minConfidence / 100);
            this.onPoseFrame(result);
            this.forceOneTimePoseProcess = false;
        }
        requestAnimationFrame( () => this.poseDetectionFrame());
    }
}

customElements.define('bodypix-video', BodyPixVideo);
