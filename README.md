# 🛤 [redux](https://github.com/reactjs/redux)-track

![Coverage Status](https://coveralls.io/repos/github/Contiamo/redux-track/badge.svg?branch=master)]
![Travis CI Build Status](https://travis-ci.org/Contiamo/redux-track.svg?branch=master)

Ever wanted to track the state of your Redux-powered application without having to add a bunch of metadata to your actions? We did at [Contiamo](https://contiamo.com/), and so I thought I'd build `redux-track`.

## What is it?

If you're unfamiliar with [Redux](https://github.com/reactjs/redux), I'd highly recommend reading up on it. It's a predictable state container for your apps: basically, it allows you to easily track and manage the _state_ of your application.

It also allows you to put middlemen (read: middleware) between the thing that updates the state and the actual state update itself. That's what this is: when you say _"HEY REDUX, UPDATE THE STATE!"_, this little piece of code is run _just before_ Redux says _"OK WILL DO THX"_.

This little piece of code runs a function that you give it in your action under the key `reduxTrack` that handles the rest for you, since most tracker functions carry similar (if not the same) call signatures:

`(name: string, payload: { [key: string]: any }) => void`.

## How do I use it?

Simple!

* `yarn add redux-track`
* Apply the middleware to your redux store in similar fashion:

```js
import { createStore, applyMiddleware } from "redux"
import { reduxTrack } from "redux-track"
import { rootReducer } from "./reducer"

export const myStore = createStore(rootReducer, applyMiddleware(reduxTrack))
```

**Note:** you probably have other middlewares going on. Redux Middleware is _composable_, so you can just add it on to a list if you need to.

* Find a Redux action/action creator that you'd like to track with your event tracker.
* Reference your event tracker's tracking function in a `reduxTrack` property on the action.

Fore more detailed instructions, see the case studies below.

### Case Study: Generic Event Tracker

So at Contiamo, we have our own _really cool_ event tracker that we built in-house. It's fairly similar to others out there: you include a snippet in your HTML page before `</body>` that registers a global at `window.contiamo`, that you can track events with by invoking `contiamo.event('name', { any: 'thing', can: 'go', in: 'here' })`, which is then sent to our platform.

To use this with `redux-track`, we simply update one of our actions from our codebase, say one that handles _pagination_, to reference this function in a property called `reduxTrack`. Concretely, here is what this looks like:

#### BEFORE

```js
dispatch({
  type: "GO_TO_PAGE",
  page: 3,
})
```

#### AFTER

```js
dispatch({
  type: "GO_TO_PAGE",
  page: 3,
  reduxTrack: contiamo.event,
})
```

and _bam_ 💥 we have tracking. It is _painless_. The middleware invokes `action.reduxTrack` with the same call signature as our tracker. Of course, you're welcome to roll your own function that adapts to this signature. Our research has show that _most_ event trackers have fairly similar call signatures in their tracking functions.

This would send an event to our backend titled `GO_TO_PAGE`, with the content of the Redux action, minus the `type` and `reduxTrack` properties: effectively giving us _what_ happened and _all relevant metadata at the time of dispatch_.

But what if your event tracker has a _different_ call signature? Well, read on.

### Case Study: Google Tag Manager

Everyone uses [Google Tag Manager](https://www.google.com/analytics/tag-manager) to track stuff, right? It's so easy! They give you a snippet, and then an event tracker! So cool! Here's how it would work in a typical Redux app with `redux-track`:

First, Add your tracking code to your webpage, it looks something like this:

```html
  <!-- Global Site Tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_TRACKING_ID');
  </script>
```

Then, [to track events](https://developers.google.com/analytics/devguides/collection/gtagjs/events), invoke the global `gtag` function as so:

```js
gtag("event", "event_name", {
  // Event parameters
  parameter_1: "value_1",
  parameter_2: "value_2",
  // ...
})
```

#### That's great, but how do I get this to work with Redux?

This requires some fun coding, because `gtag`'s event tracker has a _slightly different_ call signature: you need to tell it the _type_ of event, and then the event name and relevant metadata.

For comparison,

This middleware expects:

`(eventName: string, eventMetadata: {}) => void`

Google Tag Manager gives you:

`(hitType: string, eventName: string, eventMetadata: {}) => void`

🤔 How can we solve this? Well, write an adapter as so:

```js
const myEventTracker = function() {
  return gtag("event", ...arguments)
}
```

From there, it's fairly simple: find an [action creator](https://redux.js.org/docs/basics/Actions.html#action-creators) in your code, or a dispatch call. It would typically look something like this:

```js
function addTodo(text) {
  return {
    type: ADD_TODO,
    text,
  }
}
```

and reference this newly created function `myEventTracker` in a `reduxTrack` property as so:

```js
function addTodo(text) {
  return {
    type: "ADD_TODO",
    text,
    reduxTrack: myEventTracker,
  }
}
```

Simple! You now have your action(s) sending events to Google Tag Manager. Yay!

## Contributing

lol this is far from a perfect implementation of anything. I just made it to help one of our internal projects at Contiamo. I love collaboration. I love Pull Requests. Give me some! WOOOO! 🎉
