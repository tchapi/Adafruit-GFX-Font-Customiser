Adafruit GFX Pixel font customiser
---

This is a handy utility that goes well with the original [fontconvert](https://github.com/adafruit/Adafruit-GFX-Library/tree/master/fontconvert) tool provided by [Adafruit](https://www.adafruit.com/) for converting TTF fonts to Adafruit_GFX `.h` format.

Just paste the content of a `.h` font file, extract the glyphs, and you can edit them one by one by flipping the individual pixels for each glyphs, changing the advance, offset, or modifying the baseline.

You can then process our changes and create the improved file.

This is useful since the fontconvert utility does not always create all the characters correctly (a missing pixel here and there). It works best for small size fonts (< 12pt).


## Contributors

<img src="https://avatars1.githubusercontent.com/u/593209?s=460&v=4" width="50px;"/> [Chris Marrin](https://github.com/cmarrin) — added baseline, advance and offset support.

<img src="https://avatars2.githubusercontent.com/u/16524809?s=460&v=4" width="50px;"/> [thelevelofdetail](https://github.com/thelevelofdetail) — fixes for negative xOffsets

<img src="https://avatars1.githubusercontent.com/u/8611652?s=460&v=4" width="50px;"/> [Billy Donahue](https://github.com/BillyDonahue) — fixes for xadvance clipping when using _oblique_ fonts

<img src="https://avatars1.githubusercontent.com/u/325326?s=460&v=4" width="50px;"/> [Mats Engstrom](https://github.com/SmallRoomLabs) — fixes to allow generating a range of glyphs

<img src="https://avatars.githubusercontent.com/u/2691293?s=400&v=4" width="50px;"/> [Christof Arnosti](https://github.com/charno) — fixes to allow adding characters, improvements for disabled characters

## License

MIT. See licence file.