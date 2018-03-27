Adafruit GFX Pixel font customiser
---

This is a handy utility that goes well with the original 'fontconvert' tool provided by Adafruit for converting TTF fonts to Adafruit_GFX `.h` format.

Just paste the content of a .h font file, extract the glyphs, and you can edit them one by one by flipping the individual pixels for each glyphs.

You can then process and create the improved file.

This is useful since the fontconvert utility does not always create all the characters correctly (a missing pixel here and there). It works best for small size fonts (< 12pt).


## Contributors

<img src="https://avatars1.githubusercontent.com/u/593209?s=460&v=4" width="50px;"/> [Chris Marrin](https://github.com/cmarrin) — added baseline, advance and offset support.

## License

MIT. See licence file.