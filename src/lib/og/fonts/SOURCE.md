Static-weight, Latin-subset instances of Syne, Outfit, and JetBrains Mono
(all OFL-1.1, from the [google/fonts](https://github.com/google/fonts) repo),
built with `fonttools varLib.instancer` + `fonttools subset` for the social
card renderer (`src/lib/og`). Not used anywhere else — the app's live UI
loads the full families from Google Fonts CDN (see `src/layouts/Layout.astro`).

Regenerate if a new weight/character is needed:

```bash
curl -sL "https://github.com/google/fonts/raw/main/ofl/<family>/<Family>%5Bwght%5D.ttf" -o Variable.ttf
python3 -m fontTools.varLib.instancer -q -o Weight.ttf Variable.ttf wght=<weight>
python3 -m fontTools.subset Weight.ttf \
  --unicodes="U+0020-007E,U+00A0-00FF,U+00D7,U+00BD,U+00BC,U+215B,U+2013,U+2014,U+2018-201F,U+2022" \
  --layout-features='*' --no-hinting --output-file=Weight-subset.ttf
```
