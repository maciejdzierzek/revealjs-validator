# Slide Backgrounds

Slides are contained within a limited portion of the screen by default to allow them to fit any display and scale uniformly. You can apply full page backgrounds outside of the slide area by adding a `data-background` attribute to your `<section>` elements. Four different types of backgrounds are supported: color, image, video and iframe.

## Color Backgrounds

All CSS color formats are supported, including hex values, keywords, `rgba()` or `hsl()`.

    <section data-background-color="aquamarine">
      <h2>🍦</h2>
    </section>
    <section data-background-color="rgb(70, 70, 255)">
      <h2>🍰</h2>
    </section>

## 🍦

## 🍰

## Gradient Backgrounds

All CSS gradient formats are supported, including `linear-gradient`, `radial-gradient` and `conic-gradient`.

    <section data-background-gradient="linear-gradient(to bottom, #283b95, #17b2c3)">
      <h2>🐟</h2>
    </section>
    <section data-background-gradient="radial-gradient(#283b95, #17b2c3)">
      <h2>🐳</h2>
    </section>

## 🐟

## 🐳

## Image Backgrounds

By default, background images are resized to cover the full page. Available options:

<table class="nowrap-1st">
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;">Attribute</th>
<th style="text-align: left;">Default
<div style="width:80px">
&#10;</div></th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">data-background-image</td>
<td style="text-align: left;"></td>
<td style="text-align: left;">URL of the image to show. GIFs restart when the slide opens.</td>
</tr>
<tr>
<td style="text-align: left;">data-background-size</td>
<td style="text-align: left;">cover</td>
<td style="text-align: left;">See <a href="https://developer.mozilla.org/docs/Web/CSS/background-size">background-size</a> on MDN.</td>
</tr>
<tr>
<td style="text-align: left;">data-background-position</td>
<td style="text-align: left;">center</td>
<td style="text-align: left;">See <a href="https://developer.mozilla.org/docs/Web/CSS/background-position">background-position</a> on MDN.</td>
</tr>
<tr>
<td style="text-align: left;">data-background-repeat</td>
<td style="text-align: left;">no-repeat</td>
<td style="text-align: left;">See <a href="https://developer.mozilla.org/docs/Web/CSS/background-repeat">background-repeat</a> on MDN.</td>
</tr>
<tr>
<td style="text-align: left;">data-background-opacity</td>
<td style="text-align: left;">1</td>
<td style="text-align: left;">Opacity of the background image on a 0-1 scale. 0 is transparent and 1 is fully opaque.</td>
</tr>
</tbody>
</table>

    <section data-background-image="http://example.com/image.png">
      <h2>Image</h2>
    </section>
    <section data-background-image="http://example.com/image.png"
              data-background-size="100px" data-background-repeat="repeat">
      <h2>This background image will be sized to 100px and repeated</h2>
    </section>

## Video Backgrounds

Automatically plays a full size video behind the slide.

<table class="nowrap-1st">
<thead>
<tr>
<th style="text-align: left;">Attribute</th>
<th style="text-align: left;">Default</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">data-background-video</td>
<td style="text-align: left;"></td>
<td style="text-align: left;">A single video source, or a comma separated list of video sources.</td>
</tr>
<tr>
<td style="text-align: left;">data-background-video-loop</td>
<td style="text-align: left;">false</td>
<td style="text-align: left;">Flags if the video should play repeatedly.</td>
</tr>
<tr>
<td style="text-align: left;">data-background-video-muted</td>
<td style="text-align: left;">false</td>
<td style="text-align: left;">Flags if the audio should be muted.</td>
</tr>
<tr>
<td style="text-align: left;">data-background-size</td>
<td style="text-align: left;">cover</td>
<td style="text-align: left;">Use <code>cover</code> for full screen and some cropping or <code>contain</code> for letterboxing.</td>
</tr>
<tr>
<td style="text-align: left;">data-background-opacity</td>
<td style="text-align: left;">1</td>
<td style="text-align: left;">Opacity of the background video on a 0-1 scale. 0 is transparent and 1 is fully opaque.</td>
</tr>
</tbody>
</table>

    <section data-background-video="https://static.slid.es/site/homepage/v1/homepage-video-editor.mp4"
              data-background-video-loop data-background-video-muted>
      <h2>Video</h2>
    </section>

## Video

## Iframe Backgrounds

Embeds a web page as a slide background that covers 100% of the reveal.js width and height. The iframe is in the background layer, behind your slides, and as such it's not possible to interact with it by default. To make your background interactive, you can add the `data-background-interactive` attribute.

<table class="nowrap-1st">
<thead>
<tr>
<th style="text-align: left;">Attribute</th>
<th style="text-align: left;">Default</th>
<th style="text-align: left;">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">data-background-iframe</td>
<td style="text-align: left;"></td>
<td style="text-align: left;">URL of the iframe to load</td>
</tr>
<tr>
<td style="text-align: left;">data-background-interactive</td>
<td style="text-align: left;">false</td>
<td style="text-align: left;">Include this attribute to make it possible to interact with the iframe contents. Enabling this will prevent interaction with the slide content.</td>
</tr>
</tbody>
</table>

    <section data-background-iframe="https://slides.com"
              data-background-interactive>
      <h2>Iframe</h2>
    </section>

Iframes are lazy-loaded when they become visible. If you'd like to preload iframes ahead of time, you can append a `data-preload` attribute to the slide `<section>`. You can also enable preloading globally for all iframes using the `preloadIframes` configuration option.

## Background Transitions

We'll use a cross fade to transition between slide backgrounds by default. This can be changed using the [`backgroundTransition`](/transitions/#background-transitions) config option.

## Parallax Background

If you want to use a parallax scrolling background, set the first two properties below when initializing reveal.js (the other two are optional).

    Reveal.initialize({
      // Parallax background image
      parallaxBackgroundImage: '', // e.g. "https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg"

      // Parallax background size
      parallaxBackgroundSize: '', // CSS syntax, e.g. "2100px 900px" - currently only pixels are supported (don't use % or auto)

      // Number of pixels to move the parallax background per slide
      // - Calculated automatically unless specified
      // - Set to 0 to disable movement along an axis
      parallaxBackgroundHorizontal: 200,
      parallaxBackgroundVertical: 50
    });

Make sure that the background size is much bigger than screen size to allow for some scrolling. [View example](/demo?parallaxBackgroundImage=https%3A%2F%2Fs3.amazonaws.com%2Fhakim-static%2Freveal-js%2Freveal-parallax-1.jpg&parallaxBackgroundSize=2100px%20900px).

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/backgrounds.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
