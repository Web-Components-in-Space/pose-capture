### Final Step - Publishing and Sample App
I'm sure there are going to be many little bugs to fix, but overall, our components seem
to work fairly well! I think it's time to get this published. We can explore some of the tools that Lit
gives us with the template we cloned.

As a first step, lets try some linting. Lit has a nice `lit-analyzer` tool to check for any mistakes
you may have made. And as we run `npm run lint`, we see that YES, there are a couple of 
mistakes in the `playbackcontrols.ts` file. 2 of the lit decorators we're using have been marked with the 
wrong property type. So lets fix that.

Once that's done, there's a few Typescript issues. Nothing major. I DID use `any` and `@ts-ignore` at a
few spots because I didn't want to dwell on finding the exact right Typescript solution,
but the rest is complaints that I shouldn't type variables that can be "trivially inferred".
Lets try the `--fix` option it recommends to see if these can be corrected automatically.

Using `eslint 'src/**/*.ts' --fix`, it does correct all of those "trivial type" issues.

Before continuing on, we should create an entry point for our component and edit some fields
in our package.json to make this component truly our own. We'll create `pose-capture.ts` and export
all of our components within this package that folks may want to use.

This will now help to generate a "Custom Elements Manifest". This is a JSON file that lists your components and their APIs.
We can run `npm run analyze` and a `custom-elements.json` file is created.

Next, lets see if we can use another tool to check the size. I don't expect this to be small AT ALL. We're
using some big pre-bundled Tensorflow.js libraries, and if you consume all of them, I'm sure its big.
Unfortunately, running `npm run checksize` fails. This points out a problem with consuming the package.
The bundler for calculating size uses the generated top-level JS files (just like a consumer would), and it errors out!
This is because the relative paths where our code looks for these "pre-bundled" Tensorflow files aren't actually the same for
our Typescript sources and our transpiled Javascript. So lets modify our `lib-prebundle` task to put the Tensorflow bundles in
the `src/libs` folder for local dev and then copy them over to another top level `libs` folder for normal external consumption.

With that in place, yep, `npm run checksize` reports our `pose-capture.bundled.js` comes in at 3.61MB for everything together.

We can keep going and edit markdown in the docs site to make some snazzy docs. Once we're satisfied, we can publish on NPM and make a
quick demo app!

### Step 7 - Visualization & Playback
We've verified pose events coming out of our components! But what good are they if we can't see them?
We're going to need to visualize these keyframe and all the points. Not only does it look cool, but
it helps verify that we're recording them correctly. We should be able to watch these visualizations live with
the videos as they appear over the bodypart they represent.

What's the best way to do this, though? I don't think we want a particular way of visualizing these points to be
hardcoded into our components. Maybe the best way is to take the approach we used with our player controls UI and make
it a slot that has a certain API that we use to send keyframes to. Even better, because we're using Typescript, we can make 
a lightweight abstract class that any visualization solution can inherit from.

So, lets add that abstract class AND an example visualization component. Again, it's just an example, and any consumer
of this project can simply make their own with the same API (just like the player controls).

After adding those components, we can simply add some code in our `videopose-element` to update any slots with the new
keyframes when they get calculated and `onPoseFrame` gets called.

I also think it might be a great time to add some better demo videos. I'm not SUCH a fan of checking in big files to git
that don't take advantage of source control, but I don't know of an easier/better way to have sample files as part of this repo
that will ALSO get deployed to a demo site.

Regardless, these new sample videos will better highlight specific areas of pose capture (face, body, hands).

As we try these new demo files, the record button on our player controls is definitely sticking out as something we haven't taken
advantage of yet. Pressing the record button and then ending the record session seemingly doesn't do anything, but that's
simply because we aren't listening for the right event in our demos. 

With that in mind, lets create a common demo function to listen for the `endrecording` event, create a downloadable file, and
add a link to our demo page that a user can click on and download this file.

