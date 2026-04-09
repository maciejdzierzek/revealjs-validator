# Lightbox <span class="r-version-badge new">5.2.0</span>

A lightbox is a modal that displays an image or video in a full-screen overlay. It's great for things like clicking on thumbnails to view a larger [image](#image-lightbox) or [video](#video-lightbox).

## Image Lightbox

The simplest way to trigger a lightbox in reveal.js is to add the `data-preview-image` attribute to an `img` tag. Clicking on the image below, will open the same image in an overlay.

    <img src="reveal.png" data-preview-image>

<img src="/images/logo/reveal-black-text-sticker.png" data-preview-image="" width="400" />

Lightboxes aren't limited to opening the image src. You can open any image you like by assigning a value to the `data-preview-image` attribute.

    <img src="reveal.png" data-preview-image="mastering.svg">

<img src="/images/logo/reveal-black-text-sticker.png" data-preview-image="/images/docs/mastering.svg" width="400" />

## Video Lightbox

Video lightboxes work the same way as image lightboxes except you use the `data-preview-video` attribute instead.

    <video src="video.mp4" data-preview-video></video>
    <img src="reveal.png" data-preview-video="video.mp4">

<img src="/images/logo/reveal-black-text-sticker.png" data-preview-video="https://static.slid.es/site/homepage/v1/homepage-video-editor.mp4" width="400" />

## Lightbox Media Size

The sizing of media in the lightbox can be controlled using the `data-preview-fit` attribute. The following fit modes are supported:

<table>
<thead>
<tr>
<th style="text-align: left;">Value</th>
<th style="text-align: left;">Effect</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">scale-down (default)</td>
<td style="text-align: left;">Scale media down if needed to fit in the lightbox.</td>
</tr>
<tr>
<td style="text-align: left;">contain</td>
<td style="text-align: left;">Scale media up and down to fit the lightbox without cropping.</td>
</tr>
<tr>
<td style="text-align: left;">cover</td>
<td style="text-align: left;">Scale media to cover the entire lightbox, even if some of it is cut off.</td>
</tr>
</tbody>
</table>

    <img src="reveal.png" data-preview-image data-preview-fit="cover">

<img src="/images/logo/reveal-white-text.svg" data-preview-image="" data-preview-fit="cover" width="400" />

## Works on Any Element

Note that the lightbox feature works on any element, not just images and videos. For example, you can trigger an image or video lightbox from clicking a button or link.

    <a data-preview-image="image.png">📸 Open Logo</a>
    <button data-preview-video="video.mp4">🎥 Open Video</button>

<span preview-image="/images/logo/reveal-black-text-sticker.png">📸 Open Logo</span>  
  

🎥 Open Video

## Iframe Lightbox

It's possible to preview links in iframe lightboxes using the `data-preview-link` attribute. When this attribute is added to an `<a>` tag, reveal.js will automatically open the link's `href` in an iframe.

If you want to open an iframe lightbox from another element, you can set the iframe source as a value to the `data-preview-link` attribute.

    <a href="https://hakim.se" data-preview-link>Open Hakim's Website</a>
    <img src="reveal.png" data-preview-link="https://hakim.se">

<a href="https://hakim.se" data-preview-link="">Open Hakim's Website</a>  
  
<img src="/images/logo/reveal-black-text-sticker.png" data-preview-link="https://hakim.se" width="400" />

Note that this will only work if the link allows for embedding. Many websites prevent embedding via `x-frame-options` or `Content-Security-Policy`.

<a href="https://twitter.com/hakimel" class="p-2 text-pink-700 hover:text-pink-900 mr-auto">Created by @hakimel</a> <a href="https://twitter.com/revealjs" class="p-2 text-pink-700 hover:text-pink-900">X (Twitter)</a> <a href="https://github.com/hakimel/reveal.js" class="p-2 text-pink-700 hover:text-pink-900">GitHub</a> <a href="https://github.com/reveal/revealjs.com/tree/master/./src/lightbox.md" class="p-2 text-pink-700 hover:text-pink-900">Edit this page</a>
