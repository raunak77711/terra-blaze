# Hero montage footage — sources & licenses

All clips are free-license stock cinematography from Pexels (https://www.pexels.com/license/):
free for commercial use, no attribution required (credited here as good practice).
Each file was trimmed to ~7 s and re-encoded to 1080p H.264 for web performance.

| File        | Scene                        | Source                                                                                  |
|-------------|------------------------------|------------------------------------------------------------------------------------------|
| clip-01.mp4 | Sea of clouds at golden hour  | https://www.pexels.com/video/sea-of-clouds-and-mountains-during-golden-hour-6989014/    |
| clip-02.mp4 | Snowy mountain range, drone   | https://www.pexels.com/video/drone-footage-of-a-snowy-mountain-range-16003270/           |
| clip-03.mp4 | Green mountain forest, drone  | https://www.pexels.com/video/drone-footage-of-green-mountain-forest-5659187/             |
| clip-04.mp4 | Waterfall from a cliff        | https://www.pexels.com/video/a-waterfalls-cascading-from-a-mountain-cliff-2924583/       |
| clip-05.mp4 | River through forest, aerial  | https://www.pexels.com/video/an-aerial-view-of-a-river-flowing-through-a-forest-24837087/ |
| clip-06.mp4 | Drone over misty peak         | https://www.pexels.com/video/drone-flying-over-the-mountain-peak-4763824/                |

Two photographs in `assets/img/` are from Unsplash (https://unsplash.com/license — free for commercial use):

| File               | Scene                              | Source photo ID              |
|--------------------|------------------------------------|------------------------------|
| stupa-everest.jpg  | Stupa before the Everest range     | photo-1544735716-392fe2489ffa |
| boudhanath.jpg     | Boudhanath Stupa aerial, Kathmandu | photo-1611516491426-03025e6043c8 |

All other photographs are TerraBlaze's own trek imagery (optimized copies of `images/*`).

## Inner-page hero footage (`page-*.mp4`)

Client-supplied cinematic footage added July 2026, used as inner-page heroes:

| File               | Scene                          | Used on                    |
|--------------------|--------------------------------|----------------------------|
| page-peaks.mp4     | High Himalayan peaks           | treks.html                 |
| page-flags.mp4     | Prayer flags in the Himalaya   | trek-ebc.html              |
| page-annapurna.mp4 | Annapurna range                | trek-annapurna-circuit.html|
| page-greenery.mp4  | Green hills and forest         | trek-abc.html              |
| page-flag.mp4      | Nepal flag                     | about.html                 |

## Where the clips play (July 2026)

- **Homepage hero montage** (`index.html` + `js/hero-cinema.js`): clip-01 → 06
  in sequence. Phones stream the lighter reel (clip-01, 03, 06 only).
- **Trek card hover videos** (`index.html` + `treks.html`):
  ABC → page-greenery, Annapurna Circuit → page-flags, Manaslu → clip-06,
  Langtang → clip-03, EBC → clip-02, Chitwan (treks.html) → clip-05.

The old root-level `hero-annapurna.mp4`, `hero-mountain.mp4` and
`videotrek.mp4` were removed on 2026-07-19 (recoverable from git history).