Trying it out, it works! We can open this JSON file in our editor and see the pose data and even the audio data (if we recorded audio).
But what to do with this file? Well, think back to our original component inheritance. We started with `baseplayer` which we then
extended to `video-element` which can play videos. Let's use this `baseplayer` class to create a `pose-player`. This new pose player
will consume these new JSON files and play them back, just as if we were using a video source, except we don't have one!
We're not using Tensorflow.js at all in this player, just playing back the keyframes.

With that in place, we can create a demo page and offer a menu to choose a recording from any of our pose components (face, body, hands).
Already I'm seeing some things to take care of in the future like making the slow playback on this `pose-player` work.

### Step 6 - Adding our Pose Components
First lets start by backing out our demo code, and continue by adding all of the code to run our components.
We'll start by filling in our `src/tensorflow` folder with the code that enables us to process a frame of an image source
(images OR frames from videos).

These modules will process an input, and create a JSON representation of a keyframe including 
point positions, and other helpful things like aspect ratio of the image processed, time, etc.

The points we'll be returning will NOT be pixel values, but instead values of 0-1
where 0 is the furthest left or furthest top, and 1 is the opposite. This will let us
scale to fit these points and draw them in whatever size container we need.

Next we'll create a `videopose-element` which extends the `video-element`. This component won't
yet be the final component that gets consumed but serves as a yet another building block that
has a lot of common functionality needed to give us each and every pose component variation.

We'll also build some functionality in this base class to record keyframes and even audio so that both
can be played back simultaneously.

One other thing we'll additionally want is the ability to either send events with keyframe pose data in them
or take action on a slotted component to show these keyframes. More to come on this in the next step!

With this `videopose-element` in place, we can now just add each of our various pose components. Again, that's
"posedetection" and "bodypix" for full body capture, "facelandmarks" for a face mesh, and finally "handpose" for 
capturing your hand and fingers.

We do want a way to test our components out prior to visualizing the points, so I'd like to add one more
subclassed event. This will be the `keyframeevent` and in addition to holding keyframes with points,
there will also be a way to filter just the "parts" you want. So for example, if you only wanted an elbow 
position, there's a method on this subclassed event to get it.

Lets add all of those component demos to our project and try them out!

### Step 5 - Using Rollup Bundles to use Tensorflow.js
There are a number of Tensorflow.js packages we'll be wanting to use. We'll make several components.
Both "BodyPix" and "PoseDetection" can tackle whole body pose tracking, meaning it'll track points
from your head/eyes/ears, down to your ankles. 

"Hand-Pose-Detection" tracks keypoints along your hands only, and "Face-Landmarks-Detection"
grabs an entire 3D face mesh.

Meanwhile, there are a few foundational packages to enable these and provide some core Tensorflow.js functionality.
We have "tfjs-core", "tfjs-converter", and "tfjs-backend-webgl" to give us some zippier WebGL computational power.

We'll install all of these, but we'll find that we immediately run into issues using them. 
Of course we should try! So, let's add a tiny little import in our top level "index.html" file and
run the `npm run serve` task to show the demo.

Right away we see CommonJS issues as we import. We've covered using Web Dev server plugins in a previous
episode, but even as we use plugins to help here, we have some Node.js issues. Meaning there is some code that
gets executed that is supposed to run in Node.js. It SHOULD fail gracefully, but when importing these Node.js
object aren't found and it throws errors. There are some other weird issues once we get past these as well.

I spent a lot of time playing whack-a-mole with all of these issues. I personally couldn't get it working with
Web Dev Server. But also, why SHOULD this work with Web Dev Server? Why should a component we're making for external
use require very specific Web Dev Server plugins and setup?

I've stumbled on a strategy in the past to help with tricky situations like this one, and that is to "pre-bundle" with Rollup
as ES Modules we can use instead of reaching out to our `node_modules` folder.

