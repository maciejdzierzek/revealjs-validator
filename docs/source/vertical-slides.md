# Vertical Slides

Your slides are stepped between using a horizontal sliding transition by default. These horizontal slides are considered the main, or *top-level*, slides in your deck.

It's also possible to nest multiple slides within a single top-level slide to create a vertical stack. This is a great way to logically group content in your presentation and makes it convenient to include optional slides.

When presenting, you use the left/right arrows to step through the top-level (horizontal) slides. When you arrive at a vertical stack you can optionally press the up/down arrows to view the vertical slides or skip past them by pressing the right arrow. Here's an example showing a bird's-eye view of what this looks like in action.

![Slide layout with vertical slides](https://static.slid.es/support/reveal.js-vertical-slides.gif)

## Markup

Here's what the markup looks like for a simple vertical stack.

    <section>Horizontal Slide</section>
    <section>
      <section>Vertical Slide 1</section>
      <section>Vertical Slide 2</section>
    </section>

Horizontal Slide

Vertical Slide 1

Vertical Slide 2

## Navigation Mode

You can fine tune the reveal.js navigation behavior by using the `navigationMode` config option. Note that these options are only useful for presentations that use a mix of horizontal and vertical slides. The following navigation modes are available:

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;">Value</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">default</td>
<td style="text-align: left;">Left/right arrow keys step between horizontal slides. Up/down arrow keys step between vertical slides. Space key steps through all slides (both horizontal and vertical).</td>
</tr>
<tr>
<td style="text-align: left;">linear</td>
<td style="text-align: left;">Removes the up/down arrows. Left/right arrows step through all slides (both horizontal and vertical).</td>
</tr>
<tr>
<td style="text-align: left;">grid</td>
<td style="text-align: left;">When this is enabled, stepping left/right from a vertical stack to an adjacent vertical stack will land you at the same vertical index.<br />
<br />
Consider a deck with six slides ordered in two vertical stacks:<br />
<code>1.1</code>    <code>2.1</code><br />
<code>1.2</code>    <code>2.2</code><br />
<code>1.3</code>    <code>2.3</code><br />
<br />
If you're on slide 1.3 and navigate right, you will normally move from 1.3 -&gt; 2.1. With navigationMode set to "grid" the same navigation takes you from 1.3 -&gt; 2.3.</td>
</tr>
</tbody>
</table>

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/vertical-slides.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
