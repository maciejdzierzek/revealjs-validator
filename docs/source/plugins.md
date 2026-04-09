# Plugins

Plugins can be used to extend reveal.js with additional functionality. To make use of a plugin, you'll need to do two things:

1.  Include the plugin script in the document. (Some plugins may require styles as well.)
2.  Tell reveal.js about the plugin by including it in the `plugins` array when initializing.

Here's an example:

    <script src="dist/plugin/markdown.js"></script>
    <script>
      Reveal.initialize({
        plugins: [RevealMarkdown],
      });
    </script>

If you're using ES modules, we also provide module exports for all built-in plugins:

    <script type="module">
      import Reveal from 'dist/reveal.mjs';
      import Markdown from 'dist/plugin/markdown.mjs';
      Reveal.initialize({
        plugins: [Markdown],
      });
    </script>

## Built-in Plugins

A few common plugins which add support for [Markdown](/markdown/), [code highlighting](/code/) and [speaker notes](/speaker-view/) are included in our default [presentation boilerplate](https://github.com/hakimel/reveal.js/blob/master/index.html).

These plugins are distributed together with the reveal.js repo. Here's a complete list of all built-in plugins.

<table class="key-value">
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;">Name</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">RevealHighlight</td>
<td style="text-align: left;">Syntax highlighted <a href="/code/">code</a>.<br />
<span class="text-gray-600">dist/plugin/highlight.js</span></td>
</tr>
<tr>
<td style="text-align: left;">RevealMarkdown</td>
<td style="text-align: left;">Write content using <a href="/markdown/">Markdown</a>.<br />
<span class="text-gray-600">dist/plugin/markdown.js</span></td>
</tr>
<tr>
<td style="text-align: left;">RevealSearch</td>
<td style="text-align: left;">Press CTRL+Shift+F to search slide content.<br />
<span class="text-gray-600">dist/plugin/search.js</span></td>
</tr>
<tr>
<td style="text-align: left;">RevealNotes</td>
<td style="text-align: left;">Show a <a href="/speaker-view/">speaker view</a> in a separate window.<br />
<span class="text-gray-600">dist/plugin/notes.js</span></td>
</tr>
<tr>
<td style="text-align: left;">RevealMath</td>
<td style="text-align: left;">Render <a href="/math/">math equations</a>.<br />
<span class="text-gray-600">dist/plugin/math.js</span></td>
</tr>
<tr>
<td style="text-align: left;">RevealZoom</td>
<td style="text-align: left;">Alt+click to zoom in on elements (CTRL+click in Linux).<br />
<span class="text-gray-600">dist/plugin/zoom.js</span></td>
</tr>
</tbody>
</table>

All of the above are available as ES modules under `dist/plugin/` with a `.mjs` extension (e.g. `dist/plugin/markdown.mjs`).

## API

We provide API methods for checking which plugins that are currently registered. It's also possible to retrieve a reference to any registered plugin instance if you want to manually call a method on them.

    import Reveal from 'dist/reveal.mjs';
    import Markdown from 'dist/plugin/markdown.mjs';
    import Highlight from 'dist/plugin/highlight.mjs';

    Reveal.initialize({ plugins: [Markdown, Highlight] });

    Reveal.hasPlugin('markdown');
    // true

    Reveal.getPlugin('markdown');
    // { id: "markdown", init: ... }

    Reveal.getPlugins();
    // {
    //   markdown: { id: "markdown", init: ... },
    //   highlight: { id: "highlight", init: ... }
    // }

## Dependencies <span class="r-version-badge deprecated">4.0.0</span>

This functionality is left in for backwards compatibility but has been deprecated as of reveal.js 4.0.0. In older versions we used a built-in dependency loader to load plugins. We moved away from this because how scripts are best loaded and bundled may vary greatly depending on use case. If you need to load a dependency, include it using a `<script defer>` tag instead.

Dependencies are loaded in the order they appear.

    Reveal.initialize({
      dependencies: [
        { src: 'dist/plugin/markdown.js', condition: () => {
            return !!document.querySelector( ’[data-markdown]’ );
        } },
        { src: 'dist/plugin/highlight.js', async: true }
      ]
    });

The following properties are available for each dependency object:

- **src**: Path to the script to load
- **async**: \[optional\] Flags if the script should load after reveal.js has started, defaults to false
- **callback**: \[optional\] Function to execute when the script has loaded
- **condition**: \[optional\] Function which must return true for the script to be loaded

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/plugins.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
