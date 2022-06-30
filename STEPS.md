### Step 2 - Make a Scrubbable Video Player
Sorry, but we won't be testing today, so I'm going to get rid of the few test files we have just to clean things up.
But after that, as our first step, let's just create a normal video player and see if we can play simple video files.

We're going to start with an extremely simple "base" player to inherit from. This will come in handy when we have 
a player that needs to act like a video player but instead plays pose keyframes.

After that we'll inherit from the base to make our "video-element", which supports simple video playback and swap out the sample
element demo for our `video-element`, adding in a sample video to play.

Unfortunately, we can't autoplay this when the page loads because Chrome doesn't
allow autoplaying without first interacting with the page. So we'll make a quick play button
on our demo page which interacts with the `video-element` component.

With our video playing now, it might be nice to sprinkle in some events to get some information
about things like when it's playing and the current playback time. We can just 
use simple events. These won't carry any custom information with them, so just using
`Event` rather than `CustomEvent` should be perfectly fine. We will add a simple `Event` file so we aren't
hard-coding our strings in the video player.

As we add these events, we can add a couple listeners on our demo page and see this in action.

We'll finish this step up there, but before we do, you may notice your IDE flagging
a few new files as untracked by git. The Lit template has compiled our Typescript and dumped
them in the root of our project.

This is interesting! When we publish our project, this template is having us deliver
these transpiled files at the root. Eventually we'll add an index.js as well to make consumption 
easier.

That said, we don't want to commit them. We'll add them to our `.gitignore` and when 
we publish to npm, we'll make sure to add these to our package.


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