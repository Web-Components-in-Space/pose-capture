### Step 1 - Clone from a Template

It's not always the best to start from scratch, in fact, it can get a bit monotonous. Using React, folks have always had the ability to use "Create-React-App".
Yes, it can tend to give you some stuff you don't need...and this will be no different here!

At least we can delete stuff we don't want after cloning.

There are two ways that I'm aware of to scaffold a project. The first is from OpenWC:
https://open-wc.org/docs/development/generator/.

This is a nice little generator, but I'm seeing a couple things I specifically don't want for this component. 
The first is that linting seems to solely rely on VS Code extensions. You don't get `.eslintrc` files or similar 
created in your project, but instead a VS Code config file is created and provides these for you.

Since I'm using WebStorm, and really don't want a VS Code lock-in, this doesn't really work for me! 
Especially if I put this up in a build system someday that can lint and check errors before doing a build, a VSCode config 
file isn't going to cut it.

Secondly, for your component demo, OpenWC uses Storybook. Storybook looks pretty nice, but
when I've seen it, it's really for demoing a number of components and usages of that component
at the same time. This is great, but what we're making today is VERY CPU/GPU/RAM intensive. I definitely
don't want to throw 10 or so component variations on a demo page! 
It'd probably be pretty slow and be insane to look at as we watch several videos at once.

So, for these reasons, I'm going to use a Lit starter kit: https://lit.dev/docs/tools/starter-kits/.
Some of this component DOES rely on Lit, so that'll be nice to get for no effort. It also automatically
creates a nice marketing/demo/documentation page for your component using Eleventy.

All in all, the Lit starter kit seems a bit more appropriate for what we're working on and how it should be consumed.

We can try a few commands right from the start, like viewing docs, running the a demo, linting and testing.

There are a few things to change, however. First, I'm going to remove polyfills from my demos and documentation.
After all, we're in the future! We don't need to support IE11, and all the evergreen browsers support Web Components.
Also...even if we wanted to support IE11 or older browsers, we really couldn't. Tensorflow.js as we'll be using needs
WASM, your GPU, and some other things that we'd NEVER get working in IE.