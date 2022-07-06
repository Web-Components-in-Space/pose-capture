---
layout: page.11ty.cjs
title: Pose Capture ⌲ Home
---

# Pose-Capture

Pose Capture is a package which contains a number of custom elements related to capturing and recording poses in 
various ways, all enabled by [Tensorflow.js](https://www.tensorflow.org/js/).

Each of these components act like a normal video player, but allow pose tracking, eventing, and
overlay visualization of the points.

These pose capture components can record keyframes to a JSON file, and offer the option
of recording audio from the video source to allow playback synced with the keyframe points.

Video sources can be a video file supported by your browser or your webcam. As video data needs
to be analyzed by Tensorflow.js, they are subject to the same security restrictions
as any video being captured to a `<canvas>` element. This typically means that your video
can't come from a different domain and must be done over HTTPS.

Most of the components DO deliver a depth coordinate to compliment the X/Y
coordinates, however as the first goal of this package is to overlay points accurately
over video, there hasn't been much thought put into how to normalize/use this 3rd dimension.
Additionally, some of these solutions can deliver full 3D keypoints as well, but these
are in meters, and don't map well to pixels on your screen. 

Hopefully the 3D story will be fleshed out in future updates.

## Main Components

The main components in this library serve to show video playback from a source,
whether a browser supported video file or a user's webcam.

Without the helper components listed below, these components will not show
visualization or a playback controls UI.

<br /><br />
### `<posedetection-video>`
`<posedetection-video>` is to capture full-body poses. The currently configured
Pose Detection solution uses [BlazePose](https://storage.googleapis.com/tfjs-models/demos/pose-detection/index.html?model=blazepose).

MediaPipe BlazePose can detect 33 keypoints, in addition to the 17 COCO keypoints,
it provides additional keypoints for face, hands and feet.

<br /><br />
### `<bodypix-video>`
`<bodypix-video>` is to capture full-body poses. The currently configured 
BodyPix solution tracks similar points as the `<posedetection-video>` above, but seems
a bit less accurate, at least the way it's configured in this package. BodyPix seems more appropriate for 
live segmentation, so the use-case presented here might not be appropriate for how it was 
intended. More exploration is needed, so unless you know what you're doing, you
may want to rely on `<posedetection-video>` instead.

<br /><br />
### `<facelandmark-video>`
`<facelandmark-video>` is to capture many points to create something that can 
be used as a 3D mesh of a person's face. 

This component uses [MediaPipe Facemesh](https://storage.googleapis.com/tfjs-models/demos/face-landmarks-detection/index.html) 
as the engine.

<br /><br />
### `<handpose-video>`
`<handpose-video>` is to capture points along a person's hand including along each of their fingers.

This component uses [MediaPipe Hands](https://storage.googleapis.com/tfjs-models/demos/hand-pose-detection/index.html?model=mediapipe_hands)
as the engine.

<br /><br />
### `<pose-player>`
`<pose-player>` is to playback keyframes and audio captured by the above components

<br /><br />
## Helper Components

Helper components are designed to live as children inside the main pose capture
components. They adhere to a specific API and live as slotted elements, where the parent
component passes playback state or keyframes to them.

These components have a specific look/style, that can be customized a small bit, but the intention
is for consumers of this package to create their own using either the `PlayerState` interface for 
creating UI controls, or the `AbstractVisualizer` class for visualization.

When adding both of these as children, be careful about order. A visualizer that takes
up the entire size of the component can block mouse input to the player controls.

<br /><br />
### `<pose-playback-controls>`
`<pose-playback-controls>` is a component designed to be a child inside an above
pose capture, and offers playback and recording controls for a video.

<br /><br />
### `<visualization-canvas>`
`<visualization-canvas>` is a component designed to be a child inside an above
pose capture, and offers an overlay layer to see points captured on a given keyframe
