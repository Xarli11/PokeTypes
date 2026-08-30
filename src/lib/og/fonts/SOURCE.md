Static-weight, Latin-subset instances of Syne, Outfit, and JetBrains Mono
(all OFL-1.1, from the [google/fonts](https://github.com/google/fonts) repo),
built with `fonttools varLib.instancer` + `fonttools subset` for the social
card renderer (`src/lib/og`). Not used anywhere else — the app's live UI
loads the full families from Google Fonts CDN (see `src/layouts/Layout.astro`).

## Licensing

Each family ships under the SIL Open Font License 1.1, copied verbatim
from the same `google/fonts` source next to its `.ttf` here:
`Syne-OFL.txt`, `Outfit-OFL.txt`, `JetBrainsMono-OFL.txt`. The OFL permits
modifying and redistributing a font (subsetting and re-instancing weights
both qualify) as long as it isn't sold on its own and the *Reserved Font
Name* isn't used to imply endorsement — neither applies to embedding these
subsets inside this app's binary output. Each `.ttf` here is a derivative
work under the same OFL-1.1 terms as its source; the license file is kept
alongside it per the OFL's own redistribution requirement, rather than
only in a top-level `LICENSE`, so it travels with the specific binaries it
covers.

Regenerate if a new weight/character is needed:

```bash
curl -sL "https://github.com/google/fonts/raw/main/ofl/<family>/<Family>%5Bwght%5D.ttf" -o Variable.ttf
python3 -m fontTools.varLib.instancer -q -o Weight.ttf Variable.ttf wght=<weight>
python3 -m fontTools.subset Weight.ttf \
  --unicodes="U+0020-007E,U+00A0-00FF,U+00D7,U+00BD,U+00BC,U+215B,U+2013,U+2014,U+2018-201F,U+2022" \
  --layout-features='*' --no-hinting --output-file=Weight-subset.ttf
```
