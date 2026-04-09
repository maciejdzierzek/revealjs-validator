# Creating a Plugin <span class="r-version-badge new">4.0.0</span>

We provide a lightweight specification and API for plugins. This is used by our default plugins like [code highlighting](/code/) and [Markdown](/markdown/) but can also be used to create your own plugins.

## Plugin Definition

Plugins are objects that contain the following properties.

<table class="key-value">
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;">Property</th>
<th style="text-align: left;">Value</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">id <span class="r-var-type">String</span></td>
<td style="text-align: left;">The plugins unique ID. This can be used to retrieve the plugin instance via <code>Reveal.getPlugin(&lt;id&gt;)</code>.</td>
</tr>
<tr>
<td style="text-align: left;">init <span class="r-var-type">Function</span></td>
<td style="text-align: left;">An optional function that is called when the plugin should run. It's invoked with one argument; a reference to the <a href="/api/">presentation instance</a> that the plugin was registered with.<br />
<br />
The init function can optionally return a <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promise</a>. If a Promise is returned, reveal.js will wait for it to resolve before the presentation finishes initialization and fires the <a href="/events/#ready">ready event</a>.</td>
</tr>
<tr>
<td style="text-align: left;">destroy <span class="r-var-type">Function</span></td>
<td style="text-align: left;">Optional function that is called when the reveal.js instance that this plugin is registered to is uninitialized.</td>
</tr>
</tbody>
</table>

Here's an example plugin which shuffles all slides in a presentation when the T key is pressed. Note that we export a function that returns a new plugin object. This is done because there may be [multiple presentation instances on the same page](/initialization/#multiple-presentations), and each should have their own instance of our plugin.

    // toaster.js
    export default () => ({
      id: 'toaster',
      init: (deck) => {
        deck.addKeyBinding({ keyCode: 84, key: 'T' }, () => {
          deck.shuffle();
          console.log('🍻');
        });
      },
    });

## Registering a Plugin

Plugins are registered by including them in the `plugins` array of the [config options](/config/). You can also register a plugin at runtime using `Reveal.registerPlugin( Plugin )`.

    import Reveal from 'reveal.js';
    import Toaster from 'toaster.js';

    Reveal.initialize({
      plugins: [Toaster],
    });

### Async Plugins

If your plugin needs to run asynchronous code before reveal.js finishes initializing it can return a Promise. Here's an example plugin that will delay initialization for three seconds.

    let WaitForIt = {
      id: 'wait-for-it',
      init: (deck) => {
        return new Promise((resolve) => setTimeout(resolve, 3000));
      },
    };

    Reveal.initialize({ plugins: [WaitForIt] }).then(() => {
      console.log('Three seconds later...');
    });

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/creating-plugins.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