So lets get cracking! Since I've already spent time pulling out my hair on this, I know we need two extra Rollup plugins that
aren't included with this Lit template. As I hinted, they are `@rollup/plugin-commonjs` for working with CommonJS files and 
`rollup-plugin-node-polyfills` for polyfilling Node.js code with harmless (non-error throwing) browser compatible Javascript.
There's also `@rollup/plugin-alias` so we can alias an internal import and switch out a dependency with our own pre-bundled one.
We're also using the `@rollup/plugin-replace` plugin to do some sneaky variable name replacement, but since this is already
installed with the Lit template, we're fine there.

After `npm install`, we can start creating a Rollup configuration for bundling. We already do have a `rollup.config.js` at our project
root. This is usually what we'd use for bundling our entire component, so let's not put our "pre-bundling" config here.
Instead, I'm going to make a folder called "lib-prebundle" and put our Rollup config in here.

For each of our pose solutions (whether for whole body, face, or hands), we'll pop in a "bundle" file.
These JS files will simply `export * as` for whatever solution we're bundling. This simple import
will get the files into Rollup, where Rollup will bundle these as ES Module based bundles that we can simply import and dump
these bundles into a "libs" folder in our project.

Once this is all setup, we can add a "lib-prebundle" task to our `package.json`. After running this new task, we now
see our brand new bundles in our "libs" folder.

With those now created, lets do a simple import and see if anything crashes (good news it doesnt!).

Now let's really try this, lets create something to take in an image, and output a pose. We'll keep working in this
demo index.html file for now. However, we will create a new 'posedetection.ts' file inside our "src" directory as something
we'll expand on in the future.

Temporarily, I've added a "dancer.webp" image to the root folder for our demo to pick up and analyze the pose.
I wasn't sure how well this would work because this lady is in a dress that covers a lot of her legs up,
but rendering these points to the canvas, it seems to work super well!

Interestingly enough, we see that we can either get `keypoints` OR `keypoints3D`. That's pretty cool right?
Some of these Tensorflow.js modules do offer 3D points, which is exciting, however we'll be focusing on 2D primarily
in our component since we want to overlay the points over our video and when grabbing the 3D points,
they are offered in meters. Someday we'll do the conversion, but not today!

So this step was probably the most difficult to work out for this project. There's lots 
to overcome as we adapt these packages to work with ES modules, but through lots of time poking around, 
it's able to be done, and we can offer everything as a simple Web Component that works with simple
imports.

In our next step, we'll be fleshing out our `pose-player` package with actual pose components.




### Step 4 - Extending Web Dev Server with Range Requests
So, the player works pretty well, but looks like we can't scrub or use the step
frame buttons.

It's an interesting reason that has nothing to do with our code. The reason is that 
Web Dev server does not support partial ranges. This is important when working with 
progressively downloaded video.

You can do a simple play because the bytes that get requested from the server is in order
and keeps streaming "progressively" as you play it.

However, to fast-forward to another part of the video, you might have to wait until
the entire video has been buffered. Ideally, you'd be able to request specific bytes
from the middle of the video. So, your server has to support a feature called "HTTP Range Requests".

This is true even if we were using a normal HTML Video element rather than our custom Web Component
based player.

As it happens, this is an incredibly easy, but obscure fix! To add support, we need to recognize
that Web Dev Server is built on top of something called "Koa". Koa, https://koajs.com, is a web framework
that runs on Node.js. It's a lot like "Express". If you've ever built an app with Node for building something
like a REST service, you might have use Express.

Koa is similar with some architectural differences, but seems to solve approximately the same types 
of problems. It also offers middleware plugins which can change how Koa works with and handles server requests.

We're going to add "koa-range" to Web Dev Server by simply doing `npm install koa-range --save-dev`, and then
adding it to our `web-dev-server.config` in the `middlewares` list.

Of course nothing is TOO easy, because we get complaints that Koa-Range is using CommonJS and not ES Modules.
Oops! We'll simply need to convert our `web-dev-server.config.js` to `web-dev-server.config.cjs` and change the 
configuration object within to CommonJS.

Now as we restart Web Dev Server and use our demo, we can scrub! We have a video player!
And onto the exciting and more difficult part, getting Tensorflow.js pose capture working...

