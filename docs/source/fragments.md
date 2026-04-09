# Fragments

Fragments are used to highlight or incrementally reveal individual elements on a slide. Every element with the class `fragment` will be stepped through before moving on to the next slide.

The default fragment style is to start out invisible and fade in. This style can be changed by appending a different class to the fragment.

    <p class="fragment">Fade in</p>
    <p class="fragment fade-out">Fade out</p>
    <p class="fragment highlight-red">Highlight red</p>
    <p class="fragment fade-in-then-out">Fade in, then out</p>
    <p class="fragment fade-up">Slide up while fading in</p>

Fade in

Fade out

Highlight red

Fade in, then out

Slide up while fading in

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Name</th>
<th style="text-align: left;">Effect</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">fade-out</td>
<td style="text-align: left;">Start visible, fade out</td>
</tr>
<tr>
<td style="text-align: left;">fade-up</td>
<td style="text-align: left;">Slide up while fading in</td>
</tr>
<tr>
<td style="text-align: left;">fade-down</td>
<td style="text-align: left;">Slide down while fading in</td>
</tr>
<tr>
<td style="text-align: left;">fade-left</td>
<td style="text-align: left;">Slide left while fading in</td>
</tr>
<tr>
<td style="text-align: left;">fade-right</td>
<td style="text-align: left;">Slide right while fading in</td>
</tr>
<tr>
<td style="text-align: left;">fade-in-then-out</td>
<td style="text-align: left;">Fades in, then out on the next step</td>
</tr>
<tr>
<td style="text-align: left;">current-visible</td>
<td style="text-align: left;">Fades in, then out on the next step</td>
</tr>
<tr>
<td style="text-align: left;">fade-in-then-semi-out</td>
<td style="text-align: left;">Fades in, then to 50% on the next step</td>
</tr>
<tr>
<td style="text-align: left;">grow</td>
<td style="text-align: left;">Scale up</td>
</tr>
<tr>
<td style="text-align: left;">semi-fade-out</td>
<td style="text-align: left;">Fade out to 50%</td>
</tr>
<tr>
<td style="text-align: left;">shrink</td>
<td style="text-align: left;">Scale down</td>
</tr>
<tr>
<td style="text-align: left;">strike</td>
<td style="text-align: left;">Strike through</td>
</tr>
<tr>
<td style="text-align: left;">highlight-red</td>
<td style="text-align: left;">Turn text red</td>
</tr>
<tr>
<td style="text-align: left;">highlight-green</td>
<td style="text-align: left;">Turn text green</td>
</tr>
<tr>
<td style="text-align: left;">highlight-blue</td>
<td style="text-align: left;">Turn text blue</td>
</tr>
<tr>
<td style="text-align: left;">highlight-current-red</td>
<td style="text-align: left;">Turn text red, then back to original on next step</td>
</tr>
<tr>
<td style="text-align: left;">highlight-current-green</td>
<td style="text-align: left;">Turn text green, then back to original on next step</td>
</tr>
<tr>
<td style="text-align: left;">highlight-current-blue</td>
<td style="text-align: left;">Turn text blue, then back to original on next step</td>
</tr>
</tbody>
</table>

## Custom Fragments <span class="r-version-badge new">4.5.0</span>

Custom effects can be implemented by defining CSS styles for `.fragment.effectname` and `.fragment.effectname.visible` respectively. The `visible` class is added to each fragment as they are stepped through in the presentation.

For example, the following defines a fragment style where elements are initially blurred but become focused when stepped through.

    <style>
      .fragment.blur {
        filter: blur(5px);
      }
      .fragment.blur.visible {
        filter: none;
      }
    </style>
    <section>
      <p class="fragment custom blur">One</p>
      <p class="fragment custom blur">Two</p>
      <p class="fragment custom blur">Three</p>
    </section>

One

Two

Three

Note that we are adding a `custom` class to each fragment. This tells reveal.js to avoid applying its default fade-in fragment styles.

If you want all elements to remain blurred except the current fragment, you can substitute `visible` for `current-fragment`.

    .fragment.blur.current-fragment {
      filter: none;
    }

## Nested Fragments

Multiple fragments can be applied to the same element sequentially by wrapping it, this will fade in the text on the first step, turn it red on the second and fade out on the third.

    <span class="fragment fade-in">
      <span class="fragment highlight-red">
        <span class="fragment fade-out"> Fade in > Turn red > Fade out </span>
      </span>
    </span>

<span class="fragment fade-in"><span class="fragment highlight-red"><span class="fragment fade-out">Fade in &gt; Turn red &gt; Fade out</span></span></span>

## Fragment Order

By default fragments will be stepped through in the order that they appear in the DOM. This display order can be changed using the `data-fragment-index` attribute. Note that multiple elements can appear at the same index.

    <p class="fragment" data-fragment-index="3">Appears last</p>
    <p class="fragment" data-fragment-index="1">Appears first</p>
    <p class="fragment" data-fragment-index="2">Appears second</p>

Appears last

Appears first

Appears second

## Events

When a fragment is either shown or hidden reveal.js will dispatch an event.

    Reveal.on('fragmentshown', (event) => {
      // event.fragment = the fragment DOM element
    });
    Reveal.on('fragmenthidden', (event) => {
      // event.fragment = the fragment DOM element
    });

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/fragments.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
