# Scroll View <span class="r-version-badge new">5.0.0</span>

As of reveal.js 5.0 any presentation can be viewed as a scrollable page. All of your animations, fragments and other features continue to work just like they do in the normal slide view.

Slide decks are a great format for giving presentations, but scrollable web pages are easier for viewers to read on their own.

The scroll view gives you the best of both worlds—without any extra effort. Present in the format best suited for presenting, share in the format best suited for consumption.

### What About Vertical Slides?

The scroll view flattens your deck into a single linear flow. All slides will appear in the order they were authored and there is no differentiation between horizontal and [vertical slides](/vertical-slides).

### Getting Started

The scroll view is activated by initializing reveal.js with `view: "scroll"`. Here's a demo of it in action.

    Reveal.initialize({
      // Activate the scroll view
      view: 'scroll',

      // Force the scrollbar to remain visible
      scrollProgress: true,
    });

## Scroll me!

## Slide with two fragments

## One

## Two

## Scrolling is even better

## Scrolling is even better

## with auto-animate!

## The end

## URL Activation

Want to enable scrolling for a deck without changing its config? Edit the URL and append `view=scroll` to the query string. For example, here's the main reveal.js demo in scroll view:  
<https://revealjs.com/demo/?view=scroll>

## Automatic Activation

The scroll view is great when browsing presentations on a mobile device. For that reason, we automatically enable the scroll view when the viewport reaches mobile widths.

This is controlled through the `scrollActivationWidth` config value. If you want to disable the automatic scroll view initialize your presentation with that value set to `null` or `0`:

    Reveal.initialize({
      scrollActivationWidth: null,
    });

## Scrollbar

We render a custom scrollbar for any presentation in scroll view. This scrollbar is broken up by slide so that users get a clear indication of when the slide will change.

The scrollbar also shows individual fragments within your slides. Slides with fragments are given more vertical space based on how many fragments there are.

By default, the scrollbar is automatically hidden when you stop scrolling. This behavior can be configured using `scrollProgress`.

    // - auto:     Show the scrollbar while scrolling, hide while idle
    // - true:     Always show the scrollbar
    // - false:    Never show the scrollbar
    scrollProgress: 'auto';

## Scroll Snapping

When scrolling reveal.js will automatically snap to the closest slide. This was picked as the default behavior because it's very comfortable to "flick" between slides this way on touch devices.

If you prefer, you can change it to only snap when you're close to the top of a slide using `proximity`. You can also disable snapping altogether by setting `scrollSnap` to `false`.

    // - false:      No snapping, scrolling is continuous
    // - proximity:  Snap when close to a slide
    // - mandatory:  Always snap to the closest slide
    scrollSnap: 'mandatory';

## Scroll Layout (experimental)

By default each slide will be sized to be as tall as the viewport. This looks great in most circumstances but can mean a bit of empty space above and below your slides (depending on the viewport and slide deck aspect ratio).

If you prefer a more dense layout with multiple slides visible in parallel, set the `scrollLayout` option to `compact`. This will size each slide to be as wide as the viewport and as tall as it needs to match your aspect ratio (slide width/height).

You can see the different between the two modes in the examples below. Starting with the compact layout.

    Reveal.initialize({
      view: 'scroll'
      scrollLayout: 'compact'
    });

## Slide one

## Slide two

## Slide three

## Slide four

Here's the same content with `scrollLayout` set to the default (`'full'`).

    Reveal.initialize({
      view: 'scroll'
      scrollLayout: 'full' // this is the default value
    });

## Slide one

## Slide two

## Slide three

## Slide four

## Examples

If you're looking for examples of scrollable reveal.js decks here's a great one: <https://slides.com/news/scroll-mode/scroll>

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/scroll-view.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
