# Themes

The framework comes with a few different themes included.

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Name</th>
<th style="text-align: left;">Preview</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">black (default)</td>
<td style="text-align: left;"><img src="/images/docs/themes/black.png" width="150" height="150" alt="Black background, white text, blue links" /></td>
</tr>
<tr>
<td style="text-align: left;">white</td>
<td style="text-align: left;"><img src="/images/docs/themes/white.png" width="150" height="150" alt="White background, black text, blue links" /></td>
</tr>
<tr>
<td style="text-align: left;">league</td>
<td style="text-align: left;"><img src="/images/docs/themes/league.png" width="150" height="150" alt="Gray background, white text, blue links" /></td>
</tr>
<tr>
<td style="text-align: left;">beige</td>
<td style="text-align: left;"><img src="/images/docs/themes/beige.png" width="150" height="150" alt="Beige background, dark text, brown links" /></td>
</tr>
<tr>
<td style="text-align: left;">night</td>
<td style="text-align: left;"><img src="/images/docs/themes/night.png" width="150" height="150" alt="Black background, thick white text, orange links" /></td>
</tr>
<tr>
<td style="text-align: left;">serif</td>
<td style="text-align: left;"><img src="/images/docs/themes/serif.png" width="150" height="150" alt="Cappuccino background, gray text, brown links" /></td>
</tr>
<tr>
<td style="text-align: left;">simple</td>
<td style="text-align: left;"><img src="/images/docs/themes/simple.png" width="150" height="150" alt="White background, black text, blue links" /></td>
</tr>
<tr>
<td style="text-align: left;">solarized</td>
<td style="text-align: left;"><img src="/images/docs/themes/solarized.png" width="150" height="150" alt="Cream-colored background, dark green text, blue links" /></td>
</tr>
<tr>
<td style="text-align: left;">moon</td>
<td style="text-align: left;"><img src="/images/docs/themes/moon.png" width="150" height="150" alt="Dark blue background, thick grey text, blue links" /></td>
</tr>
<tr>
<td style="text-align: left;">dracula</td>
<td style="text-align: left;"><img src="/images/docs/themes/dracula.png" width="150" height="150" /></td>
</tr>
<tr>
<td style="text-align: left;">sky</td>
<td style="text-align: left;"><img src="/images/docs/themes/sky.png" width="150" height="150" alt="Blue background, thin dark text, blue links" /></td>
</tr>
<tr>
<td style="text-align: left;">blood</td>
<td style="text-align: left;"><img src="/images/docs/themes/blood.png" width="150" height="150" alt="Dark background, thick white text, red links" /></td>
</tr>
</tbody>
</table>

Each theme is available as a separate stylesheet. To change theme you will need to replace **black** below with your desired theme name in index.html:

    <link rel="stylesheet" href="dist/theme/black.css" />

## Custom Properties

All theme variables are exposed as CSS custom properties in the pseudo-class `:root`. See [the list of exposed variables](https://github.com/hakimel/reveal.js/blob/master/css/theme/template/exposer.scss).

## Creating a Theme

If you want to add a theme of your own see the instructions here: [/css/theme/README.md](https://github.com/hakimel/reveal.js/blob/master/css/theme/README.md).

Alternatively, if you want a clean start, you can opt to start from a blank CSS document and customize everything from the ground up.

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/themes.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
