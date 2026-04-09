# Transitions

When navigating a presentation, we transition between slides by animating them from right to left by default. This transition can be changed by setting the `transition` config option to a valid [transition style](#styles). Transitions can also be overridden for a specific slide using the `data-transition` attribute.

    <section data-transition="zoom">
      <h2>This slide will override the presentation transition and zoom!</h2>
    </section>

    <section data-transition-speed="fast">
      <h2>Choose from three transition speeds: default, fast or slow!</h2>
    </section>

## Styles

This is a complete list of all available transition styles. They work for both slides and slide backgrounds.

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Name</th>
<th style="text-align: left;">Effect</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">none</td>
<td style="text-align: left;">Switch backgrounds instantly</td>
</tr>
<tr>
<td style="text-align: left;">fade</td>
<td style="text-align: left;">Cross fade — <em>default for background transitions</em></td>
</tr>
<tr>
<td style="text-align: left;">slide</td>
<td style="text-align: left;">Slide between backgrounds — <em>default for slide transitions</em></td>
</tr>
<tr>
<td style="text-align: left;">convex</td>
<td style="text-align: left;">Slide at a convex angle</td>
</tr>
<tr>
<td style="text-align: left;">concave</td>
<td style="text-align: left;">Slide at a concave angle</td>
</tr>
<tr>
<td style="text-align: left;">zoom</td>
<td style="text-align: left;">Scale the incoming slide up so it grows in from the center of the screen</td>
</tr>
</tbody>
</table>

## Separate In-Out Transitions

You can also use different in and out transitions for the same slide by appending `-in` or `-out` to the transition name.

    <section data-transition="slide">The train goes on …</section>
    <section data-transition="slide">and on …</section>
    <section data-transition="slide-in fade-out">and stops.</section>
    <section data-transition="fade-in slide-out">
      (Passengers entering and leaving)
    </section>
    <section data-transition="slide">And it starts again.</section>

The train goes on …

and on …

and stops.

(Passengers entering and leaving)

And it starts again.

## Background Transitions

We transition between slide backgrounds using a cross fade by default. This can be changed on a global level or overridden for specific slides. To change background transitions for all slides, use the `backgroundTransition` config option.

    Reveal.initialize({
      backgroundTransition: 'slide',
    });

Alternatively you can use the `data-background-transition` attribute on any `<section>` to override that specific transition.

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/transitions.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
