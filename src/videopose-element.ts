import { VideoElement } from './video-element';
import { Events} from './events';
import { PlaybackEvent } from './playbackevent';
import { KeyframeEvent } from './keyframeevent';
import { AbstractPoseVisualizer } from './abstractvisualizer';

export interface Point {
    name?: string;
    score?: number;
    position?: number[];
    positions?: number[][];
}

export interface Keyframe {
    time: number;
    pose: number;
    aspectRatio: number;
    score?: number;
    points: Point[];
}

export interface PoseRecording {
    keyframes: Keyframe[],
    audio?: string,
    duration: number
}

export class VideoPoseBase extends VideoElement {
    get poseType() { return 'posebase'; }

    get parts(): string[] { return []; }

    static override get observedAttributes() {
        return [ ...VideoElement.observedAttributes, 'minconfidence' ];
    }

    protected _keyframes: Keyframe[] = [];

    protected _minConfidence = Number(this.getAttribute('minconfidence'));

    protected hasStarted = false;

    protected audioRecorder?: MediaRecorder;

    protected audioData?: string;

    protected forceOneTimePoseProcess = false;

    protected recordingStartTime?: number;

    protected recordedAudio?: Blob;

    constructor() {
        super();
        this.addEventListener(PlaybackEvent.Type, this.handleControlsEvent as any);
    }

    public get keyframes() {
        return this._keyframes.slice();
    }

    public set minConfidence(percent: number) {
        this.setAttribute('minconfidence', String(percent));
    }

    public get minConfidence() {
        return this._minConfidence;
    }

    public get recording(): PoseRecording {
        return {
            keyframes: this.keyframes,
            audio: this.audioData,
            duration: this.recordingDuration
        }
    }

    public override step(frames: number) {
        super.step(frames);
        this.forceOneTimePoseProcess = true;
    }

    protected onPoseFrame(keyframes: Keyframe[]) {
        if (!this.hasStarted) {
            this.hasStarted = true;
            this.dispatchEvent(new Event(Events.POSE_TRACKING_STARTED, { bubbles: true, composed: true }));
        }
        const slot = this.shadowRoot?.querySelector('slot');
        if (slot) {
            slot.assignedElements().forEach( (slotted: any) => {
                if (slotted.draw) {
                    const viz: AbstractPoseVisualizer = slotted as unknown as AbstractPoseVisualizer;
                    viz.draw(keyframes, this.videoBounds);
                }
            });
        }

        if (keyframes.length > 0) {
            const event: KeyframeEvent = new KeyframeEvent(
                this.poseType,
                keyframes,
                {bubbles: true, composed: true});
            this.dispatchEvent(event);
        }

        if (this.isRecording) {
            this._keyframes.push(...keyframes);
        }
    }

    protected override onTimerUpdate() {
        if (this.isRecording && this.recordingStartTime) {
            this._recordingDuration = Date.now() - this.recordingStartTime;
        }
        super.onTimerUpdate();
    }

    startRecording(includeAudio = false) {
        if (this.isRecording) {
            return;
        }
        if (!this.isPlaying) {
            this.play();
        }
        this._isRecording = true;
        this._isAudioRecording = includeAudio;
        this.recordingStartTime = Date.now();
        this._keyframes = [];
        this.recordedAudio = undefined;
        this.audioData = undefined;
        this.updateControls();
        if (includeAudio) {
            const stream = (this.videoEl as any).captureStream();

            if (stream.getAudioTracks().length > 0) {
                const audiostream = new MediaStream();
                audiostream.addTrack(stream.getAudioTracks()[0]);
                const segments: Blob[] = [];
                this.audioRecorder = new MediaRecorder(audiostream);
                this.audioRecorder.ondataavailable = (e: any) => {
                    segments.push(e.data);
                }
                this.audioRecorder.onstop = () => {
                    this.recordedAudio = new Blob(segments);
                    const reader = new FileReader();
                    reader.readAsDataURL(this.recordedAudio);
                    new Promise(() => {
                        reader.onloadend = () => {
                            this.audioData = (reader.result as string).replace('application/octet-stream', 'audio/webm');
                            this.dispatchEvent(new Event(Events.END_RECORDING, { bubbles: true, composed: true }));
                        };
                    });
                }
                this.audioRecorder.start(1000);
            }
        }
    }

    stopRecording() {
        this._isRecording = false;
        this._isAudioRecording = false;
        if (this.recordingStartTime) {
            this._recordingDuration = Date.now() - this.recordingStartTime;
        }

        this.updateControls();
        if (this.audioRecorder) {
            this.audioRecorder.stop();
            this.audioRecorder = undefined;
        } else {
            this.dispatchEvent(new Event(Events.END_RECORDING, { bubbles: true, composed: true }));
        }
    }

    protected override onEnded() {
        super.onEnded();
        this.stopRecording();
    }

    protected override handleControlsEvent(e: PlaybackEvent) {
        super.handleControlsEvent(e);
        switch (e.action) {
            case PlaybackEvent.TOGGLE_RECORD_POSE:
                if (!this._isRecording) {
                  this.startRecording(false);
                } else {
                    this.stopRecording();
                }
                break;

            case PlaybackEvent.TOGGLE_RECORD_POSE_AND_AUDIO:
                if (!this._isRecording) {
                    this.startRecording(true);
                } else {
                    this.stopRecording();
                }
        }
    }

    protected override async attributeChangedCallback(name: string, oldval: string, newval: string) {
        await super.attributeChangedCallback(name, oldval, newval);
        switch (name) {
            case 'minconfidence':
                this._minConfidence = Number(this.getAttribute('minconfidence'));
                break;
        }
    }
}

customElements.define('videopose-element', VideoPoseBase);
