# Releases
 - 0.4.0 Added "isimage" attribute to pose detection components to allow for image sources

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


## Setup

Install dependencies:

```bash
npm i
```

## Build

This project uses the TypeScript compiler to produce JavaScript that runs in modern browsers.

To build the JavaScript version of your component:

```bash
npm run build
```

To watch files and rebuild when the files are modified, run the following command in a separate shell:

```bash
npm run build:watch
```

Both the TypeScript compiler and lit-analyzer are configured to be very strict. You may want to change `tsconfig.json` to make them less strict.

## Testing

#### Note: There are no actual tests to run in this project yet
This project uses modern-web.dev's
[@web/test-runner](https://www.npmjs.com/package/@web/test-runner) for testing. See the
[modern-web.dev testing documentation](https://modern-web.dev/docs/test-runner/overview) for
more information.

Tests can be run with the `test` script, which will run your tests against Lit's development mode (with more verbose errors) as well as against Lit's production mode:

```bash
npm test
```

For local testing during development, the `test:dev:watch` command will run your tests in Lit's development mode (with verbose errors) on every change to your source files:

```bash
npm test:watch
```

Alternatively the `test:prod` and `test:prod:watch` commands will run your tests in Lit's production mode.

## Dev Server

This sample uses modern-web.dev's [@web/dev-server](https://www.npmjs.com/package/@web/dev-server) for previewing the project without additional build steps. Web Dev Server handles resolving Node-style "bare" import specifiers, which aren't supported in browsers. It also automatically transpiles JavaScript and adds polyfills to support older browsers. See [modern-web.dev's Web Dev Server documentation](https://modern-web.dev/docs/dev-server/overview/) for more information.

To run the dev server and open the project in a new browser tab:

```bash
npm run serve
```

There is a development HTML file located at `/dev/index.html` that you can view at http://localhost:8000/dev/index.html. Note that this command will serve your code using Lit's development mode (with more verbose errors). To serve your code against Lit's production mode, use `npm run serve:prod`.

## Linting

Linting of TypeScript files is provided by [ESLint](eslint.org) and [TypeScript ESLint](https://github.com/typescript-eslint/typescript-eslint). In addition, [lit-analyzer](https://www.npmjs.com/package/lit-analyzer) is used to type-check and lint lit-html templates with the same engine and rules as lit-plugin.

The rules are mostly the recommended rules from each project, but some have been turned off to make LitElement usage easier. The recommended rules are pretty strict, so you may want to relax them by editing `.eslintrc.json` and `tsconfig.json`.

To lint the project run:

```bash
npm run lint
```

## Formatting

[Prettier](https://prettier.io/) is used for code formatting. It has been pre-configured according to the Lit's style. You can change this in `.prettierrc.json`.

Prettier has not been configured to run when committing files, but this can be added with Husky and and `pretty-quick`. See the [prettier.io](https://prettier.io/) site for instructions.

## Static Site

This project includes a simple website generated with the [eleventy](11ty.dev) static site generator and the templates and pages in `/docs-src`. The site is generated to `/docs` and intended to be checked in so that GitHub pages can serve the site [from `/docs` on the master branch](https://help.github.com/en/github/working-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

To enable the site go to the GitHub settings and change the GitHub Pages &quot;Source&quot; setting to &quot;master branch /docs folder&quot;.</p>

To build the site, run:

```bash
npm run docs
```

To serve the site locally, run:

```bash
npm run docs:serve
```

To watch the site files, and re-build automatically, run:

```bash
npm run docs:watch
```

The site will usually be served at http://localhost:8000.

## More information
[Pose Capture Documentation Site](https://web-components-in-space.github.io/pose-capture/)
