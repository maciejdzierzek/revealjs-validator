# Upgrading From Version 5 to 6.0

reveal.js 6.0 switches from gulp to [Vite](https://vite.dev/) for building and running the development server. After pulling the latest changes, run `npm install` to get the updated dependencies. The dev server is still started with `npm start`.

### Update ES Module Paths

The ES module build has been renamed from `.esm.js` to `.mjs`. Update any direct file references:

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Old path</th>
<th style="text-align: left;">New path</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">dist/reveal.esm.js</td>
<td style="text-align: left;">dist/reveal.mjs</td>
</tr>
<tr>
<td style="text-align: left;">plugin/markdown/markdown.esm.js</td>
<td style="text-align: left;">dist/plugin/markdown.mjs</td>
</tr>
<tr>
<td style="text-align: left;">plugin/highlight/highlight.esm.js</td>
<td style="text-align: left;">dist/plugin/highlight.mjs</td>
</tr>
<tr>
<td style="text-align: left;">plugin/math/math.esm.js</td>
<td style="text-align: left;">dist/plugin/math.mjs</td>
</tr>
<tr>
<td style="text-align: left;">plugin/notes/notes.esm.js</td>
<td style="text-align: left;">dist/plugin/notes.mjs</td>
</tr>
<tr>
<td style="text-align: left;">plugin/search/search.esm.js</td>
<td style="text-align: left;">dist/plugin/search.mjs</td>
</tr>
<tr>
<td style="text-align: left;">plugin/zoom/zoom.esm.js</td>
<td style="text-align: left;">dist/plugin/zoom.mjs</td>
</tr>
</tbody>
</table>

If you're importing reveal.js as an npm package, use the bare package specifiers instead and let the package exports handle resolution:

    import Reveal from 'reveal.js';
    import Markdown from 'reveal.js/plugin/markdown';

### Update Plugin Paths (HTML/CDN)

If you load plugins directly in HTML or via CDN, the plugin files have moved from `plugin/<name>/plugin.js` into the `dist/plugin/` directory:

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Old path</th>
<th style="text-align: left;">New path</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">plugin/notes/notes.js</td>
<td style="text-align: left;">dist/plugin/notes.js</td>
</tr>
<tr>
<td style="text-align: left;">plugin/markdown/markdown.js</td>
<td style="text-align: left;">dist/plugin/markdown.js</td>
</tr>
<tr>
<td style="text-align: left;">plugin/highlight/highlight.js</td>
<td style="text-align: left;">dist/plugin/highlight.js</td>
</tr>
<tr>
<td style="text-align: left;">plugin/math/math.js</td>
<td style="text-align: left;">dist/plugin/math.js</td>
</tr>
<tr>
<td style="text-align: left;">plugin/search/search.js</td>
<td style="text-align: left;">dist/plugin/search.js</td>
</tr>
<tr>
<td style="text-align: left;">plugin/zoom/zoom.js</td>
<td style="text-align: left;">dist/plugin/zoom.js</td>
</tr>
<tr>
<td style="text-align: left;">plugin/highlight/monokai.css</td>
<td style="text-align: left;">dist/plugin/highlight/monokai.css</td>
</tr>
<tr>
<td style="text-align: left;">plugin/highlight/zenburn.css</td>
<td style="text-align: left;">dist/plugin/highlight/zenburn.css</td>
</tr>
</tbody>
</table>

### Update CSS Paths (npm)

When importing via npm, the `dist/` prefix is no longer part of the public package API. Update any CSS imports to use the top-level package paths:

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Old path</th>
<th style="text-align: left;">New path</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">reveal.js/dist/reveal.css</td>
<td style="text-align: left;">reveal.js/reveal.css</td>
</tr>
<tr>
<td style="text-align: left;">reveal.js/dist/reset.css</td>
<td style="text-align: left;">reveal.js/reset.css</td>
</tr>
<tr>
<td style="text-align: left;">reveal.js/dist/theme/&lt;name&gt;.css</td>
<td style="text-align: left;">reveal.js/theme/&lt;name&gt;.css</td>
</tr>
</tbody>
</table>

### TypeScript Types

TypeScript types are now bundled directly in the reveal.js package. If you were previously installing `@types/reveal.js` as a dev dependency you can remove it:

    npm uninstall @types/reveal.js

The bundled types are independent from the community-maintained `@types/reveal.js`. If you were using those types, here's how the types map:

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">@types/reveal.js</th>
<th style="text-align: left;">reveal.js 6.0</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Reveal.Api</td>
<td style="text-align: left;">RevealApi</td>
</tr>
<tr>
<td style="text-align: left;">Reveal.Options</td>
<td style="text-align: left;">RevealConfig</td>
</tr>
<tr>
<td style="text-align: left;">Reveal.PluginDefinition</td>
<td style="text-align: left;">RevealPlugin</td>
</tr>
</tbody>
</table>

------------------------------------------------------------------------

# Upgrading From Version 3 to 4.0

We make a strong effort to avoid breaking changes but there are a couple in version 4.0. If you want to migrate an existing presentation follow these instructions.

### Update Asset Locations

Our JS and CSS assets have moved. In your presentation HTML, update the following `<script>` and `<link>` paths:

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Old location</th>
<th style="text-align: left;">New location</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">js/reveal.js</td>
<td style="text-align: left;">dist/reveal.js</td>
</tr>
<tr>
<td style="text-align: left;">css/reset.css</td>
<td style="text-align: left;">dist/reset.css</td>
</tr>
<tr>
<td style="text-align: left;">css/reveal.css</td>
<td style="text-align: left;">dist/reveal.css</td>
</tr>
<tr>
<td style="text-align: left;">css/theme/&lt;theme-name&gt;.css</td>
<td style="text-align: left;">dist/theme/&lt;theme-name&gt;.css</td>
</tr>
<tr>
<td style="text-align: left;">lib/css/monokai.css</td>
<td style="text-align: left;">plugin/highlight/monokai.css</td>
</tr>
<tr>
<td style="text-align: left;">lib/js/head.min.js</td>
<td style="text-align: left;">Deleted in 3.8.0</td>
</tr>
</tbody>
</table>

### Remove Print CSS from `<head>`

In your presentation HTML, remove the following script from the `<head>`. These styles are now baked into the reveal.css file.

    <script>
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = window.location.search.match(/print-pdf/gi)
        ? 'css/print/pdf.css'
        : 'css/print/paper.css';
      document.getElementsByTagName('head')[0].appendChild(link);
    </script>

### Plugin Registration

If you keep a copy of the v3 /plugin directory there are *no breaking changes*. If you want to switch to the latest plugin versions, you'll need to update your `Reveal.initialize()` call to use the [new plugin registration syntax](/plugins/). Plugins are also available as ES modules.

    <script src="dist/reveal.js"></script>
    <script src="plugin/markdown/markdown.js"></script>
    <script src="plugin/highlight/highlight.js"></script>
    <script>
      Reveal.initialize({
        plugins: [RevealMarkdown, RevealHighlight],
      });
    </script>

### Removed Multiplex and Notes Server

The Multiplex and Notes Server plugins have moved out of reveal.js core to their own repositories. See their corresponding README's for usage instructions.

- <https://github.com/reveal/multiplex>
- <https://github.com/reveal/notes-server>

### Other

- Removed `Reveal.navigateTo`, use `Reveal.slide` instead.
- We've switched build systems to gulp & rollup. Make sure to `npm install` to get the latest dependencies. The server is still started with `npm start`, just like before.

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/upgrading.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