### Step 3 - Adding Player Controls and Subclassing Event
Ideally, we wouldn't need that extra play button in our demo. Instead,
actual player controls sitting at the bottom of our player would be great.

So, we're going to quickly copy in some UI elements that I previously created.
What's neat about these elements is that they DO use Lit, whereas the actual component
that'll host them (the video player), does not. But past that, they are pretty normal
and minimal UI components which ultimately make up the "playbackcontrols" component.

Instead of instantiating the controls inside the component directly, it might be best
to make them optional. This means that the `video-element` component consumer can
use them or not.

So here's what we'll do: add them as slots! As we add the controls to our project, Typescript 
generates the `ui/playbackcontrols.js` to our root for us. So we'll pop the new
playback controls right into our demo by both importing the JS and adding the markup
as a child of `video-element`.

We'll also need to add a `slot` element to our `video-element` component and do some light
styling to give anything in the slot 100% width as well as absolute positioning to make any slotted
elements overlay over the player instead of flow in a layout.

As we pop that in we'll notice that the control bar is there in our demo, but 
doesn't have any controls yet. This is because we haven't passed it our player state yet,
so it doesn't know we're ready to use the controls. 

So, we're going to add an `updateControls` method and sprinkle in some calls when the video
metadata is loaded and when our timer fires to update our current playback time.

This `updateControls` method is interesting! You can see how we can query and iterate through our
slotted elements, whatever they may be and set information on each one. We actually will have one more
slotted element by the time we're done, but the point here is that anyone using this could make their
own element, and if it followed the `PlayerState` interface we created in Typescript, it can easily
be dropped into the slot.

I think this is important because the controls might not have the visual look you want or even the controls
and features you necessarily want. Consumers of this player component can easily make their own
and drop them in easily.

So that covers communication into our controls (or any other slotted elements), but what if we want to listen
for events from the controls? Well, we have several types of events to listen for: play/pause, timeline scrubbing, stepping,
and even more once we make this more than a video player! We also want the event to carry with it
all of our player state, the same properties that we just pushed out to the slots. So there's a fair bit of info to carry
with what would be more convenient as a single event we can listen to, rather than having multiple events that we'd have
to set up multiple listeners for.

In past episodes we explored the `CustomEvent` and I said there was a newer and better way.
If you recall, `CustomEvent`s can carry that extra information. But you have to initialize those each and every time
with this extra information. And as we explored before, and even in this project, it's nice to have string constants
for these events, so they can be auto-completed from Typescript instead of you typing strings every time that can easily be
messed up. You can see these constants in our `events.ts` class.

But for this new `PlaybackEvent`, we're going to subclass your normal, everyday event. When doing this, we can
actually keep those constants inside the new event class! No external dependencies. You want info about an event you're receiving,
just look at the subclassed `PlaybackEvent`!

Additionally, we can have extra logic inside the event itself. We're going to be a bit lazy, and pass our complete `VideoElement`
component instance into the event to capture our `PlayerState`. Inside the event, we'll have a simple method to capture only the
properties we need without passing on the entire `VideoElement` component to receivers of the event.

You might imagine that we can add lots more functionality to these everyday events, but for this, it's all we need. As I said in past episodes,
subclassing Events are a bit of a game changer for me! `CustomEvent`s have always been a tiny bit annoying.

There's lots of player functionality that I did hand-wave over, but as we use the demo page, we can see a bunch of things working!
In fact, let's remove the play button from this demo page, as it's really not necessary anymore.

Also, notice that there's some whitespace above the controls, because our video's aspect ratio causes some
letter-boxing as it fills the component space. Let's add a default background color to our `video-element` component to make this 
look a little less confusing. As you can see in our demo, we can easily override this to a different color.

As we keep playing with our demo, there's one thing that looks broken - and that's scrubbing! We've learned a couple 
of new-ish things so far, but this is our first real weird problem! We'll solve it in the next step...




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