### Step 2 - Make a Scrubbable Video Player
Sorry, but we won't be testing today, so I'm going to get rid of the few test files we have just to clean things up.
But after that, as our first step, let's just create a normal video player and see if we can play simple video files.

We're going to start with an extremely simple "base" player to inherit from. This will come in handy when we have 
a player that needs to act like a video player but instead plays pose keyframes. 

With the base player in, we'll add the `VideoElement` class to extend it such that it can actually play videos.

There are some things to notice as we work on this plain Web Component with no help from Lit. We're stuck using just the 
web standards here. You can see that we actually have to create a `shadowRoot` to use the Shadow DOM. And of course,
to populate our component, we're setting the `innerHTML`, even adding a `style` block.

Another thing that Lit usually takes care of for us, is "reflection". This is where
we can set either attributes through HTML or properties through Javascript, and they keep
in sync with one another. 

For example, we want to set our `src` to a video URL. We can do this by setting `myelement.src`, 
or setting the `src` attribute in HTML. If we do it one way, we need to be able to retrieve the same value
back. To do this, we need to basically use a getter and setter when using Javascript. This can set the attribute,
and then we use an attribute callback handler to listen and set the internal backing property.

The important thing is to rely on the attribute to make changes, and when we listen to the attribute
changes, we can take action on the change and update the internal property. You have to be careful, because
it can be super easy to get into an infinite loop here when syncing!

The other thing here is that attributes are case-sensitive! So I'll typically lowercase these
attributes so there's no confusion on how to case them.

After all of this, we'll make a demo page, which entails tweaking our `index.html` to show that we're linking
to our `video-element` demo. And then inside the `dev` folder, we'll change `index.html` to `video-element.html`
because we're going to end up with a few different demos.

Unfortunately, as we build out our demo page, we can't autoplay this when the page loads because browsers don't
allow autoplaying without first interacting with the page. So we'll make a quick play button
on our demo page which interacts with the `video-element` component.

With our video playing now, it might be nice to sprinkle in some events to get some information
about things like when it's playing and the current playback time. We can just 
use simple events. These won't carry any custom information with them, so just using
`Event` rather than `CustomEvent` should be perfectly fine. We will add a simple `Event` file so we aren't
hard-coding our strings in the video player.

As we add these events, we can add a couple listeners on our demo page and see this in action.

It would also be nice to demo our webcam, so we'll add a little checkbox to turn on or off the 'useCamera'
property and attribute.

We'll finish this step up there, but before we do, you may notice your IDE flagging
a few new files as untracked by git. The Lit template has compiled our Typescript and dumped
them in the root of our project.

This is interesting! When we publish our project, this template is having us build out
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