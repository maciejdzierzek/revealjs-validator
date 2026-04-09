# Keyboard Bindings

If you're unhappy with any of the default keyboard bindings you can override them using the `keyboard` config option.

    Reveal.configure({
      keyboard: {
        27: () => { console.log('esc') }, // do something custom when ESC is pressed
        13: 'next', // go to the next slide when the ENTER key is pressed
        32: null // don't do anything when SPACE is pressed (i.e. disable a reveal.js default binding)
      }
    });

The keyboard object is a map of key codes and their corresponding *action*. The action can be of three different types.

<table class="key-value">
<thead>
<tr>
<th style="text-align: left;">Type</th>
<th style="text-align: left;">Action</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Function</td>
<td style="text-align: left;">Triggers a callback function.</td>
</tr>
<tr>
<td style="text-align: left;">String</td>
<td style="text-align: left;">Calls the given method name in the <a href="/api/">reveal.js API</a>.</td>
</tr>
<tr>
<td style="text-align: left;">null</td>
<td style="text-align: left;">Disables the key (blocks the default reveal.js action)</td>
</tr>
</tbody>
</table>

## Adding Keyboard Bindings via JavaScript

Custom key bindings can also be added and removed using Javascript. Custom key bindings will override the default keyboard bindings, but will in turn be overridden by the user defined bindings in the `keyboard` config option.

    Reveal.addKeyBinding(binding, callback);
    Reveal.removeKeyBinding(keyCode);

For example

    // The binding parameter provides the following properties
    //      keyCode: the keycode for binding to the callback
    //          key: the key label to show in the help overlay
    //  description: the description of the action to show in the help overlay
    Reveal.addKeyBinding(
      { keyCode: 84, key: 'T', description: 'Start timer' },
      () => {
        // start timer
      }
    );

    // The binding parameter can also be a direct keycode without providing the help description
    Reveal.addKeyBinding(82, () => {
      // reset timer
    });

This allows plugins to add key bindings directly to Reveal so they can:

- Make use of Reveal's pre-processing logic for key handling (for example, ignoring key presses when paused)
- Be included in the help overlay (optional)

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/keyboard.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
