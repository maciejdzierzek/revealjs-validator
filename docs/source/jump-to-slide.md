# Jump to Slide <span class="r-version-badge coming">4.5.0</span>

You can skip ahead to a specific slide using reveal.js' jump-to-slide shortcut. Here's how it works:

1.  Press G to activate
2.  Type a slide number or id
3.  Press Enter to confirm

## Navigating to Slide Number

When jumping to a slide you can either enter numeric value or a string. If you provide a number reveal.js will navigate to the desired slide number. If you type a string, reveal.js will try to locate a slide with a matching `id` and navigate to it.

Here are a couple of examples of different input and their resulting navigation.

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Input</th>
<th style="text-align: left;">Result</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">5</td>
<td style="text-align: left;">Navigate to slide number 5</td>
</tr>
<tr>
<td style="text-align: left;">6/2</td>
<td style="text-align: left;">Navigate to horizontal slide 6, vertical slide 2</td>
</tr>
<tr>
<td style="text-align: left;">the-end</td>
<td style="text-align: left;">Navigate to a slide with this id (<code>&lt;section id="the-end"&gt;</code>)</td>
</tr>
</tbody>
</table>

## Disable Jump to Slide

Jump to Slide is enabled by default but if you want to turn it off you can set the `jumpToSlide` config value to `false`.

    Reveal.initialize({
      jumpToSlide: false,
    });

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/jump-to-slide.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
