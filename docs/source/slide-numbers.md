# Slide Numbers

You can display the page number of the current slide by setting the `slideNumber` config option to `true`.

    Reveal.initialize({ slideNumber: true });

Slide 1

Slide 2

## Format

The slide number format can be customized by setting `slideNumber` to one of the following values.

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Value</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">h.v</td>
<td style="text-align: left;">Horizontal . Vertical slide number (default)</td>
</tr>
<tr>
<td style="text-align: left;">h/v</td>
<td style="text-align: left;">Horizontal / Vertical slide number</td>
</tr>
<tr>
<td style="text-align: left;">c</td>
<td style="text-align: left;">Flattened slide number, including both horizontal and vertical slides</td>
</tr>
<tr>
<td style="text-align: left;">c/t</td>
<td style="text-align: left;">Flattened slide number / total slides</td>
</tr>
</tbody>
</table>

    Reveal.initialize({ slideNumber: 'c/t' });

Slide 1

Slide 2

If none of the existing formats are to your liking, you can provide a custom slide number generator.

    Reveal.initialize({
      slideNumber: (slide) => {
        // Ignore numbering of vertical slides
        return [Reveal.getIndices(slide).h];
      },
    });

## Context

When slide numbers are enabled, they will be included in all contexts by default. If you only want to show slide numbers in a specific context you can set `showSlideNumber` to one of the following:

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Value</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">all</td>
<td style="text-align: left;">Show slide numbers in all contexts (default)</td>
</tr>
<tr>
<td style="text-align: left;">print</td>
<td style="text-align: left;">Only show slide numbers when printing to PDF</td>
</tr>
<tr>
<td style="text-align: left;">speaker</td>
<td style="text-align: left;">Only show slide numbers in the speaker view</td>
</tr>
</tbody>
</table>

    Reveal.initialize({ showSlideNumber: 'print' });

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/slide-numbers.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
