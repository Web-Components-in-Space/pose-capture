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