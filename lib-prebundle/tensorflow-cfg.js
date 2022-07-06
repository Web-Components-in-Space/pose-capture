import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy'

export default [
  {
    input: './lib-prebundle/tensorflow-bundle.js',
    output: {
      dir: 'src/libs',
      format: 'es',
    },
    plugins: [nodePolyfills(), commonjs(), nodeResolve(), commonjs() ],
  },
  {
    input: './lib-prebundle/bodypix-bundle.js',
    output: {
      dir: 'src/libs',
      format: 'es',
    },
    plugins: [ nodePolyfills(), commonjs(), nodeResolve() ],
  },
  {
    input: './lib-prebundle/facelandmarks-bundle.js',
    output: {
      dir: 'src/libs',
      format: 'es',
    },
    plugins: [ nodePolyfills(), commonjs(), nodeResolve() ],
  },
  {
    input: './lib-prebundle/handpose-bundle.js',
    output: {
      dir: 'src/libs',
      format: 'es',
    },
    plugins: [nodePolyfills(), commonjs(), nodeResolve() ],
  },
  {
    input: './lib-prebundle/mediapipepose-bundle.js',
    output: {
      dir: 'src/libs',
      format: 'es',
    },
    context: 'window',
    plugins: [ nodePolyfills(), nodeResolve() ],
  },
  {
    input: './lib-prebundle/posedetection-bundle.js',
    output: {
      dir: 'src/libs',
      format: 'es',
    },
    plugins: [
      alias({
        entries: [
          {
            find: '@mediapipe/pose',
            replacement: './src/libs/mediapipepose-bundle.js',
          },
        ],
      }),
      nodePolyfills(),
      commonjs(),
      nodeResolve(),
      replace({
        'pose.Pose': 'window.Pose'
      }),
    ],
  },

  // The below is just a copy task, but it needs a file
  // to use as the input - so its a dummy file that does nothing
  {
    input: './lib-prebundle/dummyfile.js',
    plugins: [
      copy({
        targets: [
          { src: 'src/libs', dest: './' }
        ]
      })
    ]
  }
];
