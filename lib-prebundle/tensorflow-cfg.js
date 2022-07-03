import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';

export default [
  {
    input: './lib-prebundle/tensorflow-bundle.js',
    output: {
      dir: 'libs',
      format: 'es',
    },
    plugins: [nodePolyfills(), commonjs(), nodeResolve()],
  },
  {
    input: './lib-prebundle/bodypix-bundle.js',
    output: {
      dir: 'libs',
      format: 'es',
    },
    plugins: [nodePolyfills(), commonjs(), nodeResolve()],
  },
  {
    input: './lib-prebundle/facelandmarks-bundle.js',
    output: {
      dir: 'libs',
      format: 'es',
    },
    plugins: [nodePolyfills(), commonjs(), nodeResolve()],
  },
  {
    input: './lib-prebundle/handpose-bundle.js',
    output: {
      dir: 'libs',
      format: 'es',
    },
    plugins: [nodePolyfills(), commonjs(), nodeResolve()],
  },
  {
    input: './lib-prebundle/mediapipepose-bundle.js',
    output: {
      dir: 'libs',
      format: 'es',
    },
    context: 'window',
    plugins: [
      nodePolyfills(),
      nodeResolve(),
    ],
  },
  {
    input: './lib-prebundle/posedetection-bundle.js',
    output: {
      dir: 'libs',
      format: 'es',
    },
    plugins: [
      alias({
        entries: [
          {
            find: '@mediapipe/pose',
            replacement: './libs/mediapipepose-bundle.js',
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
];
